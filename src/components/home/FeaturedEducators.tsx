
import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const featuredEducators = [{
  id: 1,
  name: "The Princess Co.",
  image: "/lovable-uploads/9845c1eb-dafb-4d19-8c8b-2014f389a748.png",
  rating: "4.9",
  category: "Arts & Entertainment"
}, {
  id: 2,
  name: "Hinnendael Studios",
  image: "/lovable-uploads/77ef91f8-c568-43b4-8b0b-472abea9b6f0.png",
  rating: "4.8",
  category: "Music Production"
}, {
  id: 3,
  name: "Kayla Peeters Music",
  image: "/lovable-uploads/bb36ffc0-6b79-40df-af4c-b088ee7d30bb.png",
  rating: "5.0",
  category: "Music Education"
}, {
  id: 4,
  name: "Ledgeview Gardens",
  image: "/lovable-uploads/fd4cec6d-dd7f-488d-a566-ae8d26ee62af.png",
  rating: "4.7",
  category: "Agriculture"
}];

export const FeaturedEducators = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Featured Educators</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Learn from our most highly rated and experienced educators
        </p>
        <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full max-w-6xl mx-auto">
          <CarouselContent>
            {featuredEducators.map(educator => (
              <CarouselItem key={educator.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full">
                      <img 
                        src={educator.image} 
                        alt={educator.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{educator.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{educator.category}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{educator.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
