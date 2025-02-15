
import { Button } from "@/components/ui/button";

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
              <img 
                src="/lovable-uploads/fdb072b4-fc90-4554-a180-2b2ec2559037.png" 
                alt="Skill Directory" 
                className="h-8"
              />
            </div>
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
