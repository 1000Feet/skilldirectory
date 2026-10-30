import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, CheckCircle } from 'lucide-react';
import { listCoupons, createCoupon, deleteCoupon, getCouponUsage, CouponResponse, CouponUsage } from '@/api/stripe-coupon-api';

interface Coupon extends CouponResponse {}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    name: '',
    percent_off: '',
    duration: 'once' as 'once' | 'repeating' | 'forever',
    duration_in_months: ''
  });
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [couponUsage, setCouponUsage] = useState<Record<string, CouponUsage[]>>({});
  const [loadingUsage, setLoadingUsage] = useState<Record<string, boolean>>({});
  const [copiedCoupon, setCopiedCoupon] = useState('');

  const fetchCoupons = async () => {
    try {
      const response = await listCoupons();
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async () => {
    try {
      await createCoupon({
        name: newCoupon.name,
        percent_off: parseFloat(newCoupon.percent_off),
        duration: newCoupon.duration,
        duration_in_months: newCoupon.duration === 'repeating' ? parseInt(newCoupon.duration_in_months) : undefined,
      });

      toast.success('Coupon created successfully');
      fetchCoupons();
      setNewCoupon({
        name: '',
        percent_off: '',
        duration: 'once',
        duration_in_months: ''
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      setIsDeleting(true);
      await deleteCoupon(couponId);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete coupon');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchCouponUsage = async (couponId: string) => {
    if (loadingUsage[couponId]) return;
    
    try {
      setLoadingUsage(prev => ({ ...prev, [couponId]: true }));
      const usageData = await getCouponUsage(couponId);
      console.log(`Fetched ${usageData.length} usage records for coupon ${couponId}`, usageData);
      setCouponUsage(prev => ({ ...prev, [couponId]: usageData }));
    } catch (error) {
      console.error(`Error fetching usage for coupon ${couponId}:`, error);
      toast.error('Failed to fetch coupon usage data');
    } finally {
      setLoadingUsage(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const toggleCouponDetails = (couponId: string) => {
    if (selectedCoupon === couponId) {
      setSelectedCoupon(null);
    } else {
      setSelectedCoupon(couponId);
      fetchCouponUsage(couponId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
      
      // Set temporary copy state for visual feedback
      setCopiedCoupon(text);
      setTimeout(() => setCopiedCoupon(''), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Coupon Name</Label>
              <Input
                id="name"
                value={newCoupon.name}
                onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                placeholder="e.g., SUMMER2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percent_off">Discount Percentage</Label>
              <Input
                id="percent_off"
                type="number"
                min="0"
                max="100"
                value={newCoupon.percent_off}
                onChange={(e) => setNewCoupon({ ...newCoupon, percent_off: e.target.value })}
                placeholder="e.g., 20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                className="w-full px-3 py-2 border rounded-md"
                value={newCoupon.duration}
                onChange={(e) => setNewCoupon({ ...newCoupon, duration: e.target.value as 'once' | 'repeating' | 'forever' })}
              >
                <option value="once">Once</option>
                <option value="repeating">Repeating</option>
                <option value="forever">Forever</option>
              </select>
            </div>
            {newCoupon.duration === 'repeating' && (
              <div className="space-y-2">
                <Label htmlFor="duration_in_months">Duration in Months</Label>
                <Input
                  id="duration_in_months"
                  type="number"
                  min="1"
                  value={newCoupon.duration_in_months}
                  onChange={(e) => setNewCoupon({ ...newCoupon, duration_in_months: e.target.value })}
                  placeholder="e.g., 3"
                />
              </div>
            )}
          </div>
          <Button
            className="mt-4"
            onClick={handleCreateCoupon}
            disabled={!newCoupon.name || !newCoupon.percent_off}
          >
            Create Coupon
          </Button>
        </div>

        <h2 className="text-2xl font-bold mb-4">Existing Coupons</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Coupon Code</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <React.Fragment key={coupon.id}>
                  <TableRow className={selectedCoupon === coupon.id ? "bg-blue-50" : ""}>
                    <TableCell>
                      <button 
                        onClick={() => toggleCouponDetails(coupon.id)}
                        className="text-left font-medium text-blue-600 hover:underline flex items-center"
                      >
                        {coupon.name || coupon.id}
                        {selectedCoupon === coupon.id ? 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m18 15-6-6-6 6"/></svg> : 
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="m6 9 6 6 6-6"/></svg>
                        }
                      </button>
                    </TableCell>
                    <TableCell>
                      {coupon.percent_off ? `${coupon.percent_off}%` : 
                       coupon.amount_off ? `${(coupon.amount_off / 100).toFixed(2)} ${coupon.currency?.toUpperCase()}` : '-'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {coupon.duration}
                      {coupon.duration_in_months ? ` (${coupon.duration_in_months} months)` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.valid ? 'default' : 'destructive'}>
                        {coupon.valid ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(coupon.created * 1000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{coupon.name || coupon.id}</span>
                        <button 
                          onClick={() => copyToClipboard(coupon.name || coupon.id)}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                          title="Copy coupon code"
                        >
                          {copiedCoupon === (coupon.name || coupon.id) ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <Copy className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this coupon? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                  {selectedCoupon === coupon.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0 border-t-0">
                        <div className="bg-gray-50 p-4 rounded-b-md">
                          <h3 className="font-bold mb-2">Usage Details</h3>
                          {loadingUsage[coupon.id] ? (
                            <div className="py-2">
                              <Skeleton className="h-6 w-full max-w-md mb-2" />
                              <Skeleton className="h-6 w-full max-w-md mb-2" />
                              <Skeleton className="h-6 w-full max-w-md" />
                            </div>
                          ) : couponUsage[coupon.id]?.length ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {couponUsage[coupon.id].map((usage) => (
                                    <tr key={usage.id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(usage.created * 1000).toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {usage.customer.email || usage.customer.name || usage.customer.id}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        ${(usage.amount_off / 100).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {usage.payment_intent_id}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No usage data found for this coupon.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
