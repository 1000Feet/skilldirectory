import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Globe, Facebook, Instagram, MapPin, Phone, Mail, MessageSquare, Video, Calendar } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <div className="bg-black text-white">
          <div className="container mx-auto py-2 text-center text-sm">
            INVEST IN YOURSELF
          </div>
        </div>
        <nav className="bg-black border-t border-gray-800">
          <div className="container mx-auto">
            <div className="flex items-center justify-between py-4 relative">
              <div className="flex gap-8 absolute left-1/2 -translate-x-1/2">
                <a href="/" className="nav-link">HOME</a>
                <a href="/listings" className="nav-link">LISTINGS</a>
                <a href="/about" className="nav-link">ABOUT</a>
                <a href="/pricing" className="nav-link">PRICING</a>
                <a href="/support" className="nav-link">SUPPORT</a>
              </div>
              <div className="ml-auto">
                <Button className="bg-primary hover:bg-primary/90">
                  LOGIN / SIGN UP
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8">
          {showClaimBanner && (
            <Card className="mb-8 p-4 bg-primary/10 border-primary">
              <div className="flex justify-between items-center">
                <p className="text-sm">
                  Is this your business? <a href="#" className="text-primary font-semibold">Sign up</a> to claim it.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowClaimBanner(false)}
                >
                  ✕
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={businessData.image}
                      alt={businessData.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3">{businessData.name}</h1>
                    <p className="text-gray-600 mb-4">{businessData.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {businessData.categories.map(category => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                      {businessData.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About the Business</h2>
                <p className="text-gray-600">
                  At Burnt Bluff Glassworks, we're passionate about the art of glassblowing. 
                  Our studio offers a unique opportunity to witness the mesmerizing process of glass creation 
                  and even try your hand at this ancient craft through our hands-on classes.
                </p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Chat with AI Assistant</h3>
                    <p className="text-sm text-gray-600">Ask about our services to our AI Voice Agent!</p>
                    <Button variant="outline" className="w-full">Start Chat</Button>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Watch Our Studio</h3>
                    <p className="text-sm text-gray-600">YouTube video presentation of our work</p>
                    <Button variant="outline" className="w-full">Watch Video</Button>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Book a Lesson</h3>
                    <p className="text-sm text-gray-600">Free introductory lesson (in person or online)</p>
                    <Button variant="outline" className="w-full">Schedule Now</Button>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <a href={businessData.website} className="flex items-center gap-3 text-gray-600 hover:text-primary">
                    <Globe className="w-5 h-5" />
                    <span>Visit Website</span>
                  </a>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{businessData.address}</span>
                  </div>
                  <a href={`tel:${businessData.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
                    <Phone className="w-5 h-5" />
                    <span>{businessData.phone}</span>
                  </a>
                  <a href={`mailto:${businessData.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
                    <Mail className="w-5 h-5" />
                    <span>{businessData.email}</span>
                  </a>
                  <div className="flex gap-4 mt-4">
                    <a href={businessData.social.facebook} className="text-gray-600 hover:text-primary">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href={businessData.social.instagram} className="text-gray-600 hover:text-primary">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </Card>
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
