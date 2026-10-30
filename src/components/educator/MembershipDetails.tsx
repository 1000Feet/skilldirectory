import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertCircle, CheckCircle, CreditCard, Award, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";

type MembershipData = {
  id: string;
  educator_id: string;
  type: "basic" | "standard" | "premium";
  status: "active" | "inactive" | "cancelled";
  start_date: string;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  metadata: {
    priceId?: string;
  };
  created_at: string;
  updated_at: string;
};

const MEMBERSHIP_NAMES = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium"
};

const MEMBERSHIP_PRICES = {
  basic: "$0.00",
  standard: "$30.00",
  premium: "$50.00"
};

export const MembershipDetails = ({ educatorId }: { educatorId: string }) => {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchMembershipDetails = useCallback(async () => {
    if (!educatorId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('educator_id', educatorId)
        .single();

      if (error) {
        console.error('Error fetching membership data:', error);
        toast.error('Could not load membership details');
        return;
      }

      setMembership(data as unknown as MembershipData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [educatorId]);

  // Fetch data when component mounts or when educatorId changes
  useEffect(() => {
    if (educatorId) {
      fetchMembershipDetails();
    }
  }, [educatorId, fetchMembershipDetails]);

  // Refetch data when returning to the dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && educatorId) {
      fetchMembershipDetails();
    }
  }, [location.pathname, educatorId, fetchMembershipDetails]);

  const handleChangePlan = () => {
    // Navigate to the pricing page with the current membership type as a parameter
    if (membership) {
      navigate(`/pricing?educatorId=${educatorId}&currentPlan=${membership.type}`);
    } else {
      navigate('/pricing');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
          <CardDescription>Loading your membership information</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
          <CardDescription>No membership found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>There appears to be an issue with your membership data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Details</CardTitle>
        <CardDescription>Your current membership plan and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {MEMBERSHIP_NAMES[membership.type]} Plan
            </h3>
            <p className="text-sm text-muted-foreground">{MEMBERSHIP_PRICES[membership.type]}/month</p>
          </div>
          <Badge 
            variant={membership.status === 'active' ? "default" : "destructive"}
            className="capitalize"
          >
            {membership.status === 'active' ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {membership.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(membership.start_date), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {membership.type === 'basic' ? 'Current Period' : membership.auto_renew ? 'Renews on' : 'Ends on'}
            </p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(membership.current_period_end), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Auto-renew:</span>
          <span className="font-medium">{membership.auto_renew ? 'Enabled' : 'Disabled'}</span>
        </div>

        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={handleChangePlan}
        >
          <ArrowUpCircle className="h-4 w-4" />
          {membership.type === 'premium' ? 'Change Plan' : 'Upgrade Membership'}
        </Button>

      </CardContent>
    </Card>
  );
};
