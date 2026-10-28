import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { ClaimBanner } from "@/components/business/ClaimBanner";
import { ProfileHeader } from "@/components/educator/ProfileHeader";
import { AboutSection } from "@/components/educator/AboutSection";
import { ContactInfo } from "@/components/educator/ContactInfo";
import { RequestLessonForm } from "@/components/student/RequestLessonForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Video, Calendar, Lock } from "lucide-react";
import { ChatModal } from "@/components/educator/ChatModal";
import { Reviews } from '@/components/educator/Reviews';
import { ProfileViewTracker } from "@/components/ProfileViewTracker";
import { StudentChatModal } from "@/components/chat/StudentChatModal";
import { useAuth } from "@/hooks/useAuth";

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
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    // Replace ampersand with 'and' before general replacement
    .replace(/&/g, 'and')
    // Then replace all non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const getEmbedUrl = (url: string) => {
  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};

const EducatorProfile = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const profileId = location.state?.id;
  const queryParams = new URLSearchParams(location.search);
  const queryProfileId = queryParams.get('id');
  const [sessionProfileId, setSessionProfileId] = useState<string | null>(null);
  
  // Get the ID from all possible sources, with priority
  const effectiveProfileId = profileId || queryProfileId || sessionProfileId;
  const { user } = useAuth();
  const [isStudent, setIsStudent] = useState(false);

  // Get profile ID from sessionStorage on component mount
  useEffect(() => {
    const storedId = sessionStorage.getItem('educator_profile_id');
    if (storedId) {
      setSessionProfileId(storedId);
      // Clear the session storage after getting the ID
      sessionStorage.removeItem('educator_profile_id');
    }
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsStudent(false);
        return;
      }

      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setIsStudent(!!studentProfile);
    };

    checkUserRole();
  }, [user]);
  
  const [showClaimBanner, setShowClaimBanner] = useState(false);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStudentChatOpen, setIsStudentChatOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let profileData;
        
        if (effectiveProfileId) {
          // If we have a profileId from any source, use it directly
          const { data, error } = await supabase
            .from('educator_profiles')
            .select('*, memberships(*)')
            .eq('id', effectiveProfileId)
            .eq('is_active', true)
            .single();
            
          if (error) throw error;
          profileData = data;
        } else if (slug) {
          // Try to find the profile by exact slug match first
          const decodedSlug = decodeURIComponent(slug);
          const { data: exactMatches, error: exactError } = await supabase
            .from('educator_profiles')
            .select('*, memberships(*)')
            .eq('is_active', true)
            .filter('name', 'neq', null)
            .filter('name', 'neq', '');

          if (exactError) throw exactError;

          // Find the profile where the slug exactly matches
          profileData = exactMatches?.find(profile => 
            createSlug(profile.name) === decodedSlug
          );

          // If no exact match found, try a more permissive search as fallback
          if (!profileData) {
            const normalizedSlug = decodedSlug.replace(/-/g, ' ').toLowerCase();
            const { data: fuzzyMatches, error: fuzzyError } = await supabase
              .from('educator_profiles')
              .select('*, memberships(*)')
              .eq('is_active', true)
              .ilike('name', `%${normalizedSlug}%`)
              .limit(5);  // Limit to prevent too many matches

            if (fuzzyError) throw fuzzyError;
            
            // Try to find the closest match
            profileData = fuzzyMatches?.find(profile => {
              const profileSlug = createSlug(profile.name);
              return profileSlug.includes(decodedSlug) || decodedSlug.includes(profileSlug);
            });
          }
        }

        if (!profileData) {
          setError('Educator profile not found or has been deactivated');
          setLoading(false);
          return;
        }

        // Always redirect to the canonical URL if needed, but without query parameters
        const expectedSlug = createSlug(profileData.name);
        if (!effectiveProfileId && slug !== expectedSlug) {
          navigate(`/educator/${encodeURIComponent(expectedSlug)}`, { 
            state: { id: profileData.id },
            replace: true 
          });
          return;
        } else if (queryProfileId) {
          // If we have a query parameter ID, remove it from URL while preserving state
          navigate(`/educator/${encodeURIComponent(expectedSlug)}`, {
            state: { id: profileData.id },
            replace: true
          });
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Educator profile not found or has been deactivated');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [effectiveProfileId, slug, navigate, queryProfileId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Available</h1>
            <p className="text-gray-600 mb-6">{error || 'This educator profile is not available or has been deactivated.'}</p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  const embedUrl = profile.youtube_url ? getEmbedUrl(profile.youtube_url) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {profile.id && <ProfileViewTracker educatorProfileId={profile.id} />}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-4">
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
                educatorId={profile.id}
              />
              
              <AboutSection
                about={profile.about_business}
                description={profile.description}
              />

              <div className="mt-8 space-y-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4">About</h2>
                  <p className="text-gray-700">{profile.description || 'No bio available.'}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                  <Reviews educatorId={profile.id} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F2FCE2] p-6 rounded-lg text-center">
                  <MessageSquare className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold mb-2">Chat with AI Assistant</h3>
                  <p className="text-sm text-gray-600 mb-4">Ask about our services to our AI Agent!</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsChatOpen(true)}
                  >
                    Start Chat
                  </Button>
                </div>

                <div className="bg-[#F2FCE2] p-6 rounded-lg text-center">
                  <Video className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold mb-2">Watch Our Studio</h3>
                  <p className="text-sm text-gray-600 mb-4">YouTube video presentation of our work</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsVideoModalOpen(true)}
                    disabled={!embedUrl}
                  >
                    Watch Video
                  </Button>
                </div>

                <div className="bg-[#F2FCE2] p-6 rounded-lg text-center">
                  <Calendar className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <h3 className="font-semibold mb-2">Book a Lesson</h3>
                  <p className="text-sm text-gray-600 mb-4">Free introductory lesson (in person or online)</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsRequestFormOpen(true)}
                  >
                    Schedule Now
                  </Button>
                </div>
              </div>

              <div className="bg-[#F2FCE2] p-6 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Direct Message
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Send a direct message to {profile.name} to discuss your learning needs
                </p>
                {!user && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/auth')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Login to Chat
                  </Button>
                )}
                {user && !isStudent && (
                  <p className="text-sm text-amber-600 text-center">
                    Only students can initiate chats with educators
                  </p>
                )}
                {user && isStudent && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsStudentChatOpen(true)}
                  >
                    Start Chat
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-center text-green-600">
                  Start with a FREE VIDEO LESSON NOW!
                </h2>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  {embedUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={embedUrl}
                      title="Video presentation"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No video available
                    </div>
                  )}
                </div>
              </div>

              <ContactInfo
                address={profile.address}
                phone={profile.phone}
                email={profile.email}
                website={profile.website}
                facebook_url={profile.facebook_url}
                instagram_url={profile.instagram_url}
              />
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isRequestFormOpen} onOpenChange={setIsRequestFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a Lesson</DialogTitle>
          </DialogHeader>
          <RequestLessonForm 
            educatorId={profile.id}
            educatorProfileId={profile.id}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Presentation</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {embedUrl && (
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title="Video presentation"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isChatOpen && (
        <ChatModal 
          isOpen={isChatOpen} 
          onOpenChange={setIsChatOpen}
          profile={profile}
        />
      )}

      <StudentChatModal
        isOpen={isStudentChatOpen}
        onOpenChange={setIsStudentChatOpen}
        educatorId={profile.id}
        educatorName={profile.name}
      />
    </div>
  );
};

export default EducatorProfile;
