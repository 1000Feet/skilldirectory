
import { Card } from "@/components/ui/card";

interface Social {
  facebook: string;
  instagram: string;
  youtube?: string;
}

interface ContactInfoProps {
  address: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  social: Social | null;
}

export const ContactInfo = ({ address, phone, email, website, social }: ContactInfoProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      <div className="space-y-4">
        {address && (
          <div>
            <h3 className="font-medium">Address</h3>
            <p className="text-gray-600">{address}</p>
          </div>
        )}
        {phone && (
          <div>
            <h3 className="font-medium">Phone</h3>
            <p className="text-gray-600">{phone}</p>
          </div>
        )}
        <div>
          <h3 className="font-medium">Email</h3>
          <p className="text-gray-600">{email}</p>
        </div>
        {website && (
          <div>
            <h3 className="font-medium">Website</h3>
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {website}
            </a>
          </div>
        )}
      </div>

      {social && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Social Media</h3>
          <div className="flex gap-4">
            {social.facebook && (
              <a 
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Facebook
              </a>
            )}
            {social.instagram && (
              <a 
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Instagram
              </a>
            )}
            {social.youtube && (
              <a 
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube
              </a>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
