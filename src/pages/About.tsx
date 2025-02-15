
import { Header } from "@/components/business/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-[#F2FCE2] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
              About <span className="text-primary">SKILL</span>DIRECTORY
              <span className="block text-neutral-700 mt-2">
                – Empowering Lifelong Learning & Growth
              </span>
            </h1>

            <div className="space-y-8">
              {/* Mission Section */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <h2 className="text-3xl font-bold mb-4 text-primary">Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our mission is to connect learners to educators. To balance the learners' passions and curiosities with exciting educational opportunities, and to assist sustainable growth for the educators and their businesses.
                </p>
              </Card>

              {/* Vision Section */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <h2 className="text-3xl font-bold mb-4 text-primary">Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We are dedicated to making a meaningful impact by becoming a trusted platform where individuals can seamlessly connect with top-tier instructors. Our platform aims to empower individuals to unlock their limitless potential by connecting learners with passionate and knowledgeable instructors. It is our goal to cultivate an innovative community and contribute to a brighter, more skilled future.
                </p>
              </Card>

              {/* Values Section */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <h2 className="text-3xl font-bold mb-6 text-primary">Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-[#F2FCE2] hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Community</h3>
                    <p className="text-lg text-gray-700">
                      Fostering a supportive and collaborative environment for students and instructors.
                    </p>
                  </Card>
                  <Card className="p-6 bg-[#EAFBD8] hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Integrity</h3>
                    <p className="text-lg text-gray-700">
                      Encouraging transparency, honesty, and ethical practices in all interactions between students and instructors.
                    </p>
                  </Card>
                  <Card className="p-6 bg-[#F2FCE2] hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Growth</h3>
                    <p className="text-lg text-gray-700">
                      Committing to the personal and professional growth of all students and instructors.
                    </p>
                  </Card>
                  <Card className="p-6 bg-[#EAFBD8] hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Curiosity</h3>
                    <p className="text-lg text-gray-700">
                      Encouraging a love for learning and exploration of new skills and knowledge.
                    </p>
                  </Card>
                  <Card className="p-6 bg-[#F2FCE2] hover:shadow-md transition-shadow md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Adaptability</h3>
                    <p className="text-lg text-gray-700">
                      Staying Flexible and open to change in order to meet the evolving needs of students and instructors.
                    </p>
                  </Card>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
