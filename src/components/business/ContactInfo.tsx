
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
    <div className="p-6 bg-white rounded-lg border">
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      <div className="space-y-4">
        <a href={business.website} className="flex items-center gap-3 text-gray-600 hover:text-[#70B62C]">
          <Globe className="w-5 h-5" />
          <span>Visit Website</span>
        </a>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span>{business.address}</span>
        </div>
        <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-[#70B62C]">
          <Phone className="w-5 h-5" />
          <span>{business.phone}</span>
        </a>
        <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-gray-600 hover:text-[#70B62C]">
          <Mail className="w-5 h-5" />
          <span>{business.email}</span>
        </a>
        <div className="flex gap-4 mt-4">
          <a href={business.social.facebook} className="text-gray-600 hover:text-[#70B62C]">
            <Facebook className="w-5 h-5" />
          </a>
          <a href={business.social.instagram} className="text-gray-600 hover:text-[#70B62C]">
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};
