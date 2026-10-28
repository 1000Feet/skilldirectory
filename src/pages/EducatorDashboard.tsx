import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { EducatorProfileForm } from "@/components/educator/EducatorProfileForm";
import { LessonRequests } from "@/components/educator/LessonRequests";
import { MembershipDetails } from "@/components/educator/MembershipDetails";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, Building2, ClipboardList, CreditCard, AlertTriangle, Eye, EyeOff, Users, Loader2 } from "lucide-react";
import { useMembershipStatus } from '@/hooks/useMembershipStatus';
import { MembershipType } from '@/lib/auth-types';
import { useProfileViews } from "@/hooks/useProfileViews";
import { ChatList } from "@/components/chat/ChatList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StudentEngagementDetails } from "@/components/educator/StudentEngagementDetails";
import { useEngagementRate } from '@/hooks/useEngagementRate';

type EducatorProfile = Database['public']['Tables']['educator_profiles']['Row'];

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function EducatorDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEngagementModalOpen, setIsEngagementModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<EducatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipType, setMembershipType] = useState<MembershipType>('basic');
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("business"); // Default to business info tab
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useMembershipStatus();
  const { viewStats, loading: viewStatsLoading } = useProfileViews(profileData?.id);
  const { metrics: engagementMetrics, loading: engagementLoading } = useEngagementRate(profileData?.id);

  // Define fetchUnreadCount outside the useEffect
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (error) {
      console.error('Error fetching unread count:', error);
      return;
    }

    setUnreadCount(count || 0);
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user?.user_metadata?.user_type !== 'educator') {
      navigate('/');
      return;
    }

    const fetchEducatorProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('educator_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching educator profile:', error);
          return;
        }

        // @ts-ignore - Ignore type mismatch for now
        setProfileData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMembership = async () => {
      try {
        const { data, error } = await supabase
          .from('memberships')
          .select('type')
          .eq('educator_id', user?.id)
          .eq('status', 'active')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No active membership found, default to basic
            setMembershipType('basic');
          } else {
            throw error;
          }
        } else if (data) {
          setMembershipType(data.type as MembershipType);
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
        // Default to basic if there's an error
        setMembershipType('basic');
      }
    };

    fetchEducatorProfile();
    fetchMembership();
    fetchUnreadCount();

    // Subscribe to new messages for real-time unread count
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'broadcast',
        { event: 'message_read' },
        (payload) => {
          if (payload.payload.user_id === user.id) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, navigate]);

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

  if (!user) {
    return null;
  }

  const handleProfileUpdate = (updatedProfile: EducatorProfile) => {
    // @ts-ignore - Ignore type mismatch for now
    setProfileData(updatedProfile);
  };

  const profileSlug = profileData?.name ? createSlug(profileData.name) : user.id;

  // Add deactivateAccount function
  const deactivateAccount = async () => {
    if (!user || !password.trim()) {
      toast.error('Please enter your password');
      return;
    }
    
    setIsDeleting(true);
    const toastId = toast.loading('Deactivating your account...');

    try {
      // First verify the password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: password
      });

      if (signInError) {
        throw new Error('Incorrect password');
      }

      console.log('Password verified, proceeding with account deactivation');
      
      // Update the educator profile to mark as inactive
      const { error: updateError } = await supabase
        .from('educator_profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error deactivating account:', updateError);
        throw new Error('Failed to deactivate account. Please try again or contact support.');
      }

      // Update user metadata to indicate deactivation
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          account_status: 'deactivated',
          deactivated_at: new Date().toISOString()
        }
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }

      // Sign out the user
      await signOut();
      toast.dismiss(toastId);
      toast.success('Your account has been deactivated. Please contact support to reactivate your account.');
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error in account deactivation:', error);
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate account. Please contact support.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4 space-y-8">
        <div className="flex justify-end">
          <Link 
            to={`/educator/${profileSlug}`} 
            target="_blank"
            className="inline-flex"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Public Profile
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">
                  {engagementLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    `${engagementMetrics.engagement_rate}%`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profile engagement rate
                </p>
                <Button
                  variant="link"
                  className="mt-2 h-8 px-0"
                  onClick={() => setIsEngagementModalOpen(true)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
          
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {viewStatsLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    viewStats.totalViews.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {viewStats.last24hViews} views in the last 24h
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {viewStatsLoading ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : (
                    viewStats.uniqueViews.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Distinct profile visitors
                </p>
              </CardContent>
            </Card>
        </div>

        {/* Tabs for Business Info, Lesson Requests and Messages */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="border rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[30%] border-r">
                <TabsList className="flex flex-col md:flex-col w-full h-auto bg-muted/30 p-0 rounded-none">
                  <TabsTrigger 
                    value="business" 
                    className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Business Info</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="membership" 
                    className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Membership</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lessons" 
                    className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Lesson Requests</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages" 
                    className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Messages</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account" 
                    className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Account Management</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="w-full md:w-[70%] bg-background">
                <TabsContent value="business" className="m-0 p-4 md:p-6 border-0">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Business Information
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Update your business profile and settings
                      </p>
                    </div>

                    <div>
                      <EducatorProfileForm 
                        initialData={profileData} 
                        membershipType={membershipType}
                        onSuccess={handleProfileUpdate}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="membership" className="m-0 p-4 md:p-6 border-0">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Membership Details
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        View and manage your membership status
                      </p>
                    </div>
                    <div className="mt-2">
                      {profileData && <MembershipDetails educatorId={profileData.id} />}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="lessons" className="m-0 p-4 md:p-6 border-0">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Lesson Requests
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your lesson requests from students
                      </p>
                    </div>
                    <div className="mt-2">
                      <LessonRequests />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="m-0 p-4 md:p-6 border-0">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        View and respond to messages from students
                      </p>
                    </div>
                    <div className="mt-2">
                      <ChatList />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="account" className="m-0 p-4 md:p-6 border-0">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Account Management
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Manage your account settings and deactivation options
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-destructive mb-2">Deactivate Account</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Temporarily deactivate your account. Your profile and services will be hidden until you contact support for reactivation.
                      </p>
                      
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            Deactivate Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                              <p>
                                Are you sure you want to deactivate your account? Your profile and services will be hidden until you contact support for reactivation.
                              </p>
                              <div className="space-y-2">
                                <Label htmlFor="password">
                                  Please enter your password to confirm:
                                </Label>
                                <div className="mt-1 relative">
                                  <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                              setPassword('');
                              setShowPassword(false);
                            }}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={deactivateAccount}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              {isDeleting ? 'Deactivating...' : 'Deactivate Account'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {profileData && (
          <StudentEngagementDetails
            educatorId={profileData.id}
            isOpen={isEngagementModalOpen}
            onClose={() => setIsEngagementModalOpen(false)}
          />
        )}
      </main>
      {/* Newsletter Signup Form - Inserted at the bottom of the EducatorDashboard page */}
      <div className="mt-12 mb-8 w-full max-w-2xl mx-auto">
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.5%', height: 0 }}>
          <iframe
            src="https://f0664087.sibforms.com/serve/MUIFAKOWDCaoCZtyBzkc-R9gdu0YQGT7AnqRQceX94xI_IyrlSfC8x21-M9N6EMlEnfxQqqGIAnZJN0q4SF59kJvz6OOeBs2lKoBJjcRP5zD-LkgxuKw2330UlNL-IIQCJl4msWFAZ1cUVWkWChTtJVC4gk5m487J-NxRCRdEUQ-ONYd9H_c2XpRJGR8PBRuEpQJTAY7de6vPk1-"
            frameBorder="0"
            scrolling="auto"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block', maxWidth: '100%' }}
            title="Newsletter Signup"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
