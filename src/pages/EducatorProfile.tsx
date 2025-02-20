
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ClaimBanner } from "@/components/business/ClaimBanner";
import { ProfileHeader } from "@/components/educator/ProfileHeader";
import { AboutSection } from "@/components/educator/AboutSection";
import { ContactInfo } from "@/components/educator/ContactInfo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EducatorProfile {
  id: string;
  name: string;
  description: string | null;
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
  } | null;
}

const EducatorProfile = () => {
  const { id } = useParams();
  const [showClaimBanner, setShowClaimBanner] = useState(true);
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError("No profile ID provided");
        setLoading(false);
        return;
      }

      console.log('Attempting to fetch profile with ID:', id);

      const { data, error: fetchError } = await supabase
        .from('educator_profiles')
        .select('*')
        .eq('id', id)
        .single();

      console.log('Query response:', { data, error: fetchError });

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError(fetchError.message);
        toast.error('Failed to load educator profile');
        setLoading(false);
        return;
      }

      if (!data) {
        console.log('No profile data found');
        setError("Profile not found");
        setLoading(false);
        return;
      }

      console.log('Successfully fetched profile:', data);
      setProfile({
        ...data,
        social: data.social as EducatorProfile['social']
      });
      setError(null);
      setLoading(false);
    };

    fetchProfile();
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600">{error || "The educator profile you're looking for doesn't exist."}</p>
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
              <ProfileHeader
                name={profile.name}
                description={profile.description}
                image={profile.image}
                categories={profile.categories}
              />
              <AboutSection
                about={profile.about_business}
                description={profile.description}
              />
            </div>
            <div className="space-y-6">
              <ContactInfo
                address={profile.address}
                phone={profile.phone}
                email={profile.email}
                website={profile.website}
                social={profile.social}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EducatorProfile;
