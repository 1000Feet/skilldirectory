
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
    ai_voice_agent: initialData?.ai_voice_agent || { 
      knowledge_base: [], 
      voice_id: 'cjVigY5qzO86Huf0OWal' 
    },
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    subscription_tier: initialData?.subscription_tier || 'basic'
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
    console.log('Starting profile operation with user:', user);

    try {
      const profileData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        about_business: formData.about_business.trim(),
        social: formData.social,
        ai_chatbot: formData.ai_chatbot,
        ai_voice_agent: formData.ai_voice_agent,
        categories: formData.categories,
        tags: formData.tags,
        subscription_tier: formData.subscription_tier
      };

      const { data: existingProfile, error: checkError } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      let result;
      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile...');
        result = await supabase
          .from('educator_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert new profile
        console.log('Creating new profile...');
        result = await supabase
          .from('educator_profiles')
          .insert([profileData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Profile operation failed:', result.error);
        throw result.error;
      }

      console.log('Profile saved successfully:', result.data);
      toast.success(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Profile operation error:', error);
      toast.error(error.message || 'Failed to save profile. Please try again.');
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
        {isSubmitting ? 'Saving...' : (initialData ? 'Update Profile' : 'Create Profile')}
      </Button>
    </form>
  );
}
