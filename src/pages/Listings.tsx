import { useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
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

const businesses = [{
  id: 1,
  name: "The Princess Co.",
  description: "The Princess Co. is a professional children's entertainment company...",
  distance: "4,714.2",
  image: "/lovable-uploads/9845c1eb-dafb-4d19-8c8b-2014f389a748.png",
  educator_id: "0e4c4a2e-6431-4751-ac9b-b743c126766b",
  educator_profile_id: "0e4c4a2e-6431-4751-ac9b-b743c126766b"
}, {
  id: 2,
  name: "Hinnendael Studios",
  description: "Hinnendael Studios offers full music production, including audio re...",
  distance: "4,714.2",
  image: "/lovable-uploads/77ef91f8-c568-43b4-8b0b-472abea9b6f0.png",
  educator_id: "1e4c4a2e-6431-4751-ac9b-b743c126766b",
  educator_profile_id: "1e4c4a2e-6431-4751-ac9b-b743c126766b"
}, {
  id: 3,
  name: "Kayla Peeters Music Lessons",
  description: "As passionate educators and instructors, Kayla Peeters and her teac...",
  distance: "4,714.2",
  image: "/lovable-uploads/bb36ffc0-6b79-40df-af4c-b088ee7d30bb.png",
  educator_id: "2e4c4a2e-6431-4751-ac9b-b743c126766b",
  educator_profile_id: "2e4c4a2e-6431-4751-ac9b-b743c126766b"
}];

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
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              id={business.id}
              name={business.name}
              description={business.description}
              distance={business.distance}
              image={business.image}
              educator_id={business.educator_id}
              educator_profile_id={business.educator_profile_id}
            />
          ))}

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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
