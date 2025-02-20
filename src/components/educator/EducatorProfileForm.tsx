
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
      console.log('No user found, aborting submission');
      toast.error('You must be logged in to update your profile');
      return;
    }

    if (!formData.name || !formData.email) {
      console.log('Missing required fields:', { name: formData.name, email: formData.email });
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting form submission with user:', user);
    console.log('Initial data state:', initialData);

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

    console.log('Built profile data:', JSON.stringify(profileData, null, 2));

    if (initialData?.id) {
      console.log('This is an update operation for profile ID:', initialData.id);
      Object.assign(profileData, { id: initialData.id });
    } else {
      console.log('This is a new profile creation');
    }

    try {
      if (!initialData?.id) {
        console.log('Starting direct insert operation...');
        console.time('insertOperation');
        
        const { data: insertData, error: insertError } = await supabase
          .from('educator_profiles')
          .insert(profileData)
          .select()
          .single();

        console.timeEnd('insertOperation');
        console.log('Insert operation completed');
        console.log('Insert response:', { 
          data: insertData, 
          error: insertError,
          status: insertError ? 'failed' : 'success'
        });

        if (insertError) {
          console.error('Insert operation failed:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          toast.error(insertError.message || 'Failed to create profile');
          setIsSubmitting(false);
          return;
        }

        if (insertData) {
          console.log('Insert operation succeeded:', insertData);
          toast.success('Profile created successfully');
          if (onSuccess) onSuccess();
          setIsSubmitting(false);
          return;
        }
      }

      console.log('Starting upsert operation...');
      console.time('upsertOperation');

      const { data, error } = await supabase
        .from('educator_profiles')
        .upsert(profileData)
        .select()
        .single();

      console.timeEnd('upsertOperation');
      console.log('Upsert operation completed');
      console.log('Upsert response:', { 
        data, 
        error,
        status: error ? 'failed' : 'success'
      });

      if (error) {
        console.error('Upsert operation failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast.error(error.message || 'Failed to save profile');
        return;
      }

      if (!data) {
        console.error('Upsert operation returned no data');
        toast.error('Failed to save profile - no data returned');
        return;
      }

      console.log('Profile saved successfully:', data);
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Unexpected error during profile submission:', {
        error,
        message: error.message,
        stack: error.stack
      });
      toast.error(error.message || 'Failed to save profile');
    } finally {
      console.log('Form submission completed, resetting submit state');
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
