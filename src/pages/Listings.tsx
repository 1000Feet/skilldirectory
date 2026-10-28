import { useState, useEffect, useRef } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { SEO } from "@/components/SEO";
import { getPageSEO } from "@/config/seoConfig";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { useDistance } from "@/hooks/useDistance";
import { GeocodingTest } from "@/components/GeocodingTest";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { ViewToggle } from "@/components/listings/ViewToggle";
import { MapView } from "@/components/listings/MapView";
import {
  Music,
  Palette,
  Utensils,
  Dog,
  Dumbbell,
  TreePine,
  Car,
  Target,
  Hammer,
  Waves
} from "lucide-react";

interface EducatorProfile {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  address: string;
  distance?: {
    miles: number;
    kilometers: number;
  } | null;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  const [educatorProfiles, setEducatorProfiles] = useState<EducatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const listingsRef = useRef<HTMLDivElement>(null);
  const { 
    calculateDistanceFromStudent, 
    loading: distanceLoading, 
    isAuthenticated, 
    studentAddress,
    refetchAddress 
  } = useDistance();
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in, refreshing data');
        refetchAddress();
        fetchEducatorProfiles();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    if (categoryFromUrl) {
      fetchEducatorProfiles();
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    fetchEducatorProfiles();
  }, [selectedCategory, isAuthenticated, currentPage]);

  const fetchEducatorProfiles = async (searchTerm?: string) => {
    try {
      setLoading(true);
      
      // Calculate pagination range
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      // First, get count for pagination
      let countQuery = supabase
        .from('educator_profiles')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .not('image', 'is', null)
        .not('name', 'is', null)
        .not('name', 'eq', '');
        
      if (selectedCategory) {
        countQuery = countQuery.contains('categories', [selectedCategory]);
      }
      
      const termToSearch = searchTerm !== undefined ? searchTerm : searchQuery;
      if (termToSearch.trim()) {
        countQuery = countQuery.or(
          `name.ilike.%${termToSearch.trim()}%,` +
          `description.ilike.%${termToSearch.trim()}%,` +
          `categories.cs.{"${termToSearch.trim()}"}`
        );
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
      
      // Now fetch the paginated data
      let query = supabase
        .from('educator_profiles')
        .select('id, name, description, image, categories, address, is_active')
        .eq('is_active', true)
        .not('image', 'is', null)
        .not('name', 'is', null)
        .not('name', 'eq', '')
        .range(from, to);

      if (selectedCategory) {
        query = query.contains('categories', [selectedCategory]);
      }

      if (termToSearch.trim()) {
        query = query.or(
          `name.ilike.%${termToSearch.trim()}%,` +
          `description.ilike.%${termToSearch.trim()}%,` +
          `categories.cs.{"${termToSearch.trim()}"}`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const profilesWithDistance = await Promise.all(
        (data || []).map(async (profile) => {
          let distance = null;
          if (isAuthenticated && profile.address) {
            distance = await calculateDistanceFromStudent(profile.address);
          }
          return {
            ...profile,
            distance: distance
          };
        })
      );

      setEducatorProfiles(profilesWithDistance);
    } catch (error) {
      console.error('Error fetching educator profiles:', error);
      toast.error('Error loading educator profiles');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (studentAddress && educatorProfiles.length > 0) {
      console.log('Student address changed, recalculating distances');
      fetchEducatorProfiles();
    }
  }, [studentAddress]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
    fetchEducatorProfiles(query);
    
    // Scroll to listings
    setTimeout(() => {
      if (listingsRef.current) {
        listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1); // Reset to first page
    setSearchParams({});
    fetchEducatorProfiles("");
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    
    // Scroll to top of listing
    setTimeout(() => {
      if (listingsRef.current) {
        listingsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Add ellipsis if current page is > 3
      if (currentPage > 3) {
        pageNumbers.push('ellipsis');
      }
      
      // Show current page and one on each side if possible
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if current page is < totalPages - 2
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <>
      <SEO 
        {...getPageSEO('listings')} 
        title={selectedCategory ? `${selectedCategory} Educators - Skill Directory` : undefined}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1" role="main" aria-label="Educator Listings">
          <Hero 
            onSearch={handleSearch} 
            onReset={handleReset}
            hasSearchResults={!!searchQuery}
            searchQuery={searchQuery}
          />
          
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <aside className="lg:w-1/4" role="complementary" aria-label="Filter Categories">
                <Sidebar 
                  categories={categories || []}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  loading={categoriesLoading}
                />
              </aside>
              
              <div className="lg:w-3/4" ref={listingsRef}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {loading ? (
                      "Loading..."
                    ) : (
                      `${totalCount} Educator${totalCount === 1 ? '' : 's'} Found`
                    )}
                  </h2>
                  <ViewToggle view={view} onViewChange={setView} />
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : view === 'grid' ? (
                  <div className="space-y-6">
                    {educatorProfiles.map((profile) => (
                      <BusinessCard
                        key={profile.id}
                        profile={profile}
                        showDistance={isAuthenticated}
                      />
                    ))}
                  </div>
                ) : (
                  <MapView 
                    educatorProfiles={educatorProfiles}
                    onProfileClick={(profile) => {
                      const slug = profile.name
                        .toLowerCase()
                        .replace(/&/g, 'and')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      window.location.href = `/educator/${slug}`;
                    }}
                  />
                )}

                {totalPages > 1 && view === 'grid' && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        {getPageNumbers().map((pageNum, index) => (
                          pageNum === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Listings;
