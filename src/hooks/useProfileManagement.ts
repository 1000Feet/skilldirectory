import { supabase } from '@/integrations/supabase/client';
import { callEdge } from '@/integrations/supabase/edge';
import { UserType, Profile, StudentProfile } from '@/lib/auth-types';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Tables = Database['public']['Tables'];
type StudentProfileRow = Tables['student_profiles']['Row'];
type EducatorProfileRow = Tables['educator_profiles']['Row'];

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string, userType: UserType): Promise<Profile | null> => {
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
            email: studentProfile.email,
            user_type: 'student',
            name: studentProfile.name,
            phone: studentProfile.phone,
            created_at: studentProfile.created_at,
            updated_at: studentProfile.updated_at,
            user_id: studentProfile.user_id
          };
        }
      } else {
        const { data: educatorProfile, error: educatorError } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

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

  const createProfile = async (userId: string, userType: UserType, data: Partial<Profile>): Promise<Profile | null> => {
    try {
      console.log(`Creating ${userType} profile for user ${userId}`, data);

      if (userType === 'student') {
        // First check if profile already exists
        const { data: existingProfile } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        // If profile exists, return it
        if (existingProfile) {
          console.log('Student profile already exists');
          return {
            id: existingProfile.id,
            email: existingProfile.email,
            user_type: 'student',
            name: existingProfile.name,
            phone: existingProfile.phone,
            created_at: existingProfile.created_at,
            updated_at: existingProfile.updated_at,
            user_id: existingProfile.user_id
          };
        }

        const studentData = {
          user_id: userId,
          name: data.name || data.email?.split('@')[0] || 'Student',
          phone: (data as Partial<StudentProfile>).phone || null,
          email: data.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error } = await supabase
          .from('student_profiles')
          .insert([studentData])
          .select()
          .single();

        if (error) {
          console.error('Error creating student profile:', error);
          throw error;
        }

        return {
          id: newProfile.id,
          email: newProfile.email,
          user_type: 'student',
          name: newProfile.name,
          phone: newProfile.phone,
          created_at: newProfile.created_at,
          updated_at: newProfile.updated_at,
          user_id: newProfile.user_id
        };
      } else {
        // Check if educator profile exists
        const { data: existingProfile } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        // If profile exists, return it
        if (existingProfile) {
          console.log('Educator profile already exists');
          return {
            id: existingProfile.id,
            email: existingProfile.email,
            user_type: 'educator',
            name: existingProfile.name,
            description: existingProfile.description,
            image: existingProfile.image
          };
        }

        // Created on the server (the user has no session yet when email confirmation is on)
        const { profile: newProfile } = await callEdge<{ profile: any }>('payments', 'ensure-educator-profile', {
          userId,
          name: data.name || data.email?.split('@')[0] || 'Educator'
        });

        return {
          id: newProfile.id,
          email: newProfile.email,
          user_type: 'educator',
          name: newProfile.name,
          description: newProfile.description,
          image: newProfile.image
        };
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.code === '23505') { // Unique constraint violation
        console.log('Profile already exists, fetching existing profile');
        return await fetchProfile(userId, userType);
      }
      toast.error('Failed to create profile');
      throw error;
    }
  };

  const updateProfile = async (userId: string, userType: UserType, updates: Partial<Profile>): Promise<Profile | null> => {
    try {
      console.log(`Updating ${userType} profile for user ${userId}`, updates);

      if (userType === 'student') {
        const { data, error } = await supabase
          .from('student_profiles')
          .update({
            name: updates.name,
            phone: (updates as Partial<StudentProfile>).phone,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          email: data.email,
          user_type: 'student',
          name: data.name,
          phone: data.phone,
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id
        };
      } else {
        // Strip non-column fields (user_type, membership_type) before updating
        const { user_type: _ut, membership_type: _mt, ...educatorUpdates } = updates as Partial<Profile> & { membership_type?: string };
        const { data, error } = await supabase
          .from('educator_profiles')
          .update(educatorUpdates)
          .eq('user_id', userId)
          .select()
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

  return { fetchProfile, createProfile, updateProfile };
};
