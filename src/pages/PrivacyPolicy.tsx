import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - Skill Directory"
        description="Learn about how Skill Directory protects your privacy and handles your personal information. Our privacy policy outlines data collection, usage, and your rights."
        keywords="privacy policy, data protection, user privacy, personal information, data collection, privacy rights, GDPR compliance"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-16" role="main" aria-label="Privacy Policy">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
              
              <p className="text-lg mb-8">
                We take your privacy seriously. We only ask you to provide information that we need in order to deliver the service or information you have requested.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-medium mb-3">a) Personal Information Collection</h3>
                <p>At this website, your personally identifiable information is collected from you when you use the website to perform certain tasks, such as:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>When you post or comment on an article or post or send email to us (such as your name and email address).</li>
                  <li>When you send email to a professional listed in one of the professional directories or when you email a friend about a professional.</li>
                  <li>When you call a professional using their number listed in our directories.</li>
                  <li>When you subscribe to a publication.</li>
                  <li>When you purchase something from us.</li>
                  <li>When you register to be listed in our directories.</li>
                  <li>When you open email communications from us.</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">b) Cookies and Usage Data</h3>
                <p>Like most sites, we use cookies on our pages, sometimes provided by third parties, to help us understand user behavior on our site.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Our Use of Your Information</h2>
                <p>We only use information we collect to provide you the services on our website that you request.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We share information with third parties only when needed to deliver products or services you request.</li>
                  <li>We use cookies to create a personalized web experience.</li>
                  <li>We use third-party advertising companies to serve relevant ads.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Your Posted Materials</h2>
                <p>The materials you post on the website are made available to be seen and read by other users. No such materials are treated confidentially.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Marketing Lists</h2>
                <p>We obtain lists from third-party marketing list suppliers for direct marketing promotions. You may receive promotional material even if you've opted out of our promotions through third-party lists.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Limitations</h2>
                <p>Though we make every effort to preserve your privacy, we cannot guarantee it. We may disclose personal information when required by law or in cooperation with law enforcement.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Data Access and Erasure</h2>
                <p>You may request copies of your personal information or request deletion. Contact us at <a href="mailto:info@skilldirectory.com" className="text-primary hover:underline">info@skilldirectory.com</a> with the subject "Personal Data Request".</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Amendment</h2>
                <p>We reserve the right to change this policy in accordance with the amendment policy in the website's Terms of Use.</p>
              </section>

              <div className="mt-12 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  Last updated: March 19, 2025
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
