
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';

type DatabaseStudentProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  user_type: UserType;
}

type DatabaseEducatorProfile = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  description: string | null;
  image: string | null;
  website: string | null;
  address: string | null;
  phone: string | null;
  about_business: string | null;
  social: {
    facebook: string;
    instagram: string;
    youtube?: string;
  } | null;
  ai_chatbot: {
    knowledge_base: string[];
  } | null;
  ai_voice_agent: {
    knowledge_base: string[];
    voice_id: string;
  } | null;
  created_at: string;
  updated_at: string;
  categories: string[] | null;
  tags: string[] | null;
}

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      const table = userType === 'educator' ? 'educator_profiles' : 'student_profiles';
      console.log(`Fetching ${userType} profile from ${table}`);
      
      if (userType === 'student') {
        const { data: studentProfile, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (studentError) {
          console.error('Error fetching student profile:', studentError);
          return null;
        }

        if (studentProfile) {
          return {
            id: studentProfile.id,
            email: studentProfile.email,
            user_type: 'student' as const,
            first_name: studentProfile.first_name,
            last_name: studentProfile.last_name,
            avatar_url: studentProfile.avatar_url
          } satisfies StudentProfile;
        }
      } else {
        const { data: educatorProfile, error: educatorError } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (educatorError) {
          console.error('Error fetching educator profile:', educatorError);
          return null;
        }

        if (educatorProfile) {
          return {
            id: educatorProfile.id,
            email: educatorProfile.email,
            user_type: 'educator' as const,
            name: educatorProfile.name,
            description: educatorProfile.description,
            image: educatorProfile.image
          } satisfies EducatorProfile;
        }
      }
      
      console.log(`No ${userType} profile found`);
      return null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  return { fetchProfile };
};
