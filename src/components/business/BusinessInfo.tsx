
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-[#F5F0E8] rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={business.image}
            alt={business.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-3">{business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description}</p>
          <div className="flex flex-wrap gap-2">
            {business.categories.map(category => (
              <Badge key={category} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">{category}</Badge>
            ))}
            {business.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-gray-600">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
