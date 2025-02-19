
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BusinessProfile from "./pages/BusinessProfile";
import PricingPage from "./pages/Pricing";
import AboutPage from "./pages/About";
import ListingsPage from "./pages/Listings";
import SupportPage from "./pages/Support";
import NotFound from "./pages/NotFound";
import EducatorDashboard from "./pages/EducatorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/dashboard" element={<EducatorDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
