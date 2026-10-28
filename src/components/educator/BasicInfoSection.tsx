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
  onChange: (field: string, value: string) => void;
  hiddenFields?: Record<string, boolean>;
}

export function BasicInfoSection({ info, onChange, hiddenFields = {} }: BasicInfoSectionProps) {
  const fields = [
    { id: 'name', label: 'Business Name *', type: 'input', required: true },
    { id: 'description', label: 'Short Description', type: 'input', placeholder: 'Brief description of your business' },
    { id: 'website', label: 'Website', type: 'input', placeholder: 'https://example.com' },
    { id: 'address', label: 'Address', type: 'input', placeholder: 'Business address' },
    { id: 'phone', label: 'Phone Number', type: 'input', placeholder: '+1 (555) 123-4567' },
    { id: 'email', label: 'Email *', type: 'input', required: true },
    { id: 'about_business', label: 'About Your Business', type: 'textarea', placeholder: 'Tell us about your business...' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      
      <div className="grid gap-4">
        {fields.map(field => {
          if (hiddenFields[field.id]) return null;

          return (
            <div key={field.id} className="grid gap-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.id}
                  value={info[field.id as keyof BasicInfo]}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-32"
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.id === 'email' ? 'email' : 'text'}
                  value={info[field.id as keyof BasicInfo]}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
