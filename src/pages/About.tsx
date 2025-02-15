
import { Header } from "@/components/business/Header";
import { Footer } from "@/components/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
              About <span className="text-primary">SKILL</span>DIRECTORY
              <span className="block text-neutral-700 mt-2">
                – Empowering Lifelong Learning & Growth
              </span>
            </h1>

            <div className="space-y-12">
              {/* Mission Section */}
              <section>
                <h2 className="text-3xl font-bold mb-4">Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our mission is to connect learners to educators. To balance the learners' passions and curiosities with exciting educational opportunities, and to assist sustainable growth for the educators and their businesses.
                </p>
              </section>

              {/* Vision Section */}
              <section>
                <h2 className="text-3xl font-bold mb-4">Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We are dedicated to making a meaningful impact by becoming a trusted platform where individuals can seamlessly connect with top-tier instructors. Our platform aims to empower individuals to unlock their limitless potential by connecting learners with passionate and knowledgeable instructors. It is our goal to cultivate an innovative community and contribute to a brighter, more skilled future.
                </p>
              </section>

              {/* Values Section */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Values</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Community</h3>
                    <p className="text-lg text-gray-700">
                      Fostering a supportive and collaborative environment for students and instructors.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Integrity</h3>
                    <p className="text-lg text-gray-700">
                      Encouraging transparency, honesty, and ethical practices in all interactions between students and instructors.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Growth</h3>
                    <p className="text-lg text-gray-700">
                      Committing to the personal and professional growth of all students and instructors.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Curiosity</h3>
                    <p className="text-lg text-gray-700">
                      Encouraging a love for learning and exploration of new skills and knowledge.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Adaptability</h3>
                    <p className="text-lg text-gray-700">
                      Staying Flexible and open to change in order to meet the evolving needs of students and instructors.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
