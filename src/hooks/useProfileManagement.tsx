import { supabase } from '@/integrations/supabase/client';
import { UserType } from '@/lib/auth-types';
import { toast } from 'sonner';

export function useProfileManagement() {
  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      const tableName = userType === 'educator' ? 'educator_profiles' : 'student_profiles';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const updateProfile = async (userId: string, userType: UserType, profileData: any) => {
    try {
      const tableName = userType === 'educator' ? 'educator_profiles' : 'student_profiles';
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .single();

      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from(tableName)
          .update(profileData)
          .eq('user_id', userId);
      } else {
        // Create new profile
        result = await supabase
          .from(tableName)
          .insert([{ ...profileData, user_id: userId }]);
      }

      if (result.error) {
        toast.error('Failed to update profile');
        throw result.error;
      }

      toast.success('Profile updated successfully');
      return await fetchProfile(userId, userType);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  };

  return {
    fetchProfile,
    updateProfile,
  };
}
