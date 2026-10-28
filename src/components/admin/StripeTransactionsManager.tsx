import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/utils/environment';
import { loadStripe } from '@stripe/stripe-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_method: string;
  metadata: Record<string, string>;
}

interface TransactionStats {
  totalRevenue: number;
  monthlyRevenue: number;
  successfulTransactions: number;
  averageTransactionValue: number;
}

export function StripeTransactionsManager() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    successfulTransactions: 0,
    averageTransactionValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cachedData, setCachedData] = useState<{
    timestamp: number;
    transactions: Transaction[];
    stats: TransactionStats;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Function to fetch data from Supabase directly
  const fetchFromSupabase = async () => {
    try {
      // First check if we have admin access
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (adminError || !adminCheck) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Build query with filters
      let query = supabase
        .from('stripe_transactions')
        .select('*');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFilter) {
        const startOfDay = new Date(dateFilter);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.gte('created_at', startOfDay.toISOString())
                     .lte('created_at', endOfDay.toISOString());
      }

      // Execute query
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data as Transaction[];
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      throw error;
    }
  };

  // Function to calculate stats from transactions
  const calculateStats = (transactionData: Transaction[]) => {
    const successfulTransactions = transactionData.filter(t => t.status === 'succeeded');
    const allTransactions = transactionData; // Include all transactions for total counts
    const totalRevenue = successfulTransactions.reduce((sum, t) => sum + (t.amount / 100), 0);
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTransactions = successfulTransactions.filter(t => {
      const date = new Date(t.created_at);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + (t.amount / 100), 0);

    return {
      totalRevenue,
      monthlyRevenue,
      successfulTransactions: successfulTransactions.length,
      averageTransactionValue: allTransactions.length > 0 ? totalRevenue / successfulTransactions.length || 0 : 0
    };
  };

  // Function to sync with Stripe and update local storage
  const syncWithStripe = async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('Fetching transactions from edge function...');
      
      // Fetch transactions from Stripe via Edge Function
      const { error: fnError } = await supabase.functions.invoke('stripe-transactions', {
        body: {
          dateFilter: dateFilter ? {
            start: new Date(dateFilter).setHours(0, 0, 0, 0),
            end: new Date(dateFilter).setHours(23, 59, 59, 999)
          } : null,
          status: statusFilter !== 'all' ? statusFilter : null,
          userId: user?.id
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch Stripe transactions');
      }

      // After edge function completes, fetch the updated data from Supabase
      const transactions = await fetchFromSupabase();
      const stats = calculateStats(transactions);
      
      setTransactions(transactions);
      setStats(stats);
      
      // Cache the fetched data with a timestamp
      setCachedData({
        timestamp: Date.now(),
        transactions,
        stats
      });
      
      toast.success('Successfully synced with Stripe');
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      toast.error(error.message || 'Failed to sync with Stripe');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Check if we have cached data that's less than 10 minutes old
      const now = Date.now();
      const cacheAge = cachedData ? now - cachedData.timestamp : Infinity;
      const cacheValid = cacheAge < 10 * 60 * 1000; // 10 minutes
      
      if (cacheValid && !dateFilter && statusFilter === 'all') {
        // Use cached data
        setTransactions(cachedData.transactions);
        setStats(cachedData.stats);
        setLoading(false);
        return;
      }
      
      // Fetch from Supabase first for immediate data display
      const supabaseData = await fetchFromSupabase();
      const calculatedStats = calculateStats(supabaseData);
      
      setTransactions(supabaseData);
      setStats(calculatedStats);
      
      // Cache this data
      setCachedData({
        timestamp: Date.now(),
        transactions: supabaseData,
        stats: calculatedStats
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error(error.message || 'Failed to load transactions');
      
      // If there's an error, try to use cached data if available
      if (cachedData) {
        setTransactions(cachedData.transactions);
        setStats(cachedData.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [dateFilter, statusFilter, user]);

  // Apply search filter
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.customer_email.toLowerCase().includes(searchLower) ||
      (transaction.metadata.email && transaction.metadata.email.toLowerCase().includes(searchLower)) ||
      (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchLower)) ||
      transaction.id.toLowerCase().includes(searchLower)
    );
  });

  // Create paginated data
  const paginatedData = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Total successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageTransactionValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email, name, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(dateFilter || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              setDateFilter(undefined);
              setStatusFilter('all');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={syncWithStripe}
          disabled={loading}
          className="ml-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Sync with Stripe
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Membership Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono">{transaction.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {transaction.customer_email || transaction.metadata.email || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${(transaction.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      transaction.status === 'succeeded' && "bg-green-100 text-green-800",
                      transaction.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      transaction.status === 'failed' && "bg-red-100 text-red-800"
                    )}>
                      {transaction.status}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                  <TableCell>{transaction.metadata.membershipType || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}