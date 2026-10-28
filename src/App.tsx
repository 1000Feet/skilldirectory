import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import About from './pages/About';
import Support from './pages/Support';
import Pricing from './pages/Pricing';
import Listings from './pages/Listings';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import EducatorDashboard from './pages/EducatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import EducatorProfile from './pages/EducatorProfile';
import AdminSettings from './pages/AdminSettings';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster as SonnerToaster } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { StripeProvider } from '@/providers/StripeProvider';
import PaymentPage from './pages/PaymentPage';
import PaymentComplete from './pages/PaymentComplete';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { useEffect, useState } from 'react';

function BusinessRedirect() {
  const location = useLocation();
  const newPath = location.pathname.replace('business', 'educator');
  return <Navigate to={newPath} replace />;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize application. Please try again later.');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <StripeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute userType="educator">
                  <EducatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute userType="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/educator/:slug" element={<EducatorProfile />} />
            <Route path="/business/:slug" element={<BusinessRedirect />} />
            <Route path="/admin" element={<AdminSettings />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-complete" element={<PaymentComplete />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster />
        </StripeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
