import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialMediaSectionProps {
  facebook: string;
  instagram: string;
  youtube?: string;
  onChange: (social: { facebook: string; instagram: string; youtube?: string }) => void;
  hiddenFields?: {
    facebook?: boolean;
    instagram?: boolean;
    youtube?: boolean;
  };
}

export function SocialMediaSection({ facebook, instagram, youtube, onChange, hiddenFields = {} }: SocialMediaSectionProps) {
  const handleChange = (field: 'facebook' | 'instagram' | 'youtube', value: string) => {
    onChange({
      facebook: field === 'facebook' ? value : facebook,
      instagram: field === 'instagram' ? value : instagram,
      youtube: field === 'youtube' ? value : youtube,
    });
  };

  const socialFields = [
    { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/your-page' },
    { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/your-profile' },
    { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/your-channel' }
  ] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Social Media Links</h3>
      
      <div className="grid gap-4">
        {socialFields.map(field => {
          if (hiddenFields[field.id]) return null;

          return (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                value={field.id === 'youtube' ? youtube : field.id === 'instagram' ? instagram : facebook}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
