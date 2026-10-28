import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#333333] text-white mt-auto">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/">
            <img 
              src="/lovable-uploads/b71f5020-bb1c-464a-8ba8-60e008e8c40a.png" 
              alt="Skill Directory" 
              className="h-8"
            />
          </Link>
          <nav className="flex flex-wrap gap-6 text-sm items-center">
            <Link to="/about" className="hover:text-primary-foreground/90">ABOUT</Link>
            <Link to="/pricing" className="hover:text-primary-foreground/90">PRICING</Link>
            <Link to="/privacy-policy" className="hover:text-primary-foreground/90">PRIVACY POLICY</Link>
            <Link to="/terms" className="hover:text-primary-foreground/90">TERMS & CONDITIONS</Link>
            <Link to="/support" className="hover:text-primary-foreground/90">SUPPORT</Link>
            <Link 
              to="/auth?signup=educator" 
              className="bg-[#88C440] text-white px-4 py-2 rounded-md hover:bg-[#78b32d] transition-colors font-medium"
            >
              SKILL PROVIDER? SIGN UP HERE
            </Link>
          </nav>
        </div>
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700 text-sm text-gray-400">
          <div>
            Copyright 2025 <span className="text-[#88C440]">SKILLDIRECTORY.COM</span>. All Rights Reserved.
          </div>
          <div>
            Website by <a href="https://1000feetabove.com/" target="_blank" rel="noopener noreferrer" className="text-[#88C440]">1000FEET</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
