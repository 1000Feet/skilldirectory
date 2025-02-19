
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BusinessProfileForm } from '@/components/educator/BusinessProfileForm';
import { KnowledgeBaseUpload } from '@/components/educator/KnowledgeBaseUpload';
import { VoiceSelection } from '@/components/educator/VoiceSelection';
import { toast } from 'sonner';

export default function EducatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('Initializing dashboard...', { user });
      
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      // Check if user is an educator
      console.log('Checking user type:', user.user_metadata?.user_type);
      if (user.user_metadata?.user_type !== 'educator') {
        console.log('User is not an educator');
        toast.error('Access denied. This page is only for educators.');
        navigate('/');
        return;
      }

      try {
        console.log('Fetching business profile for user:', user.id);
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Supabase error:', error);
          toast.error('Error loading dashboard data');
          setLoading(false);
          return;
        }

        console.log('Business profile data:', data);
        setBusinessProfile(data);
        setLoading(false);
      } catch (error: any) {
        console.error('Unexpected error:', error);
        toast.error('Error loading dashboard');
        setLoading(false);
      }
    };

    initializeDashboard();
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
