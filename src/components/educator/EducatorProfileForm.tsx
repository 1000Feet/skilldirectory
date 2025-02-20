
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { EducatorProfileFormProps } from './types';
import { BasicInfoSection } from './BasicInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { AIChatbotSection } from './AIChatbotSection';
import { VoiceAgentSection } from './VoiceAgentSection';

export function EducatorProfileForm({ initialData, onSuccess }: EducatorProfileFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to submit the form');
      return;
    }

    if (!formData.name) {
      toast.error('Business name is required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting profile update with user:', user);

    try {
      const profileData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        about_business: formData.about_business.trim(),
        social: formData.social,
        ai_chatbot: formData.ai_chatbot,
        ai_voice_agent: formData.ai_voice_agent
      };

      const { error: updateError } = await supabase
        .from('educator_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update failed:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');
      toast.success('Profile updated successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    console.log('No user found in EducatorProfileForm');
    return null;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 p-6">
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

      <Button 
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Update Profile'}
      </Button>
    </form>
  );
}
