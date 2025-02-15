
import { cn } from "@/lib/utils";
import { CategoryFilter } from "@/components/CategoryFilter";

type Category = {
  name: string;
  icon: React.ComponentType<any>;
};

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const Sidebar = ({ categories, selectedCategory, onSelectCategory }: SidebarProps) => {
  const categoryNames = categories.map(cat => cat.name);

  return (
    <aside className="w-64 hidden md:block">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <CategoryFilter 
          categories={categoryNames}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        <ul className="space-y-2 mt-4">
          {categories.map((category) => (
            <li key={category.name}>
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
  );
};
