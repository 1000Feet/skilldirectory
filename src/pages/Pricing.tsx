import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MembershipType } from "@/lib/auth-types";
import { useEffect, useState } from "react";
import { createPaymentIntent } from "@/services/payment";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { updateMembership } from "@/api/update-membership";
import { SEO } from "@/components/SEO";
import { getPageSEO } from "@/config/seoConfig";

const plans = [
  {
    name: "Basic: Get Listed",
    price: "FREE",
    features: [
      "Profile Picture",
      "Business Name",
      "Link to Website",
      "Search Visibility (Limited)",
      "Ads"
    ],
    highlight: false,
    type: "basic" as MembershipType
  },
  {
    name: "Standard: Get Seen",
    price: "$19",
    features: [
      "Includes everything in basic subscription",
      "Links to Social Media",
      "Email + Phone Number",
      "Videos Upload",
      "Custom AI Chatbot"
    ],
    highlight: true,
    type: "standard" as MembershipType
  },
  {
    name: "Premium: Get Results",
    price: "$49",
    features: [
      "Includes everything in standard subscription",
      "Lesson Booking Module",
      "Custom AI Voice Agent",
      "Priority Placement in Search",
      "Featured on Homepage Carousel"
    ],
    highlight: false,
    type: "premium" as MembershipType
  }
];

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center text-gray-600 text-base">
    <Check className="w-6 h-6 text-primary mr-2 flex-shrink-0" />
    {text}
  </div>
);

const PricingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MembershipType | null>(null);
  const [educatorId, setEducatorId] = useState<string | null>(null);
  const [isExistingEducator, setIsExistingEducator] = useState(false);

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentPlanParam = params.get('currentPlan') as MembershipType | null;
    const educatorIdParam = params.get('educatorId');
    
    if (currentPlanParam && educatorIdParam) {
      setCurrentPlan(currentPlanParam);
      setEducatorId(educatorIdParam);
      setIsExistingEducator(true);
    }
  }, [location.search]);

  const handleSignUp = (membershipType: MembershipType) => {
    // Redirect to the auth page with query parameters to indicate signup and pre-select membership type
    navigate(`/auth?signup=educator&membership=${membershipType}`);
  };

  const handleChangeMembership = async (newMembershipType: MembershipType) => {
    if (!educatorId) {
      toast.error("Educator ID is missing");
      return;
    }

    // If changing to the same plan, show a notification
    if (newMembershipType === currentPlan) {
      toast.info("You are already on this plan");
      return;
    }

    try {
      setLoading(true);
      
      // If downgrading to basic (free), no payment is needed
      if (newMembershipType === 'basic') {
        try {
          // Update the membership directly for free plans
          await updateMembership(educatorId, newMembershipType);
          toast.success("Successfully downgraded to Basic plan");
          navigate('/dashboard');
        } catch (error) {
          console.error('Error downgrading to basic plan:', error);
          toast.error("Failed to downgrade to Basic plan. Please try again.");
        }
        return;
      }

      // Create a payment intent for the new membership
      const clientSecret = await createPaymentIntent(newMembershipType, educatorId);
      
      if (!clientSecret) {
        // Handle free memberships
        toast.success("Plan updated successfully");
        navigate('/dashboard');
        return;
      }

      // Navigate to payment page with required data
      navigate('/payment', {
        state: {
          clientSecret,
          profileId: educatorId,
          membershipType: newMembershipType,
          isUpgrade: newMembershipType === 'premium' || (currentPlan === 'basic' && newMembershipType === 'standard')
        }
      });
    } catch (error) {
      console.error('Error initiating plan change:', error);
      toast.error("Failed to initiate plan change. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderActionButton = (plan: typeof plans[0]) => {
    if (isExistingEducator) {
      const isCurrentPlan = plan.type === currentPlan;
      return (
        <Button
          className="w-full text-lg py-6"
          variant={plan.highlight ? "default" : "default"}
          disabled={loading || isCurrentPlan}
          onClick={() => handleChangeMembership(plan.type)}
        >
          {loading ? "Processing..." : isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      );
    } else {
      return (
        <Button
          className="w-full text-lg py-6"
          variant={plan.highlight ? "default" : "default"}
          onClick={() => handleSignUp(plan.type)}
        >
          SIGN UP
        </Button>
      );
    }
  };

  return (
    <>
      <SEO {...getPageSEO('pricing')} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Choose Your <span className="text-primary">Membership</span> Plan
              </h1>
              <p className="text-xl text-gray-600">
                Select the plan that best fits your teaching needs and goals
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.type}
                  className={`p-6 ${
                    plan.highlight
                      ? "border-primary shadow-lg scale-105"
                      : "border-gray-200"
                  }`}
                >
                  <div className={`p-6 text-center ${plan.highlight ? 'bg-primary' : 'bg-primary'}`}>
                    <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  </div>
                  <div className="p-6 text-center border-b h-24 flex flex-col justify-center">
                    <div className="text-4xl font-bold">{plan.price}</div>
                    {plan.price !== "FREE" && <div className="text-gray-500">/month</div>}
                  </div>
                  <div className="p-6 space-y-4 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <Feature key={featureIndex} text={feature} />
                    ))}
                  </div>
                  <div className="p-6 mt-auto">
                    {renderActionButton(plan)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
