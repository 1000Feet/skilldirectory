
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { KnowledgeBaseUpload } from '@/components/educator/KnowledgeBaseUpload';
import { VoiceSelection } from '@/components/educator/VoiceSelection';
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
    // Debug logging
    console.log('Auth state:', { user, userType: user?.user_metadata?.user_type });

    if (!user) {
      console.log('No user found, redirecting to auth page');
      setLoading(false);
      navigate('/auth');
      return;
    }

    if (user.user_metadata?.user_type !== 'educator') {
      console.log('User is not an educator, redirecting to home');
      toast.error('Access denied. This page is only for educators.');
      setLoading(false);
      navigate('/');
      return;
    }

    const fetchBusinessProfile = async () => {
      console.log('Fetching business profile for user:', user.id);
      try {
        const { data, error: profileError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching business profile:', profileError);
          throw profileError;
        }

        console.log('Received profile data:', data);

        // Transform the social data to ensure it matches our type
        if (data) {
          const transformedData: BusinessProfile = {
            ...data,
            social: typeof data.social === 'object' ? data.social as { facebook: string; instagram: string } : {
              facebook: '',
              instagram: ''
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
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user, navigate]);

  // Debug loading state
  console.log('Current loading state:', loading);

  if (!user) {
    console.log('Rendering null due to no user');
    return null;
  }

  if (loading) {
    console.log('Rendering loading state');
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
    console.log('Rendering error state:', error);
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

  console.log('Rendering dashboard with profile:', businessProfile);
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
            
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-2xl font-semibold">AI Chatbot</h2>
              <KnowledgeBaseUpload />
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-2xl font-semibold">AI Voice Agent</h2>
              <VoiceSelection />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Voice Knowledge Base</h3>
                <KnowledgeBaseUpload />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
