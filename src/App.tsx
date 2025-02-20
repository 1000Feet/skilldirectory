
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
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster as SonnerToaster } from 'sonner';

function BusinessRedirect() {
  const location = useLocation();
  const newPath = location.pathname.replace('business', 'educator');
  return <Navigate to={newPath} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<EducatorDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/educator/:id" element={<EducatorProfile />} />
          <Route path="/business/:id" element={<BusinessRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <SonnerToaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
