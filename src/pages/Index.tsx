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
  CheckCircle, 
  Users, 
  GraduationCap, 
  Trophy, 
  ArrowRight,
  Music,
  Palette,
  Utensils,
  Dumbbell,
  TreePine,
  Car,
  Waves,
  Hammer
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
  { name: "Music and Performing Arts", icon: Music },
  { name: "Arts & Crafts", icon: Palette },
  { name: "Food and Beverage", icon: Utensils },
  { name: "Personal Fitness/ Sports", icon: Dumbbell },
  { name: "Outdoor Recreation", icon: TreePine },
  { name: "Vehicle Operation", icon: Car },
  { name: "Water Recreation", icon: Waves },
  { name: "Trades", icon: Hammer },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-8 shadow-sm border-b border-primary/10">
        <div className="container mx-auto text-center">
          <p className="text-xl text-black max-w-3xl mx-auto px-6 leading-relaxed font-light tracking-wide animate-fadeIn">
            Empowering learners by connecting them with top educators
          </p>
        </div>
      </div>

      <section className="py-6 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          <div className="text-center p-6 space-y-2 animate-fadeIn">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="text-3xl font-bold text-gray-900">5,000+</h3>
            <p className="text-gray-600">Active Educators</p>
          </div>
          <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:200ms]">
            <GraduationCap className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="text-3xl font-bold text-gray-900">20,000+</h3>
            <p className="text-gray-600">Students Taught</p>
          </div>
          <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:400ms]">
            <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="text-3xl font-bold text-gray-900">4.8/5</h3>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center p-6 space-y-2 animate-fadeIn [animation-delay:600ms]">
            <CheckCircle className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="text-3xl font-bold text-gray-900">98%</h3>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Search Educators</h3>
              <p className="text-gray-600 mb-4">Browse through our verified educators and find the perfect match for your learning needs.</p>
              <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
            </div>
            <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Connect & Learn</h3>
              <p className="text-gray-600 mb-4">Schedule sessions and start learning with personalized attention from expert educators.</p>
              <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
            </div>
            <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3 mt-2">Achieve Goals</h3>
              <p className="text-gray-600 mb-4">Track your progress and celebrate achievements as you master new skills.</p>
              <ArrowRight className="w-5 h-5 text-primary absolute bottom-6 right-6" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Categories</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore our most popular learning categories and find the perfect educator for your interests
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div 
                key={category.name}
                className="group p-6 bg-gray-50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <category.icon className="w-8 h-8 group-hover:text-white transition-colors" />
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Verified Educators</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 flex gap-8 flex-1">
        <Sidebar categories={categories} />

        <div className="flex-1 space-y-6">
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

export default Index;
