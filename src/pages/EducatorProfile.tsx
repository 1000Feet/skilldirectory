
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { ClaimBanner } from "@/components/business/ClaimBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EducatorProfile {
  id: string;
  name: string;
  description: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  categories: string[] | null;
  tags: string[] | null;
  about_business: string | null;
  social: {
    facebook: string;
    instagram: string;
    youtube?: string;
  };
}

const EducatorProfile = () => {
  const { id } = useParams();
  const [showClaimBanner, setShowClaimBanner] = useState(true);
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data as EducatorProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load educator profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600">The educator profile you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          {showClaimBanner && (
            <ClaimBanner onClose={() => setShowClaimBanner(false)} />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {profile.image ? (
                      <img 
                        src={profile.image} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                    <p className="text-gray-600 mb-4">{profile.description}</p>
                    {profile.categories && profile.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.categories.map((category) => (
                          <span 
                            key={category}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* About Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About the Educator</h2>
                <p className="text-gray-600">
                  {profile.about_business || profile.description}
                </p>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {profile.address && (
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-gray-600">{profile.address}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600">{profile.phone}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">{profile.email}</p>
                  </div>
                  {profile.website && (
                    <div>
                      <h3 className="font-medium">Website</h3>
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {profile.social && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Social Media</h3>
                    <div className="flex gap-4">
                      {profile.social.facebook && (
                        <a 
                          href={profile.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                      {profile.social.instagram && (
                        <a 
                          href={profile.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                      {profile.social.youtube && (
                        <a 
                          href={profile.social.youtube}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorProfile;
