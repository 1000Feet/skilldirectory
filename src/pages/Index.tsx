import { useState, useEffect, useRef } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Stats } from "@/components/home/Stats";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedEducators } from "@/components/home/FeaturedEducators";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { SEO } from "@/components/SEO";
import { getPageSEO } from "@/config/seoConfig";
import { Music, Palette, Utensils, Dog, Dumbbell, TreePine, Car, Target, Hammer, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDistance } from "@/hooks/useDistance";
import { useCategories } from "@/hooks/useCategories";

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
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [educatorProfiles, setEducatorProfiles] = useState<EducatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const educatorListingsRef = useRef<HTMLDivElement>(null);
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
    
    setTimeout(() => {
      if (educatorListingsRef.current) {
        educatorListingsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setCurrentPage(1); // Reset to first page
    fetchEducatorProfiles("");
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    
    // Scroll to top of listing
    setTimeout(() => {
      if (educatorListingsRef.current) {
        educatorListingsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
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
      <SEO {...getPageSEO('home')} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <Hero 
          onSearch={handleSearch}
          onReset={handleReset}
          hasSearchResults={searchQuery.length > 0}
          searchQuery={searchQuery}
        />
        <HowItWorks />
        <FeaturedCategories />
        <FeaturedEducators />
        {/* <Stats /> */}
        <TrustIndicators />

        <main className="container mx-auto py-8 flex flex-col md:flex-row gap-8 flex-1 px-4 md:px-0">
          <Sidebar 
            categories={categories} 
            selectedCategory={selectedCategory} 
            onSelectCategory={handleCategorySelect}
          />

          <div className="flex-1 space-y-6" ref={educatorListingsRef}>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : educatorProfiles.length === 0 ? (
              <div className="text-center py-8">No educator profiles found</div>
            ) : (
              <div className="space-y-6">
                {educatorProfiles.map((profile) => (
                  <BusinessCard
                    key={profile.id}
                    profile={profile}
                    showDistance={isAuthenticated}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
