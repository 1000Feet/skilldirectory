
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BusinessInfoProps {
  business: {
    name: string;
    description: string;
    image: string;
    categories: string[];
    tags: string[];
  };
}

export const BusinessInfo = ({ business }: BusinessInfoProps) => {
  const imagePath = business.image.startsWith('/') 
    ? `/skilldirectory${business.image}`
    : `/skilldirectory/${business.image}`;
  
  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={imagePath}
            alt={business.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description}</p>
          <div className="flex flex-wrap gap-2">
            {business.categories.map(category => (
              <Badge key={category} variant="secondary">{category}</Badge>
            ))}
            {business.tags.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
