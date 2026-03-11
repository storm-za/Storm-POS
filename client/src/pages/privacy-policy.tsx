import { useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - Storm Software";
  }, []);

  const lastUpdated = "7 March 2026";

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
          <div className="mt-6 h-1 w-16 bg-[hsl(217,90%,40%)] rounded-full" />
        </div>

        <div className="prose prose-gray max-w-none space-y-10">

          {/* Intro */}
          <section>
            <p className="text-gray-700 leading-relaxed text-lg">
              Storm Software ("we", "our", or "us") operates the Storm POS application and the
              Storm Software website at <strong>stormsoftware.co.za</strong>. This Privacy Policy
              explains what information we collect, how we use it, and your rights regarding
              that information.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our services - including the Storm POS web app, Windows desktop app, or
              Android app - you agree to the practices described in this policy.
            </p>
          </section>

          {/* What we collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you register for Storm POS, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-6">
              <li>Full name and email address</li>
              <li>Company name</li>
              <li>Password (stored securely as a hashed value - never in plain text)</li>
              <li>Subscription plan details</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Business Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              As you use Storm POS, we store data you enter into the system:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-6">
              <li>Sales records and transaction history</li>
              <li>Product and inventory information</li>
              <li>Customer names, email addresses, and phone numbers</li>
              <li>Staff account details</li>
              <li>Invoices and quotes</li>
              <li>Business settings, logo, and branding</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you access our service, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>IP address and device type</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used (for improving the service)</li>
            </ul>
          </section>

          {/* How we use it */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information solely to provide and improve the Storm POS service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To create and manage your account</li>
              <li>To store and display your business, sales, and customer data within the POS system</li>
              <li>To send transactional emails (e.g. welcome email, account notifications)</li>
              <li>To process subscription billing</li>
              <li>To provide customer support</li>
              <li>To diagnose technical issues and improve the application</li>
            </ul>
          </section>

          {/* Data sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>We do not sell, rent, or trade your personal information to any third party.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share limited information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Service providers:</strong> We use trusted infrastructure providers (e.g. database
                hosting, email delivery) that process data strictly on our behalf and under
                confidentiality agreements.
              </li>
              <li>
                <strong>Legal obligations:</strong> If required by South African law or a valid legal process,
                we may disclose information as necessary.
              </li>
            </ul>
          </section>

          {/* Data storage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored in a secure, encrypted PostgreSQL database. We apply
              industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Password hashing using bcrypt</li>
              <li>Access controls limiting who can view your data</li>
              <li>Regular security reviews</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              While we take security seriously, no system is completely immune to risk. We encourage
              you to use a strong, unique password for your account.
            </p>
          </section>

          {/* Data retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data for as long as your account is active. If you request account
              deletion, we will permanently delete your data within 30 days, except where we
              are required to retain it for legal or accounting purposes.
            </p>
          </section>

          {/* Android app */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Storm POS Android App</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Storm POS Android app is a WebView-based application that loads the Storm POS
              web service at <strong>stormsoftware.co.za</strong>. The app itself does not collect
              any additional data beyond what the web service collects as described in this policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The app does not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Access your device contacts, camera, microphone, or location</li>
              <li>Store any data locally on your device beyond standard browser cache</li>
              <li>Track you across other apps or websites</li>
            </ul>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under the Protection of Personal Information Act (POPIA) of South Africa, you have
              the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Access</strong> the personal information we hold about you</li>
              <li><strong>Correct</strong> inaccurate information</li>
              <li><strong>Delete</strong> your account and associated data</li>
              <li><strong>Object</strong> to certain processing of your data</li>
              <li><strong>Lodge a complaint</strong> with the Information Regulator of South Africa</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, contact us at the email address below.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Our web application uses session cookies to keep you logged in. We do not use
              third-party tracking cookies or advertising cookies. You may disable cookies in
              your browser settings, but this will prevent you from logging in to Storm POS.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Storm POS is a business application intended for use by adults. We do not knowingly
              collect personal information from anyone under the age of 18. If you believe a
              minor has provided us with information, please contact us so we can delete it.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will update
              the "Last updated" date at the top of this page. Continued use of our services
              after any changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any privacy-related questions, data requests, or to exercise your rights,
              please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Storm Software</strong></p>
              <p>South Africa</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:softwarebystorm@gmail.com"
                  className="text-[hsl(217,90%,40%)] hover:underline font-medium"
                >
                  softwarebystorm@gmail.com
                </a>
              </p>
              <p>Website: <a href="https://stormsoftware.co.za" className="text-[hsl(217,90%,40%)] hover:underline font-medium">stormsoftware.co.za</a></p>
            </div>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-[hsl(217,90%,40%)] hover:underline text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
