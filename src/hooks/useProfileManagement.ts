
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';
import { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type StudentProfileRow = Tables['student_profiles']['Row'];
type EducatorProfileRow = Tables['educator_profiles']['Row'];

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      console.log(`Fetching ${userType} profile`);
      
      if (userType === 'student') {
        const { data: studentProfile, error: studentError } = await supabase
          .from('student_profiles')
          .select('id, email, first_name, last_name, avatar_url')
          .eq('id', userId)
          .single<StudentProfileRow>();

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
          .select('id, email, name, description, image')
          .eq('user_id', userId)
          .single<EducatorProfileRow>();

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

  const updateProfile = async (userId: string, userType: UserType, profileData: any) => {
    try {
      console.log(`Updating ${userType} profile for user ${userId}`);
      
      if (userType === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .update(profileData)
          .eq('id', userId)
          .select()
          .single();

        if (error) throw error;
        
        return {
          id: data.id,
          email: data.email,
          user_type: 'student' as const,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar_url: data.avatar_url
        } satisfies StudentProfile;
      } else {
        const { data, error } = await supabase
          .from('educator_profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        
        return {
          id: data.id,
          email: data.email,
          user_type: 'educator' as const,
          name: data.name,
          description: data.description,
          image: data.image
        } satisfies EducatorProfile;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return { fetchProfile, updateProfile };
};
