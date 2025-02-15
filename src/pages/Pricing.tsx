
import { Header } from "@/components/business/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Basic: Get Listed",
    price: "$10",
    features: [
      "Profile Picture",
      "Business Name",
      "About (100 words)",
      "Link to Website",
      "Search Visibility (Limited)",
      "Ads"
    ],
    highlight: false
  },
  {
    name: "Standard: Get Seen",
    price: "$30",
    features: [
      "Includes everything in basic subscription",
      "Links to Social Media",
      "Email + Phone Number",
      "Analytics Tracker",
      "Photos / Files Upload",
      "Search Tags"
    ],
    highlight: true
  },
  {
    name: "Premium: Get Results",
    price: "$50",
    features: [
      "Includes everything in standard subscription",
      "Class Listings",
      "About (500 words)",
      "Links to Class Signup",
      "Priority Placement in Search",
      "Analytics tracking for Class"
    ],
    highlight: false
  }
];

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Get Listed on <span className="text-primary">SKILL</span>DIRECTORY
              <span className="text-neutral-700"> – Pricing Plans for Businesses & Experts</span>
            </h1>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for you and get listed on <span className="text-primary">SKILL</span>DIRECTORY.com!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`p-6 text-center ${plan.highlight ? 'bg-primary' : 'bg-primary'}`}>
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                </div>
                <div className="p-6 text-center border-b">
                  <div className="text-4xl font-bold">{plan.price}</div>
                  <div className="text-gray-500">/month</div>
                  <div className="mt-4 text-sm text-gray-600">Billing starts March 1st</div>
                </div>
                <div className="p-6 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-primary mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="p-6">
                  <Button
                    className="w-full text-lg py-6"
                    variant={plan.highlight ? "default" : "default"}
                  >
                    SIGN UP
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
