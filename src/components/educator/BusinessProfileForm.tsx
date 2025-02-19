
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BusinessImageUpload } from './BusinessImageUpload';
import { SocialMediaInputs } from './SocialMediaInputs';
import type { BusinessProfileFormProps } from './types';

export function BusinessProfileForm({ initialData, onSuccess }: BusinessProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || user?.email || '',
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    social: initialData?.social || { facebook: '', instagram: '' },
    about_business: initialData?.about_business || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const profileData = {
        ...formData,
        user_id: user.id,
      };

      const { error } = initialData?.id
        ? await supabase
            .from('business_profiles')
            .update(profileData)
            .eq('id', initialData.id)
        : await supabase
            .from('business_profiles')
            .insert([profileData]);

      if (error) throw error;
      onSuccess?.();
      toast.success(initialData ? 'Profile updated successfully' : 'Profile created successfully');
    } catch (error: any) {
      toast.error('Error saving business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <BusinessImageUpload
          currentImage={formData.image}
          onImageUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
          loading={loading}
        />

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aboutBusiness">About Your Business</Label>
          <Textarea
            id="aboutBusiness"
            name="aboutBusiness"
            value={formData.about_business}
            onChange={(e) => setFormData(prev => ({ ...prev, about_business: e.target.value }))}
            className="h-32"
          />
        </div>

        <SocialMediaInputs
          facebook={formData.social.facebook}
          instagram={formData.social.instagram}
          onChange={(social) => setFormData(prev => ({ ...prev, social }))}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : (initialData ? 'Update Profile' : 'Create Profile')}
      </Button>
    </form>
  );
}
