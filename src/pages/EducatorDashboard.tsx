
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { toast } from 'sonner';

export default function EducatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchBusinessProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setBusinessProfile(data);
      } catch (error: any) {
        if (error.code !== 'PGRST116') { // Don't show error for no data found
          toast.error('Error fetching business profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Educator Dashboard</h1>
        <div className="grid grid-cols-1 gap-8">
          <BusinessProfileForm 
            initialData={businessProfile}
            onSuccess={() => {
              toast.success('Business profile updated successfully');
            }}
          />
        </div>
      </div>
    </div>
  );
}
