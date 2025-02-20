
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    console.log('Current user:', user);
    console.log('Initial data:', initialData);

    // Create the profile data object without id for new profiles
    const profileData = {
      user_id: user.id,
      name: formData.name,
      description: formData.description,
      website: formData.website,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      about_business: formData.about_business,
      social: formData.social,
      ai_chatbot: formData.ai_chatbot,
      ai_voice_agent: formData.ai_voice_agent,
      categories: [],
      tags: []
    };

    // Only include id if we're updating an existing profile
    if (initialData?.id) {
      console.log('Updating existing profile with ID:', initialData.id);
      Object.assign(profileData, { id: initialData.id });
    } else {
      console.log('Creating new profile');
    }

    console.log('Submitting profile data:', profileData);

    try {
      // First try a direct insert if no initialData.id exists
      if (!initialData?.id) {
        console.log('Attempting direct insert...');
        const { data: insertData, error: insertError } = await supabase
          .from('educator_profiles')
          .insert(profileData)
          .select()
          .single();

        console.log('Insert response:', { data: insertData, error: insertError });

        if (insertError) {
          console.error('Insert error:', insertError);
          toast.error(insertError.message || 'Failed to create profile');
          setIsSubmitting(false);
          return;
        }

        if (insertData) {
          console.log('Insert successful:', insertData);
          toast.success('Profile created successfully');
          if (onSuccess) onSuccess();
          setIsSubmitting(false);
          return;
        }
      }

      // If we have an initialData.id or insert failed, try upsert
      console.log('Attempting upsert...');
      const { data, error } = await supabase
        .from('educator_profiles')
        .upsert(profileData)
        .select()
        .single();

      console.log('Upsert response:', { data, error });

      if (error) {
        console.error('Upsert error:', error);
        toast.error(error.message || 'Failed to save profile');
        return;
      }

      if (!data) {
        console.error('No data returned from upsert');
        toast.error('Failed to save profile - no data returned');
        return;
      }

      console.log('Profile saved successfully:', data);
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Profile submission error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

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
