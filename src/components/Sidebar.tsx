
import { Input } from "@/components/ui/input";

interface Category {
  name: string;
  icon: string;
  count: number;
}

interface SidebarProps {
  categories: Category[];
}

export const Sidebar = ({ categories }: SidebarProps) => {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4 bg-primary text-white p-2 rounded-md">
          Find Businesses
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Search by name</label>
          <Input 
            type="text" 
            placeholder="Name or Keyword"
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Order</label>
          <select className="w-full border rounded-md p-2">
            <option>Default</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <div className="space-y-1">
            {categories.map((category) => (
              <button 
                key={category.name} 
                className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-md flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-sm text-gray-500 ml-auto">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
