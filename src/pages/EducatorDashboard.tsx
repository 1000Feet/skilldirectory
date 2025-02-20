
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EducatorProfileForm } from '@/components/educator/EducatorProfileForm';
import { LessonRequests } from '@/components/educator/LessonRequests';
import { toast } from 'sonner';
import type { EducatorProfile } from '@/components/educator/types';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export default function EducatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
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
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          setError('Failed to load profile data');
          toast.error('Error loading profile data');
          return;
        }

        if (data) {
          setEducatorProfile({
            id: data.id,
            user_id: data.user_id,
            name: data.name,
            description: data.description || '',
            website: data.website || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || user.email || '',
            about_business: data.about_business || '',
            social: {
              facebook: '',
              instagram: ''
            }
          });
        }
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
            <EducatorProfileForm 
              initialData={educatorProfile}
              onSuccess={() => {
                toast.success('Educator profile updated successfully');
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
