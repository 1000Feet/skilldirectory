import { supabase } from '@/integrations/supabase/client';
import { MembershipType } from '@/lib/auth-types';

export const useMembership = () => {
  const createMembership = async (educatorId: string, type: MembershipType) => {
    try {
      // Set current period end to 30 days from now
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

      const { data, error } = await supabase
        .from('memberships')
        .insert([
          {
            educator_id: educatorId,
            type: type,
            status: 'active',
            start_date: new Date().toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: currentPeriodEnd.toISOString(),
            auto_renew: true,
            metadata: {}
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Membership creation error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from membership creation');
      }

      return data;
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  };

  return { createMembership };
};
