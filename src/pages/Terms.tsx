import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { getPageSEO } from "@/config/seoConfig";

export default function Terms() {
  return (
    <>
      <SEO {...getPageSEO('terms')} />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50 py-16" role="main" aria-label="Terms and Conditions">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <p className="text-yellow-700 font-medium">
                  PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY BEFORE USING OUR WEBSITE
                </p>
              </div>

              <p className="text-lg mb-8">
                This document outlines the "Terms of Use" for accessing and utilizing the Skill Directory website, operated by Woodshed Schoolhouse LLC, doing business as "Skill Directory," in Wisconsin. These Terms of Use include our Privacy Policy and constitute a binding agreement between you and Woodshed Schoolhouse LLC. By accessing or using the Site, you agree to these Terms of Use.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                <p>
                  The Skill Directory is designed to provide general information to users. We do not endorse or recommend any specific professionals, products, tests, or services mentioned on the Site. Your reliance on any information provided is at your own risk. Accessing the Site is a privilege granted to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Rules of Conduct</h2>
                <p>
                  We reserve the right to interpret the rules of conduct outlined in these Terms of Use. Users who violate these rules may have their access suspended or terminated at our discretion. We may take appropriate actions concerning user materials as we see fit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Posting Guidelines</h2>
                <p>Materials posted on the Site must not include:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Links to competing websites.</li>
                  <li>Copyrighted material unless you own the copyright or have permission from the owner.</li>
                  <li>Trade secrets unless you own them or have permission.</li>
                  <li>Content that infringes on intellectual property rights or violates privacy rights.</li>
                  <li>Obscene, defamatory, threatening, or abusive material.</li>
                  <li>Anything that could embarrass or offend another person or group.</li>
                </ul>

                <p>You may not use your materials to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Impersonate anyone.</li>
                  <li>Post false or misleading information.</li>
                  <li>Post advertisements or solicitations unless related to your own services.</li>
                  <li>Distribute chain letters or pyramid schemes.</li>
                  <li>Solicit business responses.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Conduct Rules</h2>
                <p>
                  You must not respond to other users' postings for business solicitation purposes. Unsolicited commercial emails to users are prohibited. Report inappropriate content to <a href="mailto:info@skilldirectory.com" className="text-primary hover:underline">info@skilldirectory.com</a>. You may not alter or delete others' posted materials. Any conduct that restricts another user's ability to enjoy the Site is prohibited.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Security Rules</h2>
                <p>Violating Site security is strictly prohibited. This includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Accessing data not meant for you.</li>
                  <li>Testing vulnerabilities without authorization.</li>
                  <li>Interfering with service to any user.</li>
                  <li>Sending unsolicited emails.</li>
                  <li>Forging packet headers.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Registration Rules</h2>
                <p>
                  To post certain materials, you must register and provide accurate information, including your name and email. You are responsible for your account's security and must notify us of any unauthorized access.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Rights Reserved</h2>
                <p>
                  You are granted a limited, non-exclusive right to access the Site for personal use. You may download materials for personal use but must not redistribute or exploit them commercially without our permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
                <p>
                  The Site is provided "as is," and we make no warranties regarding its accuracy, reliability, or availability. We are not liable for any damages resulting from your reliance on information obtained through the Site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
                <p>
                  You agree to indemnify and defend Woodshed Schoolhouse LLC and its affiliates against any claims or damages arising from your use of the Site or violation of these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p>
                  We and our affiliates will not be liable for indirect, consequential, or special damages. Our liability is limited to the greater of $100 or the fees you paid for our services in the previous 12 months.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                <p>
                  These Terms of Use are governed by the laws of Wisconsin. Any disputes will be resolved in state or federal courts in Wisconsin.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Class Action Waiver</h2>
                <p>
                  All disputes must be resolved individually; class action claims are not permitted.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Amendments</h2>
                <p>
                  We may update these Terms at any time. Continued use of the Site after changes signifies your acceptance.
                </p>
              </section>

              <div className="mt-12 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  For further questions, please contact us at{" "}
                  <a href="mailto:info@skilldirectory.com" className="text-primary hover:underline">
                    info@skilldirectory.com
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-2">
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
