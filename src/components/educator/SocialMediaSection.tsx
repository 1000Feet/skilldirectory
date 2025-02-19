
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube?: string;
}

interface SocialMediaSectionProps {
  social: SocialLinks;
  onChange: (social: SocialLinks) => void;
}

export function SocialMediaSection({ social, onChange }: SocialMediaSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Social Media</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Facebook URL"
            value={social.facebook}
            onChange={(e) => onChange({ ...social, facebook: e.target.value })}
          />
          <Input
            placeholder="Instagram URL"
            value={social.instagram}
            onChange={(e) => onChange({ ...social, instagram: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Introduction Video</Label>
        <Input
          placeholder="YouTube Video URL"
          value={social.youtube}
          onChange={(e) => onChange({ ...social, youtube: e.target.value })}
        />
        <p className="text-sm text-gray-600">Add the URL of your introductory video from YouTube</p>
      </div>
    </div>
  );
}
