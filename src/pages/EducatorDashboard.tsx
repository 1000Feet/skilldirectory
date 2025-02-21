
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EducatorProfileForm } from '@/components/educator/EducatorProfileForm';
import { LessonRequests } from '@/components/educator/LessonRequests';
import { ServicesSection } from '@/components/educator/ServicesSection';
import { toast } from 'sonner';
import type { EducatorProfile } from '@/components/educator/types';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

    const fetchProfile = async () => {
      try {
        const { data, error: profileError } = await supabase
          .from('educator_profiles')
          .select(`
            id,
            user_id,
            name,
            description,
            website,
            address,
            phone,
            email,
            about_business,
            social,
            ai_chatbot,
            ai_voice_agent,
            image,
            categories,
            tags,
            subscription_tier
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile data');
          toast.error('Error loading profile data');
          return;
        }

        if (data) {
          const transformedProfile: EducatorProfile = {
            id: data.id,
            user_id: data.user_id,
            name: data.name || '',
            description: data.description || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            about_business: data.about_business || '',
            social: data.social as { facebook: string; instagram: string; youtube?: string },
            ai_chatbot: data.ai_chatbot as { knowledge_base: string[] },
            ai_voice_agent: data.ai_voice_agent as { knowledge_base: string[]; voice_id: string },
            image: data.image,
            categories: data.categories as string[] || [],
            tags: data.tags as string[] || [],
            subscription_tier: data.subscription_tier || 'basic'
          };

          setEducatorProfile(transformedProfile);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load profile data');
        toast.error('Error loading profile data');
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Educator Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <LessonRequests />

          {!loading && educatorProfile && (
            <Card className="overflow-hidden">
              <Tabs defaultValue="services" className="w-full">
                <TabsList className="w-full border-b rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="services" 
                    className="rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    Services
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profile" 
                    className="rounded-none flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    Profile
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="services" className="m-0">
                  <div className="p-6">
                    <ServicesSection educator_profile_id={educatorProfile.id} />
                  </div>
                </TabsContent>

                <TabsContent value="profile" className="m-0">
                  <EducatorProfileForm 
                    initialData={educatorProfile}
                    onSuccess={() => {
                      toast.success('Profile updated successfully');
                    }}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
