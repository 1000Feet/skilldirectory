import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { callEdge } from '@/integrations/supabase/edge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { FeaturedEducatorsManager } from '@/components/admin/FeaturedEducatorsManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { FieldPermissionsManager } from '@/components/admin/FieldPermissionsManager';
import { CouponManager } from '@/components/admin/CouponManager';
import { SupportSubmissionsManager } from '@/components/admin/SupportSubmissionsManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { StripeTransactionsManager } from '@/components/admin/StripeTransactionsManager';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MEMBERSHIP_NAMES, MEMBERSHIP_PRICES } from '@/services/payment-config';
import { MembershipType } from '@/lib/auth-types';

interface User {
  id: string;
  email: string;
  user_type: 'student' | 'educator';
  is_active: boolean;
  name: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  user_id: string;
}

interface MembershipData {
  id: string;
  educator_id: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  type: MembershipType;
  created_at: string;
  updated_at: string;
  subscription_id: string | null;
  metadata: Record<string, any>;
  educator_name: string;
  educator_email: string;
}

export default function AdminSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [activeUserTab, setActiveUserTab] = useState("all-users");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Memoized fetchUsers function to prevent unnecessary recreations
  const fetchUsers = useCallback(async () => {
    try {
      // Use Promise.all to fetch both profiles in parallel
      const [educatorResult, studentResult] = await Promise.all([
        supabase
          .from('educator_profiles')
          .select('id, email, name, is_active, user_id')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('student_profiles')
          .select('id, email, name, is_active, user_id')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (educatorResult.error) throw educatorResult.error;
      if (studentResult.error) throw studentResult.error;

      // Process data in memory rather than multiple loops
      const formattedEducators = (educatorResult.data || [])
        .filter((ed: UserProfile) => ed.email != null)
        .map((ed: UserProfile) => ({
          id: ed.user_id,
          email: ed.email,
          name: ed.name,
          is_active: ed.is_active,
          user_type: 'educator' as const
        }));

      const formattedStudents = (studentResult.data || [])
        .filter((st: UserProfile) => st.email != null)
        .map((st: UserProfile) => ({
          id: st.user_id,
          email: st.email,
          name: st.name,
          is_active: st.is_active,
          user_type: 'student' as const
        }));

      setUsers([...formattedEducators, ...formattedStudents]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch membership data
  const fetchMemberships = useCallback(async () => {
    try {
      setMembershipLoading(true);
      console.log('Fetching membership data...');
      
      const { data } = await callEdge<{ data: any[] }>('admin-api', 'list-memberships');

      console.log('Fetched membership data with joins:', data);
      
      const formattedData = data.map((item: any) => ({
        id: item.id,
        educator_id: item.educator_id,
        status: item.status || 'inactive',
        type: item.type || 'basic',
        created_at: item.created_at,
        updated_at: item.updated_at,
        subscription_id: item.subscription_id,
        metadata: item.metadata || {},
        educator_name: item.educator_profiles?.name || 'Unknown',
        educator_email: item.educator_profiles?.email || 'Unknown'
      }));
      
      console.log('Formatted membership data:', formattedData);
      setMemberships(formattedData);
    } catch (error) {
      console.error('Error in fetchMemberships:', error);
      toast.error('Failed to fetch membership data');
      setMemberships([]); // Set empty array to handle error case
    } finally {
      setMembershipLoading(false);
    }
  }, []);

  // Check admin status and load data immediately
  useEffect(() => {
    if (!user) return;
    
    // Start loading state immediately
    setLoading(true);
    
    // Optimized: Check admin status and fetch users in parallel
    const checkAdminAndFetchUsers = async () => {
      console.log('Checking admin status for user:', user.id);
      
      // Check admin status first (need to know this before showing data)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setLoading(false);
        return;
      }
      
      console.log('Admin check result:', data);
      const isAdminUser = !!data;
      setIsAdmin(isAdminUser);
      
      // If admin, fetch users immediately
      if (isAdminUser) {
        fetchUsers();
        fetchMemberships();
      } else {
        setLoading(false);
      }
    };

    checkAdminAndFetchUsers();
  }, [user, fetchUsers, fetchMemberships]);

  // Refresh the user list after a user is toggled or deleted
  const refreshUserList = useCallback(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const toggleUserActivation = async (userId: string, userType: 'student' | 'educator', currentStatus: boolean) => {
    try {
      
      await callEdge('admin-api', 'toggle-user', { userId, userType, isActive: !currentStatus });

      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ));

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user activation:', error);
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string, userType: 'educator' | 'student') => {
    setIsDeleting(true);
    toast.loading('Deleting user...');

    try {
      await callEdge('admin-api', 'delete-user', { userId, userType });

      // Update UI
      setUsers(users.filter(user => user.id !== userId));
      setDeleteDialogOpen(false);
      toast.dismiss();
      toast.success('User deleted successfully');

    } catch (error) {
      console.error('Error in deleteUser:', error);
      toast.dismiss();
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  if (!user || (!isAdmin && !loading)) {
    console.log('Access denied. User:', user?.id, 'IsAdmin:', isAdmin);
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="featured">Featured Educators</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="fields">Field Permissions</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="featured">
            <FeaturedEducatorsManager />
          </TabsContent>

          <TabsContent value="fields">
            <FieldPermissionsManager />
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Users</h2>
                  <Tabs value={activeUserTab} onValueChange={setActiveUserTab}>
                    <TabsList>
                      <TabsTrigger value="all-users">All Users</TabsTrigger>
                      <TabsTrigger value="educators">Educators</TabsTrigger>
                      <TabsTrigger value="students">Students</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(user => {
                          if (activeUserTab === 'educators') return user.user_type === 'educator';
                          if (activeUserTab === 'students') return user.user_type === 'student';
                          return true;
                        })
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name || '-'}</TableCell>
                            <TableCell className="capitalize">{user.user_type}</TableCell>
                            <TableCell>
                              <Switch
                                checked={user.is_active}
                                onCheckedChange={() => toggleUserActivation(user.id, user.user_type, user.is_active)}
                              />
                            </TableCell>
                            <TableCell>
                              <AlertDialog open={deleteDialogOpen && userToDelete?.id === user.id}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this user? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(user.id, user.user_type)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {isDeleting ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memberships">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Membership Management</h2>
                
                {membershipLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Educator</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberships.map((membership) => (
                        <TableRow key={membership.id}>
                          <TableCell>{membership.educator_name}</TableCell>
                          <TableCell>{membership.educator_email}</TableCell>
                          <TableCell>
                            {MEMBERSHIP_NAMES[membership.type]} (
                            {MEMBERSHIP_PRICES[membership.type]}/month)
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {membership.status === 'active' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {membership.status === 'past_due' && (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              )}
                              {membership.status === 'canceled' && (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="capitalize">{membership.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(membership.updated_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManager />
          </TabsContent>

          <TabsContent value="support">
            <SupportSubmissionsManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="transactions">
            <StripeTransactionsManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
