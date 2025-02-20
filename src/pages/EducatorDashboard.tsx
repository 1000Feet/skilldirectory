
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { LessonRequests } from '@/components/educator/LessonRequests';
import { toast } from 'sonner';
import type { BusinessProfile } from '@/components/educator/types';
import { Header } from '@/components/Header';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.user_metadata?.user_type !== 'educator') {
      toast.error('Access denied. This page is only for educators.');
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        const { data, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile data');
          toast.error('Error loading profile data');
          return;
        }

        console.log('Fetched profile data:', data);
        
        if (data) {
          // Transform the data to match BusinessProfile type
          const socialData = data.social as { facebook?: string; instagram?: string; youtube?: string } || {};
          
          const transformedProfile: BusinessProfile = {
            id: data.id,
            user_id: data.user_id,
            name: data.name,
            description: data.description || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email,
            about_business: data.about_business || '',
            social: {
              facebook: socialData.facebook || '',
              instagram: socialData.instagram || '',
              youtube: socialData.youtube || ''
            },
            ai_chatbot: data.ai_chatbot as BusinessProfile['ai_chatbot'],
            ai_voice_agent: data.ai_voice_agent as BusinessProfile['ai_voice_agent']
          };
          setBusinessProfile(transformedProfile);
        } else {
          setBusinessProfile(null);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load profile data');
        toast.error('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

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
          <LessonRequests />
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">Educator Profile</h2>
            </div>
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
