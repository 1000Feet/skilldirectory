
import { cn } from "@/lib/utils";

type Category = {
  name: string;
  icon: React.ComponentType<any>;
};

interface SidebarProps {
  categories: Category[];
}

export const Sidebar = ({ categories }: SidebarProps) => {
  return (
    <aside className="w-64 hidden md:block">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="font-semibold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.name}>
              <button
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md hover:bg-primary/5 hover:text-primary transition-colors",
                  "flex items-center gap-2"
                )}
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
