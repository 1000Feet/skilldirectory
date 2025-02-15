
import { useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Sample data
const businesses = [
  {
    id: 1,
    name: "The Princess Co.",
    description: "The Princess Co. is a professional children's entertainment company...",
    distance: "4,714.2",
    image: "/lovable-uploads/2a1e1a7c-3432-4772-aae6-82d34dcbc604.png",
  },
  {
    id: 2,
    name: "Hinnendael Studios",
    description: "Hinnendael Studios offers full music production, including audio re...",
    distance: "4,714.2",
    image: "/path-to-hinnendael-logo.png",
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
  "Sports",
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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
                placeholder="Invest in yourself"
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

      {/* Main Content */}
      <main className="container mx-auto py-8 flex gap-8">
        {/* Sidebar */}
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

        {/* Business Listings */}
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
        </div>
      </main>
    </div>
  );
};

export default Index;
