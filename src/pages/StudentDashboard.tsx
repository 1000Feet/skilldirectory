import { Header } from "@/components/Header";
import { StudentProfileForm } from "@/components/student/StudentProfileForm";
import { LessonRequests } from "@/components/student/LessonRequests";
import { FavoriteEducators } from "@/components/student/FavoriteEducators";
import { StudentChatList } from "@/components/chat/StudentChatList";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  UserCircle, 
  Star, 
  ClipboardList, 
  MessageSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Database } from '@/types/database.types';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("profile"); // Default to profile tab
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    if (user.user_metadata?.user_type !== 'student') {
      toast.error('Access denied. This page is only for students.');
      navigate('/');
      return;
    }

    fetchUnreadCount();

    // Subscribe to new messages for real-time unread count
    const channel = supabase
      .channel('student_unread_messages')
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

  // Rename function to reflect new behavior
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
      
      // Update the student profile to mark as inactive
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
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
      navigate('/');
      
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

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="border rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[30%] border-r">
              <TabsList className="flex flex-col w-full h-auto bg-muted/30 p-0 rounded-none">
                <TabsTrigger 
                  value="profile" 
                  className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Profile</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="justify-start w-full py-4 px-5 data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none border-b border-b-transparent md:border-b-0 md:border-r border-r-transparent data-[state=active]:border-b-primary md:data-[state=active]:border-r-primary md:data-[state=active]:border-b-transparent text-left"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Favorites</span>
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
              </TabsList>
            </div>
            
            <div className="w-full md:w-[70%] bg-background">
              <TabsContent value="profile" className="m-0 p-4 md:p-6 border-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      Profile Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Update your personal information and profile settings
                    </p>
                  </div>
                  <div className="mt-2">
                    <StudentProfileForm />
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Deactivate Account
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Permanently deactivate your account and all associated data. This action cannot be undone.
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
                              Are you sure you want to deactivate your account? Your account will be deactivated and you won't be able to access it until you contact support for reactivation.
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
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deactivating...
                              </>
                            ) : (
                              'Deactivate Account'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="favorites" className="m-0 p-4 md:p-6 border-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Favorite Educators
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your favorite educators
                    </p>
                  </div>
                  <div className="mt-2">
                    <FavoriteEducators />
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
                      View and manage your lesson requests
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
                      View and respond to messages from educators
                    </p>
                  </div>
                  <div className="mt-2">
                    <StudentChatList />
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      {/* Newsletter Signup Form - Inserted at the bottom of the StudentDashboard page */}
      <div className="mt-12 mb-8 w-full max-w-2xl mx-auto">
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.5%', height: 0 }}>
          <iframe
            src="https://f0664087.sibforms.com/serve/MUIFAKyTpdQ0NbAyIL1Jp4Xe9zYg6IgoY3rLdmtSNQtY8izN8ewacp_ydaSQPkpPl18Z0OoZtfC---X9s1zpZTfCfj4o-wvw2fUN05T9H3mpLOtoQH235RvYuYmtXhmbMAf6Tn3cG66v8NqHBehOmumpPCAi_zATtlS_cY4zDjbxNgYPl2XHZpzKqgFc5I1OHCYLot9R-DNBumcg"
            frameBorder="0"
            scrolling="auto"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block', maxWidth: '100%' }}
            title="Newsletter Signup"
          ></iframe>
        </div>
      </div>
    </>
  );
}
