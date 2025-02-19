
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BusinessProfileFormProps } from './types';
import { BasicInfoSection } from './BasicInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { AIChatbotSection } from './AIChatbotSection';
import { VoiceAgentSection } from './VoiceAgentSection';

export function BusinessProfileForm({ initialData, onSuccess }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || user?.email || '',
    about_business: initialData?.about_business || '',
    social: initialData?.social || { facebook: '', instagram: '', youtube: '' },
    ai_chatbot: initialData?.ai_chatbot || { knowledge_base: [] },
    ai_voice_agent: initialData?.ai_voice_agent || { knowledge_base: [], voice_id: 'cjVigY5qzO86Huf0OWal' }
  });

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (social: { facebook: string; instagram: string; youtube?: string }) => {
    setFormData(prev => ({ ...prev, social }));
  };

  const handleChatbotChange = (ai_chatbot: { knowledge_base: string[] }) => {
    setFormData(prev => ({ ...prev, ai_chatbot }));
  };

  const handleVoiceAgentChange = (ai_voice_agent: { knowledge_base: string[], voice_id: string }) => {
    setFormData(prev => ({ ...prev, ai_voice_agent }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      setLoading(true);
      console.log('Current user:', user);
      console.log('Initial data:', initialData);
      
      const profileData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      console.log('Submitting profile data:', profileData);

      let result;
      if (initialData?.id) {
        // Update existing profile
        result = await supabase
          .from('business_profiles')
          .update(profileData)
          .eq('id', initialData.id)
          .select()
          .single();
      } else {
        // Insert new profile
        result = await supabase
          .from('business_profiles')
          .insert([profileData])
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('Error saving profile:', error);
        toast.error(error.message || 'Error saving business profile');
        return;
      }

      console.log('Profile saved successfully:', data);
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast.error(error.message || 'Error saving business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      <BasicInfoSection
        info={{
          name: formData.name,
          description: formData.description,
          website: formData.website,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          about_business: formData.about_business,
        }}
        onChange={handleBasicInfoChange}
      />

      <SocialMediaSection
        social={formData.social}
        onChange={handleSocialChange}
      />

      <AIChatbotSection
        chatbot={formData.ai_chatbot}
        onChange={handleChatbotChange}
      />

      <VoiceAgentSection
        voiceAgent={formData.ai_voice_agent}
        onChange={handleVoiceAgentChange}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Update Profile'}
      </Button>
    </form>
  );
}
