
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';

interface SupabaseStudentProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface SupabaseEducatorProfile {
  id: string;
  email: string;
  name: string;
  description: string | null;
  image: string | null;
}

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      const table = userType === 'educator' ? 'educator_profiles' : 'student_profiles';
      console.log(`Fetching ${userType} profile from ${table}`);
      
      const { data: profile, error } = await supabase
        .from(table)
        .select('*')
        .eq(userType === 'educator' ? 'user_id' : 'id', userId)
        .single();

      if (error) {
        console.error(`Error fetching ${userType} profile:`, error);
        return null;
      }

      if (profile) {
        console.log(`${userType} profile found:`, profile);
        if (userType === 'student') {
          const studentProfile = profile as SupabaseStudentProfile;
          return {
            id: studentProfile.id,
            email: studentProfile.email,
            user_type: userType,
            first_name: studentProfile.first_name,
            last_name: studentProfile.last_name,
            avatar_url: studentProfile.avatar_url
          } as StudentProfile;
        } else {
          const educatorProfile = profile as SupabaseEducatorProfile;
          return {
            id: educatorProfile.id,
            email: educatorProfile.email,
            user_type: userType,
            name: educatorProfile.name,
            description: educatorProfile.description,
            image: educatorProfile.image
          } as EducatorProfile;
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
