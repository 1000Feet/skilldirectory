import { useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
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

const businesses = [
  {
    id: 1,
    name: "The Princess Co.",
    description: "The Princess Co. is a professional children's entertainment company...",
    distance: "4,714.2",
    image: "/lovable-uploads/9845c1eb-dafb-4d19-8c8b-2014f389a748.png",
  },
  {
    id: 2,
    name: "Hinnendael Studios",
    description: "Hinnendael Studios offers full music production, including audio re...",
    distance: "4,714.2",
    image: "/lovable-uploads/77ef91f8-c568-43b4-8b0b-472abea9b6f0.png",
  },
  {
    id: 3,
    name: "Kayla Peeters Music Lessons",
    description: "As passionate educators and instructors, Kayla Peeters and her teac...",
    distance: "4,714.2",
    image: "/lovable-uploads/bb36ffc0-6b79-40df-af4c-b088ee7d30bb.png",
  },
  {
    id: 4,
    name: "Ledgeview Gardens LLC",
    description: "We are small scale, chemical free vegetable farm specializing in hy...",
    distance: "4,714.2",
    image: "/lovable-uploads/fd4cec6d-dd7f-488d-a566-ae8d26ee62af.png",
  },
  {
    id: 5,
    name: "Burnt Bluff Glassworks",
    description: "Stop in and watch us blow glass on your next visit to Door County a...",
    distance: "4,714.2",
    image: "/lovable-uploads/8c99f035-57fd-4069-a2ec-21faa352e4d1.png",
  },
  {
    id: 6,
    name: "Green Bay Botanical Gardens",
    description: "Green Bay Botanical Garden connects people with plants by providing...",
    distance: "4,714.2",
    image: "/lovable-uploads/f3524239-b0b7-4ed3-9de5-0b7688ad8ca5.png",
  },
  {
    id: 7,
    name: "Door County Forgeworks",
    description: "Door County Forgeworks is nested in beautiful Door County, Wiscons...",
    distance: "4,714.2",
    image: "/lovable-uploads/d637f6c7-41e1-41cf-b51c-fcc7bc02ca6b.png",
  },
  {
    id: 8,
    name: "DC Farm For Vets",
    description: "DC Farm for Vets is a rehabilitation farm that provides educational...",
    distance: "4,714.2",
    image: "/lovable-uploads/4b13a5a8-5fbc-428f-959f-bd76d1df0010.png",
  },
  {
    id: 9,
    name: "Forest to Brook",
    description: "Forest to Brook Enrichment Education Services LLC, is a newly...",
    distance: "4,714.2",
    image: "/lovable-uploads/59c5c113-7c09-459f-8072-45e237a22b94.png",
  },
  {
    id: 10,
    name: "Green Bay Sail and Paddle",
    description: "Green Bay Sail & Paddle, Inc. is a nonprofit organization creating...",
    distance: "4,714.2",
    image: "/lovable-uploads/96771fd3-ae5e-408b-9c0d-ccca29477e11.png",
  },
];

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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
