
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
  console.log('Current user:', user);
  console.log('Supabase client initialized:', !!supabase);
  console.log('Full Supabase client:', supabase);

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
    console.log('Form submission started');
    
    if (!supabase) {
      console.error('Supabase client not initialized');
      toast.error('Database connection error');
      return;
    }

    if (!user) {
      console.error('No user found - aborting submission');
      toast.error('Please log in to submit the form');
      return;
    }

    if (!formData.name) {
      console.error('Name is required - aborting submission');
      toast.error('Business name is required');
      return;
    }

    console.log('Validation passed, proceeding with submission');
    setIsSubmitting(true);

    try {
      // Test basic connectivity first
      console.log('Testing Supabase connectivity...');
      const pingTest = await supabase
        .from('educator_profiles')
        .select('*')
        .limit(1);
      console.log('Ping test result:', pingTest);

      console.log('Preparing minimal test data...');
      const testData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email
      };

      console.log('Attempting test insert with minimal data:', testData);
      const testResult = await supabase
        .from('educator_profiles')
        .insert([testData])
        .select();
      
      console.log('Test insert result:', testResult);

      if (testResult.error) {
        throw testResult.error;
      }

      console.log('Test insert successful, proceeding with full data insert');
      
      const profileData = {
        ...formData,
        user_id: user.id
      };
      
      console.log('About to call Supabase with full data:', profileData);
      console.log('DEBUG: Insert line reached');
      
      const result = await supabase
        .from('educator_profiles')
        .insert([profileData])
        .select();
      
      console.log('DEBUG: Insert call finished');
      console.log('Full insert result:', result);

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      console.log('Profile created successfully:', result.data);
      toast.success('Profile created successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Caught exception in profile creation:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    console.log('No user - rendering null');
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
