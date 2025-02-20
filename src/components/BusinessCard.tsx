
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { RequestLessonForm } from "@/components/student/RequestLessonForm";

interface BusinessCardProps {
  name: string;
  description: string;
  distance: string;
  image: string;
  id?: number;
  educator_id?: string;
  educator_profile_id?: string;
}

export function BusinessCard({ 
  name, 
  description, 
  distance, 
  image, 
  id,
  educator_id,
  educator_profile_id 
}: BusinessCardProps) {
  return (
    <Card className="flex overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="w-48 h-48 flex-shrink-0 bg-gray-100 p-4">
        <img 
          src={image} 
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
          <div className="flex gap-2">
            <Link 
              to={`/business/${id}`} 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              DETAILS
            </Link>
            {educator_id && educator_profile_id && (
              <RequestLessonForm 
                educatorId={educator_id} 
                educatorProfileId={educator_profile_id}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
