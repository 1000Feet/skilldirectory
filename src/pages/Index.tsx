import { useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext
} from "@/components/ui/pagination";

// Sample data
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
    image: "/lovable-uploads/a49fdb90-1d77-496a-91c5-15d63ef1be38.png",
  },
  {
    id: 7,
    name: "Door County Forgeworks",
    description: "Door County Forgeworks is nested in beautiful Door County, Wiscons...",
    distance: "4,714.2",
    image: "/lovable-uploads/5761b0ec-8536-4c77-81e9-1208f9964cc0.png",
  },
  {
    id: 8,
    name: "DC Farm For Vets",
    description: "DC Farm for Vets is a rehabilitation farm that provides educational...",
    distance: "4,714.2",
    image: "/lovable-uploads/3f5de50d-e64f-455c-852f-b483dffd5fa4.png",
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
    image: "/lovable-uploads/2a1e1a7c-3432-4772-aae6-82d34dcbc604.png",
  },
];

const categories = [
  "Animals",
  "Arts & Crafts",
  "Food and Beverage",
  "Martial Arts",
  "Music and Performing Arts",
  "Outdoor Recreation",
  "Personal Fitness/ Sports",
  "Shooting Sports",
  "Trades",
  "Vehicle Operation",
  "Water Recreation",
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <div className="bg-black text-white">
          <div className="container mx-auto py-2 text-center text-sm">
            INVEST IN YOURSELF
          </div>
        </div>
        <div className="bg-[#F2FCE2] py-8">
          <div className="container mx-auto">
            <img 
              src="/lovable-uploads/0a56a419-7e3e-4266-a1e3-6fdd59c00442.png" 
              alt="Skill Directory" 
              className="h-20 mx-auto mb-8"
            />
            <div className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder="Invest in yourself! Which skill would you like to learn?"
                className="search-input pr-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary/90 rounded-full w-10 p-0"
              >
                🔍
              </Button>
            </div>
          </div>
        </div>
        <nav className="bg-black border-t border-gray-800">
          <div className="container mx-auto">
            <div className="flex items-center justify-between py-4">
              <div className="flex gap-8">
                <a href="#" className="nav-link">HOME</a>
                <a href="#" className="nav-link">LISTINGS</a>
                <a href="#" className="nav-link">ABOUT</a>
                <a href="#" className="nav-link">PRICING</a>
                <a href="#" className="nav-link">SUPPORT</a>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                LOGIN / SIGN UP
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto py-8 flex gap-8 flex-1">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-semibold mb-4 bg-primary text-white p-2 rounded-md">
              Find Businesses
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Search by name</label>
              <Input 
                type="text" 
                placeholder="Name or Keyword"
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Order</label>
              <select className="w-full border rounded-md p-2">
                <option>Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button key={category} className="category-link">
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
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

      <footer className="bg-[#333333] text-white mt-auto">
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center">
            <img 
              src="/lovable-uploads/0a56a419-7e3e-4266-a1e3-6fdd59c00442.png" 
              alt="Skill Directory" 
              className="h-8"
            />
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-primary-foreground/90">ABOUT</a>
              <a href="#" className="hover:text-primary-foreground/90">PRICING</a>
              <a href="#" className="hover:text-primary-foreground/90">PRIVACY POLICY</a>
              <a href="#" className="hover:text-primary-foreground/90">TERMS & CONDITIONS</a>
              <a href="#" className="hover:text-primary-foreground/90">SUPPORT</a>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <div>
              Copyright © 2024 <span className="text-[#88C440]">SKILLDIRECTORY.COM</span>. All Rights Reserved.
            </div>
            <div>
              Website by <a href="#" className="text-[#88C440]">HILLPHAT.COM</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
