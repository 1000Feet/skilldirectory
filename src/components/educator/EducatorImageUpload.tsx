import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface EducatorImageUploadProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  loading?: boolean;
}

export function EducatorImageUpload({ currentImage, onImageUpload, loading = false }: EducatorImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `business-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUpload">Business Image</Label>
      <div className="flex items-center gap-4">
        {currentImage ? (
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Business" 
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                className="text-white"
                onClick={() => document.getElementById('imageUpload')?.click()}
                disabled={loading || isUploading}
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => document.getElementById('imageUpload')?.click()}
              disabled={loading || isUploading}
              className="h-full w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      <input
        id="imageUpload"
        name="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={loading || isUploading}
      />
      <p className="text-sm text-gray-500 mt-1">
        Recommended: Square image, max 5MB
      </p>
    </div>
  );
}
