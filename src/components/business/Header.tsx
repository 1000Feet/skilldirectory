
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header>
      <div className="bg-[#333333] text-white">
        <div className="container mx-auto py-2 text-center text-sm italic">
          INVEST IN YOURSELF
        </div>
      </div>
      <nav className="bg-[#333333] border-t border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4 relative">
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <img 
                  src="/skilldirectory/lovable-uploads/fdb072b4-fc90-4554-a180-2b2ec2559037.png" 
                  alt="Skill Directory" 
                  className="h-8"
                />
              </Link>
            </div>
            <div className="flex gap-8 absolute left-1/3 -translate-x-1/2">
              <Link to="/" className="nav-link">HOME</Link>
              <Link to="/listings" className="nav-link">LISTINGS</Link>
              <Link to="/about" className="nav-link">ABOUT</Link>
              <Link to="/pricing" className="nav-link">PRICING</Link>
              <Link to="/support" className="nav-link">SUPPORT</Link>
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
}
