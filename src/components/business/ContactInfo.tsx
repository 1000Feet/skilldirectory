
import { Card } from "@/components/ui/card";
import { Globe, Facebook, Instagram, MapPin, Phone, Mail } from "lucide-react";

interface ContactInfoProps {
  business: {
    website: string;
    address: string;
    phone: string;
    email: string;
    social: {
      facebook: string;
      instagram: string;
    };
  };
}

export const ContactInfo = ({ business }: ContactInfoProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      <div className="space-y-4">
        <a href={business.website} className="flex items-center gap-3 text-gray-600 hover:text-primary">
          <Globe className="w-5 h-5" />
          <span>Visit Website</span>
        </a>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span>{business.address}</span>
        </div>
        <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
          <Phone className="w-5 h-5" />
          <span>{business.phone}</span>
        </a>
        <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
          <Mail className="w-5 h-5" />
          <span>{business.email}</span>
        </a>
        <div className="flex gap-4 mt-4">
          <a href={business.social.facebook} className="text-gray-600 hover:text-primary">
            <Facebook className="w-5 h-5" />
          </a>
          <a href={business.social.instagram} className="text-gray-600 hover:text-primary">
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </Card>
  );
};
