import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

export const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { categories, loading } = useCategories();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/listings?category=${encodeURIComponent(categoryName)}`);
  };

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 8);

  return (
    <section className="py-12 bg-[#F1F1F1]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Featured Categories</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Explore our most popular learning categories and find the perfect educator for your interests
        </p>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {displayedCategories.map(category => (
                <div 
                  key={category.id} 
                  className="group p-6 bg-gray-50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {category.icon && <category.icon className="w-8 h-8 group-hover:text-white transition-colors" />}
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
            {categories.length > 8 && (
              <div className="flex justify-center mt-8">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  {showAllCategories ? 'Show Less' : 'More Categories'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
