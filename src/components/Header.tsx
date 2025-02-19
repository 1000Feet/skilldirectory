
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dispatch, SetStateAction } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: Dispatch<SetStateAction<string>>;
}

export const Header = ({ searchQuery, onSearchChange }: HeaderProps = {}) => {
  const { user, signOut } = useAuth();

  console.log('Current user:', user); // Debug log to see user data

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
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:text-gray-200">
                      {user.user_metadata?.user_type === 'educator' ? '👨‍🏫' : '👨‍🎓'} {user.email}
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {user.user_metadata?.user_type === 'educator' && (
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="w-full">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => signOut()}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
