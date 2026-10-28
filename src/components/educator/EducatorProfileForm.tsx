import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BasicInfoSection } from './BasicInfoSection';
import { SocialMediaSection } from './SocialMediaSection';
import { AIChatbotSection } from './AIChatbotSection';
import { VoiceAgentSection } from './VoiceAgentSection';
import { EducatorImageUpload } from './EducatorImageUpload';
import { CategorySelection } from './CategorySelection';
import { EducatorProfile, VoiceAgent } from '@/types/supabase';
import { MembershipType } from '@/lib/auth-types';
import { Database } from '@/lib/database.types';
import { MembershipFieldPermissions, DEFAULT_FIELD_PERMISSIONS, EDUCATOR_PROFILE_FIELDS } from '@/types/membership-fields';

interface FormProps {
  initialData?: EducatorProfile | null;
  onSuccess?: (updatedProfile: EducatorProfile) => void;
  membershipType?: MembershipType;
}

export function EducatorProfileForm({ initialData, onSuccess, membershipType: propMembershipType }: FormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldPermissions, setFieldPermissions] = useState<MembershipFieldPermissions>(DEFAULT_FIELD_PERMISSIONS);
  const [userMembershipType, setUserMembershipType] = useState<MembershipType>(propMembershipType || 'standard');
  const [formData, setFormData] = useState<Omit<EducatorProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || user?.email || '',
    about_business: initialData?.about_business || '',
    image: initialData?.image || '',
    facebook_url: initialData?.facebook_url || '',
    instagram_url: initialData?.instagram_url || '',
    youtube_url: initialData?.youtube_url || '',
    ai_chatbot: initialData?.ai_chatbot || '',
    ai_voice_agent: initialData?.ai_voice_agent || { 
      knowledge_base: [], 
      voice_id: 'cjVigY5qzO86Huf0OWal' 
    },
    categories: initialData?.categories || [],
    tags: initialData?.tags || []
  });

  useEffect(() => {
    fetchUserMembership();
    fetchFieldPermissions();
  }, [user?.id]);

  useEffect(() => {
    if (propMembershipType) {
      setUserMembershipType(propMembershipType);
    }
  }, [propMembershipType]);

  const fetchUserMembership = async () => {
    if (!user?.id) return;

    try {
      // First get the educator profile to get the educator_id
      const { data: educatorData, error: educatorError } = await supabase
        .from('educator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (educatorError) {
        throw educatorError;
      }

      if (!educatorData?.id) {
        console.log('No educator profile found, using standard membership');
        return;
      }

      // Then get the active membership for this educator
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('type')
        .eq('educator_id', educatorData.id)
        .eq('status', 'active')
        .single();

      if (membershipError) {
        if (membershipError.code === 'PGRST116') { // Not found error
          console.log('No active membership found, using standard membership');
          return;
        }
        throw membershipError;
      }

      if (membershipData) {
        console.log('Found membership:', membershipData.type);
        setUserMembershipType(membershipData.type as MembershipType);
      }
    } catch (error) {
      console.error('Error fetching user membership:', error);
      // Keep using the current membership type on error
    }
  };

  const fetchFieldPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('field_permissions')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, use defaults
          console.log('Using default permissions:', DEFAULT_FIELD_PERMISSIONS);
          setFieldPermissions(DEFAULT_FIELD_PERMISSIONS);
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Fetched permissions:', data.permissions);
        // Ensure all fields have permission entries
        const updatedPermissions = { ...DEFAULT_FIELD_PERMISSIONS };
        EDUCATOR_PROFILE_FIELDS.forEach(field => {
          if (data.permissions[field]) {
            updatedPermissions[field] = data.permissions[field];
          }
        });
        console.log('Updated permissions:', updatedPermissions);
        setFieldPermissions(updatedPermissions);
      }
    } catch (error) {
      console.error('Error fetching field permissions:', error);
      toast.error('Failed to load field permissions');
    }
  };

  const isFieldEnabled = (fieldName: keyof typeof formData) => {
    const permission = fieldPermissions[fieldName]?.[userMembershipType];
    console.log(`Field ${fieldName} permission for ${userMembershipType}:`, permission);
    return permission ?? true;
  };

  const handleBasicInfoChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleSocialChange = (social: { facebook: string; instagram: string; youtube?: string }) => {
    const formatUrl = (url: string) => {
      if (!url) return '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    };

    setFormData(prev => ({ 
      ...prev, 
      facebook_url: formatUrl(social.facebook),
      instagram_url: formatUrl(social.instagram),
      youtube_url: social.youtube ? formatUrl(social.youtube) : ''
    }));
  };

  const handleChatbotChange = (value: string) => {
    console.log('Updating chatbot knowledge base:', value);
    setFormData(prev => ({
      ...prev,
      ai_chatbot: value
    }));
  };

  const handleVoiceAgentChange = (ai_voice_agent: VoiceAgent) => {
    setFormData(prev => ({ ...prev, ai_voice_agent }));
  };

  const handleCategoryChange = (categories: string[]) => {
    setFormData(prev => ({ ...prev, categories }));
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

    try {
      const formatUrl = (url: string) => {
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      };

      const profileData = {
        user_id: user.id,
        ...formData,
        website: formatUrl(formData.website.trim()),
        facebook_url: formatUrl(formData.facebook_url.trim()),
        instagram_url: formatUrl(formData.instagram_url.trim()),
        youtube_url: formData.youtube_url ? formatUrl(formData.youtube_url.trim()) : '',
        updated_at: new Date().toISOString()
      };

      let result;
      if (initialData?.id) {
        result = await supabase
          .from('educator_profiles')
          .update(profileData)
          .eq('id', initialData.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('educator_profiles')
          .insert({
            ...profileData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      onSuccess?.(result.data as EducatorProfile);
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Failed to save profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  // Get the basic info fields that are hidden
  const hiddenBasicInfoFields = {
    name: !isFieldEnabled('name'),
    description: !isFieldEnabled('description'),
    website: !isFieldEnabled('website'),
    address: !isFieldEnabled('address'),
    phone: !isFieldEnabled('phone'),
    email: !isFieldEnabled('email'),
    about_business: !isFieldEnabled('about_business'),
  };

  // Get the social media fields that are hidden
  const hiddenSocialFields = {
    facebook: !isFieldEnabled('facebook_url'),
    instagram: !isFieldEnabled('instagram_url'),
    youtube: !isFieldEnabled('youtube_url')
  };

  // Check if any field in a section is enabled to show the section
  const showSocialSection = Object.values(hiddenSocialFields).some(hidden => !hidden);

  return (
    <form onSubmit={onSubmit} className="space-y-8 p-6">
      {/* Image upload is controlled by field permissions */}
      {isFieldEnabled('image') && (
        <EducatorImageUpload
          currentImage={formData.image}
          onImageUpload={handleImageChange}
          loading={isSubmitting}
        />
      )}

      {/* Basic Info section with hidden fields */}
      <BasicInfoSection 
        info={formData} 
        onChange={handleBasicInfoChange}
        hiddenFields={hiddenBasicInfoFields}
      />

      {/* Social Media section with hidden fields */}
      {showSocialSection && (
        <SocialMediaSection 
          facebook={formData.facebook_url}
          instagram={formData.instagram_url}
          youtube={formData.youtube_url}
          onChange={handleSocialChange}
          hiddenFields={hiddenSocialFields}
        />
      )}

      {/* AI Chatbot section is controlled by field permissions */}
      {isFieldEnabled('ai_chatbot') && (
        <AIChatbotSection
          value={formData.ai_chatbot}
          onChange={handleChatbotChange}
        />
      )}

      {/* Voice Agent section is controlled by field permissions */}
      {isFieldEnabled('ai_voice_agent') && (
        <VoiceAgentSection
          knowledgeBase={formData.ai_voice_agent?.knowledge_base}
          voiceId={formData.ai_voice_agent?.voice_id}
          onChange={handleVoiceAgentChange}
        />
      )}

      {/* Category Selection is controlled by field permissions */}
      {isFieldEnabled('categories') && (
        <CategorySelection
          selectedCategories={formData.categories}
          onChange={handleCategoryChange}
        />
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
