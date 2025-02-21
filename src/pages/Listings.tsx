
import { useState, useEffect } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext
} from "@/components/ui/pagination";
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

interface Service {
  id: string;
  name: string;
  description: string;
  educator_profile_id: string;
  educator_profile: {
    id: string;
    name: string;
    description: string;
    image: string;
  };
}

const categories = [
  { name: "Animals", icon: Dog },
  { name: "Arts & Crafts", icon: Palette },
  { name: "Food and Beverage", icon: Utensils },
  { name: "Martial Arts", icon: Target },
  { name: "Music and Performing Arts", icon: Music },
  { name: "Outdoor Recreation", icon: TreePine },
  { name: "Personal Fitness/ Sports", icon: Dumbbell },
  { name: "Shooting Sports", icon: Target },
  { name: "Trades", icon: Hammer },
  { name: "Vehicle Operation", icon: Car },
  { name: "Water Recreation", icon: Waves },
];

const Listings = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        let query = supabase
          .from('educator_services')
          .select(`
            id,
            name,
            description,
            educator_profile_id,
            educator_profile:educator_profiles (
              id,
              name,
              description,
              image
            )
          `)
          .eq('status', 'published');

        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        const { data, error: servicesError } = await query;

        if (servicesError) {
          throw servicesError;
        }

        const transformedServices = data.map(service => ({
          ...service,
          educator_profile: service.educator_profile || {
            id: service.educator_profile_id,
            name: 'Unknown Educator',
            description: '',
            image: null
          }
        }));

        setServices(transformedServices);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services');
        toast.error('Error loading services');
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Hero />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Hero />
        <div className="flex justify-center items-center flex-1">
          <div className="text-center text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <main className="container mx-auto py-8 flex gap-8">
        <Sidebar 
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <div className="flex-1">
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No services found in this category.
            </div>
          ) : (
            services.map((service) => (
              <BusinessCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                distance="4,714.2" // This could be calculated based on user location in the future
                image={service.educator_profile.image || '/placeholder.svg'}
                educator_id={service.educator_profile.id}
                educator_profile_id={service.educator_profile_id}
              />
            ))
          )}

          {services.length > 0 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
