
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialMediaInputsProps {
  facebook: string;
  instagram: string;
  onChange: (social: { facebook: string; instagram: string }) => void;
}

export function SocialMediaInputs({ facebook, instagram, onChange }: SocialMediaInputsProps) {
  return (
    <div className="space-y-2">
      <Label>Social Media</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="facebook"
          name="facebook"
          placeholder="Facebook URL"
          value={facebook}
          onChange={(e) => onChange({ facebook: e.target.value, instagram })}
        />
        <Input
          id="instagram"
          name="instagram"
          placeholder="Instagram URL"
          value={instagram}
          onChange={(e) => onChange({ facebook, instagram: e.target.value })}
        />
      </div>
    </div>
  );
}
