
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';

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
          return {
            id: profile.id,
            email: profile.email,
            user_type: userType,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url
          } as StudentProfile;
        } else {
          return {
            id: profile.id,
            email: profile.email,
            user_type: userType,
            name: profile.name,
            description: profile.description,
            image: profile.image
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
