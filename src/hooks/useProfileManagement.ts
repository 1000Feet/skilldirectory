
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Tables = Database['public']['Tables'];
type StudentProfileRow = Tables['student_profiles']['Row'];
type EducatorProfileRow = Tables['educator_profiles']['Row'];

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType): Promise<StudentProfile | EducatorProfile | null> => {
    try {
      console.log(`Fetching ${userType} profile for user ${userId}`);
      
      if (userType === 'student') {
        const { data: studentProfile, error: studentError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (studentError) {
          console.error('Error fetching student profile:', studentError);
          return null;
        }

        if (studentProfile) {
          return {
            id: studentProfile.id,
            email: studentProfile.email || '',
            user_type: 'student',
            name: studentProfile.name,
            phone: studentProfile.phone,
            created_at: studentProfile.created_at || '',
            updated_at: studentProfile.updated_at || '',
            user_id: studentProfile.user_id
          };
        }
      } else {
        const { data: educatorProfile, error: educatorError } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle<EducatorProfileRow>();

        if (educatorError) {
          console.error('Error fetching educator profile:', educatorError);
          return null;
        }

        if (educatorProfile) {
          return {
            id: educatorProfile.id,
            email: educatorProfile.email,
            user_type: 'educator',
            name: educatorProfile.name,
            description: educatorProfile.description,
            image: educatorProfile.image
          };
        }
      }
      
      console.log(`No ${userType} profile found`);
      return null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const updateProfile = async (profileData: any): Promise<StudentProfile | EducatorProfile> => {
    try {
      console.log('Updating profile:', profileData);

      if (profileData.user_type === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .update({
            name: profileData.name,
            phone: profileData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profileData.user_id)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          email: data.email || '',
          user_type: 'student',
          name: data.name,
          phone: data.phone,
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
          user_id: data.user_id
        };
      } else {
        const { data, error } = await supabase
          .from('educator_profiles')
          .update(profileData)
          .eq('user_id', profileData.user_id)
          .select('*')
          .single();

        if (error) throw error;

        return {
          id: data.id,
          email: data.email,
          user_type: 'educator',
          name: data.name,
          description: data.description,
          image: data.image
        };
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return { fetchProfile, updateProfile };
};
