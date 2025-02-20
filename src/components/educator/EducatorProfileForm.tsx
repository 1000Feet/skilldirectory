
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
    console.log('1. handleSubmit called');
    
    if (!user) {
      console.log('2. No user found, aborting submission');
      toast.error('You must be logged in to update your profile');
      return;
    }

    console.log('3. User is present:', user);

    if (!formData.name || !formData.email) {
      console.log('4. Missing required fields:', { name: formData.name, email: formData.email });
      toast.error('Name and email are required');
      return;
    }

    console.log('5. Required fields are present');
    setIsSubmitting(true);
    console.log('6. Set isSubmitting to true');

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

    console.log('7. Profile data prepared:', profileData);

    try {
      console.log('8. Starting try block');
      if (!initialData?.id) {
        console.log('9. No initial data ID, attempting insert');
        
        try {
          console.log('10. Before supabase.from call');
          const { data: insertData, error: insertError } = await supabase
            .from('educator_profiles')
            .insert(profileData)
            .select();
          
          console.log('11. After supabase.from call');
          console.log('Insert response:', { data: insertData, error: insertError });

          if (insertError) {
            console.error('12. Insert error:', insertError);
            toast.error(insertError.message || 'Failed to create profile');
            setIsSubmitting(false);
            return;
          }

          console.log('13. Insert successful:', insertData);
          toast.success('Profile created successfully');
          if (onSuccess) onSuccess();
          setIsSubmitting(false);
          return;
        } catch (insertErr) {
          console.error('14. Unexpected insert error:', insertErr);
          toast.error('Failed to create profile');
          setIsSubmitting(false);
          return;
        }
      }

      console.log('15. Has initial data ID, attempting upsert');
      const { data, error } = await supabase
        .from('educator_profiles')
        .upsert(profileData)
        .select();

      console.log('16. Upsert response:', { data, error });

      if (error) {
        console.error('17. Upsert error:', error);
        toast.error(error.message || 'Failed to save profile');
        return;
      }

      if (!data) {
        console.error('18. No data returned from upsert');
        toast.error('Failed to save profile - no data returned');
        return;
      }

      console.log('19. Profile saved successfully:', data);
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('20. Unexpected error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      console.log('21. Finally block reached');
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
