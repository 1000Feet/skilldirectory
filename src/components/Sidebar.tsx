import { cn } from "@/lib/utils";
import { CategoryFilter } from "@/components/CategoryFilter";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Category } from "@/hooks/useCategories";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  loading?: boolean;
}

export const Sidebar = ({ categories, selectedCategory, onSelectCategory }: SidebarProps) => {
  const categoryNames = categories.map(cat => cat.name);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="w-full md:hidden mb-4">
        <button 
          onClick={toggleMobileMenu}
          className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <span className="font-medium">
            {selectedCategory ? `Category: ${selectedCategory}` : "Browse Categories"}
          </span>
          {isMobileMenuOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        
        {/* Mobile Sidebar Content */}
        {isMobileMenuOpen && (
          <div className="bg-white p-4 rounded-lg shadow-sm mt-2 border border-gray-200">
            <CategoryFilter 
              categories={categoryNames}
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                onSelectCategory(category);
                setIsMobileMenuOpen(false);
              }}
            />
            <ul className="space-y-2 mt-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-md transition-colors",
                      "flex items-center gap-2",
                      "border border-primary",
                      selectedCategory === category.name ? "bg-primary/5 text-primary" : "hover:bg-primary/5 hover:text-primary"
                    )}
                    onClick={() => {
                      onSelectCategory(category.name);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 hidden md:block">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <CategoryFilter 
            categories={categoryNames}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />
          <ul className="space-y-2 mt-4">
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-md transition-colors",
                    "flex items-center gap-2",
                    "border border-primary",
                    selectedCategory === category.name ? "bg-primary/5 text-primary" : "hover:bg-primary/5 hover:text-primary"
                  )}
                  onClick={() => onSelectCategory(category.name)}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};
