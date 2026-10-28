import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, GraduationCap, User, Settings, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: Dispatch<SetStateAction<string>>;
}

export const Header = ({ searchQuery, onSearchChange }: HeaderProps = {}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      
      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Check if user exists and has user_metadata
  const isEducator = user?.user_metadata?.user_type === 'educator';
  const isStudent = user?.user_metadata?.user_type === 'student';

  console.log('Current user in header:', user?.user_metadata);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative z-50">
      <div className="bg-[#333333] text-white">
        <div className="container mx-auto py-2 text-center text-sm italic">
          INVEST IN YOURSELF
        </div>
      </div>
      <div className="bg-[#F2FCE2] py-4 md:py-8">
        <div className="container mx-auto px-4 md:px-0">
          <img 
            src="/lovable-uploads/0a56a419-7e3e-4266-a1e3-6fdd59c00442.png" 
            alt="Skill Directory" 
            className="h-auto w-[200px] md:w-[300px] mx-auto object-contain"
          />
        </div>
      </div>
      <nav className="bg-[#333333] border-t border-gray-700">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4 px-4 md:px-0 relative">
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white p-2" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-8 mx-auto">
              <Link to="/" className="text-white hover:text-gray-200">HOME</Link>
              <Link to="/listings" className="text-white hover:text-gray-200">LISTINGS</Link>
              <Link to="/about" className="text-white hover:text-gray-200">ABOUT</Link>
              <Link to="/pricing" className="text-white hover:text-gray-200">PRICING</Link>
              <Link to="/support" className="text-white hover:text-gray-200">SUPPORT</Link>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-[#333333] border-t border-gray-700 md:hidden z-50">
                <div className="flex flex-col py-2">
                  <Link to="/" className="text-white hover:text-gray-200 py-3 px-4 border-b border-gray-700">HOME</Link>
                  <Link to="/listings" className="text-white hover:text-gray-200 py-3 px-4 border-b border-gray-700">LISTINGS</Link>
                  <Link to="/about" className="text-white hover:text-gray-200 py-3 px-4 border-b border-gray-700">ABOUT</Link>
                  <Link to="/pricing" className="text-white hover:text-gray-200 py-3 px-4 border-b border-gray-700">PRICING</Link>
                  <Link to="/support" className="text-white hover:text-gray-200 py-3 px-4">SUPPORT</Link>
                </div>
              </div>
            )}

            <div className="md:absolute md:right-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-gray-200 text-xs md:text-sm max-w-[150px] md:max-w-none">
                        {isEducator ? (
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <User className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{user.email}</span>
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      {isEducator && (
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="w-full cursor-pointer flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Educator Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isStudent && (
                        <DropdownMenuItem asChild>
                          <Link to="/student-dashboard" className="w-full cursor-pointer flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Student Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full cursor-pointer flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onSelect={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-xs md:text-sm">
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
