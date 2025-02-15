
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/business/Header";
import { ClaimBanner } from "@/components/business/ClaimBanner";
import { BusinessInfo } from "@/components/business/BusinessInfo";
import { ContactInfo } from "@/components/business/ContactInfo";
import { ActionCards } from "@/components/business/ActionCards";
import { VideoLesson } from "@/components/business/VideoLesson";

const businessData = {
  id: 5,
  name: "Burnt Bluff Glassworks",
  description: "Stop in and watch us blow glass on your next visit to Door County or sign up for a class to experience creating glass art yourself! Follow us on Facebook or Instagram for more information.",
  image: "/lovable-uploads/8c99f035-57fd-4069-a2ec-21faa352e4d1.png",
  address: "8819 WI-42, Fish Creek, WI, 54212",
  phone: "920-395-5191",
  email: "kari@Burntbluff.com",
  website: "https://burntbluff.com",
  categories: ["Arts & Crafts", "Glass Blowing"],
  tags: ["Glass Blowing"],
  social: {
    facebook: "https://facebook.com/burntbluff",
    instagram: "https://instagram.com/burntbluff"
  }
};

const BusinessProfile = () => {
  const { id } = useParams();
  const [showClaimBanner, setShowClaimBanner] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <BusinessInfo business={businessData} />

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About the Business</h2>
                <p className="text-gray-600">
                  At Burnt Bluff Glassworks, we're passionate about the art of glassblowing. 
                  Our studio offers a unique opportunity to witness the mesmerizing process of glass creation 
                  and even try your hand at this ancient craft through our hands-on classes.
                </p>
              </Card>

              <ActionCards />
            </div>

            <div className="space-y-6">
              <VideoLesson />
              <ContactInfo business={businessData} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#333333] text-white">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img 
              src="/lovable-uploads/b71f5020-bb1c-464a-8ba8-60e008e8c40a.png" 
              alt="Skill Directory" 
              className="h-8"
            />
            <nav className="flex flex-wrap gap-6 text-sm items-center">
              <a href="#" className="hover:text-primary-foreground/90">ABOUT</a>
              <a href="#" className="hover:text-primary-foreground/90">PRICING</a>
              <a href="#" className="hover:text-primary-foreground/90">PRIVACY POLICY</a>
              <a href="#" className="hover:text-primary-foreground/90">TERMS & CONDITIONS</a>
              <a href="#" className="hover:text-primary-foreground/90">SUPPORT</a>
              <a href="#" className="bg-[#88C440] text-white px-4 py-2 rounded-md hover:bg-[#78b32d] transition-colors font-medium">
                SKILL PROVIDER? SIGN UP HERE
              </a>
            </nav>
          </div>
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <div>
              Copyright © 2025 <span className="text-[#88C440]">SKILLDIRECTORY.COM</span>. All Rights Reserved.
            </div>
            <div>
              Website by <a href="#" className="text-[#88C440]">1000FEET</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessProfile;
