
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user, signOut } = useAuth();

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
            src="/skilldirectory/lovable-uploads/0a56a419-7e3e-4266-a1e3-6fdd59c00442.png" 
            alt="Skill Directory" 
            className="h-20 mx-auto"
          />
        </div>
      </div>
      <nav className="bg-[#333333] border-t border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4 relative">
            <div className="flex gap-8 absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="nav-link">HOME</Link>
              <Link to="/listings" className="nav-link">LISTINGS</Link>
              <Link to="/about" className="nav-link">ABOUT</Link>
              <Link to="/pricing" className="nav-link">PRICING</Link>
              <Link to="/support" className="nav-link">SUPPORT</Link>
            </div>
            <div className="ml-auto">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-white">
                    {user.profile?.user_type === 'educator' ? '👨‍🏫' : '👨‍🎓'} {user.email}
                  </span>
                  <Button 
                    onClick={() => signOut()} 
                    variant="secondary"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90">
                    LOGIN / SIGN UP
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
