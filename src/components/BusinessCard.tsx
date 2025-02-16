
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface BusinessCardProps {
  name: string;
  description: string;
  distance: string;
  image: string;
  id?: number;
}

export function BusinessCard({ name, description, distance, image, id }: BusinessCardProps) {
  const imagePath = image.startsWith('/') ? `/skilldirectory${image}` : image;
  
  return (
    <Card className="flex overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="w-48 h-48 flex-shrink-0 bg-gray-100 p-4">
        <img 
          src={imagePath} 
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight mb-2">{name}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="inline-flex items-center rounded-full bg-gray-600 px-3 py-1 text-sm text-white">
            {distance} Miles Away
          </span>
          <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
            <Link to={`/business/${id}`}>DETAILS</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
