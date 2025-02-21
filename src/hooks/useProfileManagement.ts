
import { supabase } from '@/integrations/supabase/client';
import { UserType, StudentProfile, EducatorProfile } from '@/lib/auth-types';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Tables = Database['public']['Tables'];
type StudentProfileRow = Tables['student_profiles']['Row'];
type EducatorProfileRow = Tables['educator_profiles']['Row'];

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType) => {
    try {
      console.log(`Fetching ${userType} profile for user ${userId}`);
      
      if (userType === 'student') {
        const { data: studentProfile, error: studentError } = await supabase
          .from('student_profiles')
          .select('id, email, first_name, last_name, avatar_url')
          .eq('id', userId)
          .maybeSingle<StudentProfileRow>();

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
          .maybeSingle<EducatorProfileRow>();

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

  const updateProfile = async (userId: string, userType: UserType, profileData: Partial<StudentProfile | EducatorProfile>) => {
    try {
      console.log(`Updating ${userType} profile for user ${userId}`, profileData);

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
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const createProfile = async (userId: string, userType: UserType, profileData: Partial<StudentProfile | EducatorProfile>) => {
    try {
      console.log(`Creating ${userType} profile for user ${userId}`, profileData);

      if (userType === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .insert({
            id: userId,
            email: profileData.email,
            user_type: 'student',
            first_name: (profileData as StudentProfile).first_name || null,
            last_name: (profileData as StudentProfile).last_name || null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('educator_profiles')
          .insert({
            user_id: userId,
            email: profileData.email || '',
            name: (profileData as EducatorProfile).name || '',
            description: (profileData as EducatorProfile).description || '',
            social: { facebook: '', instagram: '', youtube: '' },
            ai_chatbot: { knowledge_base: [] },
            ai_voice_agent: { 
              knowledge_base: [],
              voice_id: 'cjVigY5qzO86Huf0OWal'
            }
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      throw error;
    }
  };

  return { fetchProfile, updateProfile, createProfile };
};
