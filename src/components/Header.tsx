
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <header>
      <div className="bg-[#333333] text-white">
        <div className="container mx-auto py-2 text-center text-sm italic">
          INVEST IN YOURSELF
        </div>
      </div>
      <div className="bg-[#F2FCE2] py-8">
        <div className="container mx-auto">
          <img 
            src="/lovable-uploads/0a56a419-7e3e-4266-a1e3-6fdd59c00442.png" 
            alt="Skill Directory" 
            className="h-20 mx-auto mb-8"
          />
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Which skill would you like to learn?"
              className="search-input pr-12"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button 
              className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary/90 rounded-full w-10 p-0"
            >
              🔍
            </Button>
          </div>
        </div>
      </div>
      <nav className="bg-[#333333] border-t border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4 relative">
            <div className="flex gap-8 absolute left-1/2 -translate-x-1/2">
              <a href="/" className="nav-link">HOME</a>
              <a href="/listings" className="nav-link">LISTINGS</a>
              <a href="/about" className="nav-link">ABOUT</a>
              <a href="/pricing" className="nav-link">PRICING</a>
              <a href="/support" className="nav-link">SUPPORT</a>
            </div>
            <div className="ml-auto">
              <Button className="bg-primary hover:bg-primary/90">
                LOGIN / SIGN UP
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
