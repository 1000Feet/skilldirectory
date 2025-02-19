
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { toast } from 'sonner';
import type { BusinessProfile } from '@/components/educator/types';
import { Header } from '@/components/Header';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate('/auth');
      return;
    }

    if (user.user_metadata?.user_type !== 'educator') {
      toast.error('Access denied. This page is only for educators.');
      setLoading(false);
      navigate('/');
      return;
    }

    const fetchBusinessProfile = async () => {
      try {
        const { data, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data) {
          const socialData = typeof data.social === 'string' 
            ? JSON.parse(data.social)
            : (data.social as { facebook: string; instagram: string } || { facebook: '', instagram: '' });

          const transformedData: BusinessProfile = {
            ...data,
            name: data.name || '',
            description: data.description || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || user.email || '',
            about_business: data.about_business || '',
            social: {
              facebook: socialData.facebook || '',
              instagram: socialData.instagram || ''
            }
          };
          setBusinessProfile(transformedData);
        } else {
          setBusinessProfile(null);
        }
        setError(null);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load profile data');
        toast.error('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user, navigate]);

  if (!user) return null;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Educator Dashboard</h1>
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white rounded-lg shadow">
            <BusinessProfileForm 
              initialData={businessProfile}
              onSuccess={() => {
                toast.success('Business profile updated successfully');
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
