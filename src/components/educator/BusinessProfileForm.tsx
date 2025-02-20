
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
  const [isCreated, setIsCreated] = useState(false);
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
    
    if (loading) {
      console.log('Already submitting, please wait...');
      return;
    }

    setLoading(true);
    setIsCreated(false);

    try {
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }

      if (!formData.name || !formData.email) {
        throw new Error('Name and email are required');
      }

      const profileData = {
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
        user_id: user.id,
        categories: [],
        tags: []
      };

      // First, check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      const profileId = initialData?.id || existingProfile?.id;
      let result;

      if (profileId) {
        // Update existing profile
        result = await supabase
          .from('business_profiles')
          .update(profileData)
          .eq('id', profileId)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('business_profiles')
          .insert([profileData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Only set success state if we have data
      if (result.data) {
        setIsCreated(true);
        toast.success(profileId ? 'Profile updated successfully' : 'Profile created successfully');
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsCreated(false);
        }, 3000);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error('No data returned from database');
      }
    } catch (error: any) {
      console.error('Error in profile submission:', error);
      toast.error(error.message || 'Failed to save profile');
      setIsCreated(false);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Saving...';
    if (isCreated) return 'Profile Created!';
    return initialData ? 'Update Profile' : 'Create Profile';
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

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
        variant={isCreated ? "secondary" : "default"}
      >
        {getButtonText()}
      </Button>
    </form>
  );
}
