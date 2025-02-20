
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
          // Parse the social data safely
          const socialData = typeof data.social === 'object' ? data.social : {};
          
          // Parse AI chatbot data safely
          const chatbotData = typeof data.ai_chatbot === 'object' ? data.ai_chatbot : {};
          const chatbotKnowledgeBase = Array.isArray((chatbotData as any)?.knowledge_base) 
            ? (chatbotData as any).knowledge_base 
            : [];

          // Parse AI voice agent data safely
          const voiceAgentData = typeof data.ai_voice_agent === 'object' ? data.ai_voice_agent : {};
          const voiceAgentKnowledgeBase = Array.isArray((voiceAgentData as any)?.knowledge_base)
            ? (voiceAgentData as any).knowledge_base
            : [];
          
          const transformedProfile: BusinessProfile = {
            id: data.id,
            user_id: data.user_id,
            name: data.name || '',
            description: data.description || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            about_business: data.about_business || '',
            social: {
              facebook: (socialData as any)?.facebook || '',
              instagram: (socialData as any)?.instagram || '',
              youtube: (socialData as any)?.youtube || ''
            },
            ai_chatbot: {
              knowledge_base: chatbotKnowledgeBase
            },
            ai_voice_agent: {
              knowledge_base: voiceAgentKnowledgeBase,
              voice_id: (voiceAgentData as any)?.voice_id || 'cjVigY5qzO86Huf0OWal'
            }
          };
          setBusinessProfile(transformedProfile);
        } else {
          // If no profile exists, set initial empty profile
          const emptyProfile: BusinessProfile = {
            name: '',
            description: '',
            website: '',
            address: '',
            phone: '',
            email: user.email || '',
            about_business: '',
            social: {
              facebook: '',
              instagram: '',
              youtube: ''
            },
            ai_chatbot: {
              knowledge_base: []
            },
            ai_voice_agent: {
              knowledge_base: [],
              voice_id: 'cjVigY5qzO86Huf0OWal'
            }
          };
          setBusinessProfile(emptyProfile);
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
