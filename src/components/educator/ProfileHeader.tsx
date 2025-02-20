
import { Card } from "@/components/ui/card";

interface ProfileHeaderProps {
  name: string;
  description: string | null;
  image: string | null;
  categories: string[] | null;
}

export const ProfileHeader = ({ name, description, image, categories }: ProfileHeaderProps) => {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span 
                  key={category}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
