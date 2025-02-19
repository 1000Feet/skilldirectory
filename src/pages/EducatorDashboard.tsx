
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { KnowledgeBaseUpload } from '@/components/educator/KnowledgeBaseUpload';
import { VoiceSelection } from '@/components/educator/VoiceSelection';
import { toast } from 'sonner';
import type { BusinessProfile } from '@/components/educator/types';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    const fetchBusinessProfile = async () => {
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
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
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
          
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">AI Chatbot</h2>
            <KnowledgeBaseUpload />
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">AI Voice Agent</h2>
            <VoiceSelection />
            <KnowledgeBaseUpload />
          </div>
        </div>
      </div>
    </div>
  );
}
