
import { Input } from "@/components/ui/input";

interface SidebarProps {
  categories: string[];
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
              <button key={category} className="category-link">
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
