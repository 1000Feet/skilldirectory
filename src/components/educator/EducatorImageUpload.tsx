
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EducatorImageUploadProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  loading: boolean;
}

export function EducatorImageUpload({ currentImage, onImageUpload, loading }: EducatorImageUploadProps) {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('educator-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('educator-images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading image');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUpload">Profile Image</Label>
      <div className="flex items-center gap-4">
        {currentImage && (
          <img 
            src={currentImage} 
            alt="Educator" 
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
            name="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
