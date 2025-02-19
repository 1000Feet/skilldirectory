
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessProfileFormProps {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    image?: string;
    website?: string;
    address?: string;
    phone?: string;
    email?: string;
    categories?: string[];
    tags?: string[];
    social?: {
      facebook: string;
      instagram: string;
    };
    about_business?: string;
  };
  onSuccess?: () => void;
}

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

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
          <Label htmlFor="name">Business Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Business Image</Label>
          <div className="flex items-center gap-4">
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Business" 
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('imageUpload')?.click()}
                disabled={loading}
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
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
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">About Your Business</Label>
          <Textarea
            id="about"
            value={formData.about_business}
            onChange={(e) => setFormData(prev => ({ ...prev, about_business: e.target.value }))}
            className="h-32"
          />
        </div>

        <div className="space-y-2">
          <Label>Social Media</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Facebook URL"
              value={formData.social.facebook}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                social: { ...prev.social, facebook: e.target.value }
              }))}
            />
            <Input
              placeholder="Instagram URL"
              value={formData.social.instagram}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                social: { ...prev.social, instagram: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : (initialData ? 'Update Profile' : 'Create Profile')}
      </Button>
    </form>
  );
}
