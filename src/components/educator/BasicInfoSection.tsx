
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfo {
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  about_business: string;
}

interface BasicInfoSectionProps {
  info: BasicInfo;
  onChange: (field: keyof BasicInfo, value: string) => void;
}

export function BasicInfoSection({ info, onChange }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={info.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="bg-white focus:bg-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={info.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="bg-white focus:bg-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={info.website}
          onChange={(e) => onChange('website', e.target.value)}
          className="bg-white focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={info.address}
          onChange={(e) => onChange('address', e.target.value)}
          className="bg-white focus:bg-white"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={info.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="bg-white focus:bg-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={info.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="bg-white focus:bg-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aboutBusiness">About Your Business</Label>
        <Textarea
          id="aboutBusiness"
          value={info.about_business}
          onChange={(e) => onChange('about_business', e.target.value)}
          className="h-32 bg-white focus:bg-white"
        />
      </div>
    </div>
  );
}
