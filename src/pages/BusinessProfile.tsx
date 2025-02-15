
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BusinessInfo } from "@/components/business/BusinessInfo";
import { ContactInfo } from "@/components/business/ContactInfo";
import { VideoLesson } from "@/components/business/VideoLesson";
import { ActionCards } from "@/components/business/ActionCards";
import { ClaimBanner } from "@/components/business/ClaimBanner";
import { useState } from "react";

const BusinessProfile = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showClaimBanner, setShowClaimBanner] = useState(true);

  // Mock data for the business profile
  const businessData = {
    name: "Burnt Bluff Glassworks",
    description: "Stop in and watch us blow glass on your next visit to Door County or sign up for a class to experience creating glass art yourself! Follow us on Facebook or Instagram for more information.",
    image: "/placeholder.svg",
    categories: ["Arts & Crafts", "Glass Blowing"],
    tags: ["Glass Blowing"],
    website: "https://example.com",
    address: "8819 WI-42, Fish Creek, WI, 54212",
    phone: "920-395-5191",
    email: "kari@Burntbluff.com",
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto py-8 space-y-8 flex-1 px-4">
        {showClaimBanner && (
          <ClaimBanner onClose={() => setShowClaimBanner(false)} />
        )}
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <BusinessInfo business={businessData} />
            <VideoLesson />
            <ActionCards />
          </div>
          <div>
            <ContactInfo business={businessData} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessProfile;
