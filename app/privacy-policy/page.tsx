import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>Welcome to TutorLink. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to connect students with tutors in Sri Lanka.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
              <p>We collect information you provide directly to us when you:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Create a student or tutor account (name, email address, date of birth, phone number, address)</li>
                <li>Complete a tutor profile (educational qualifications, subjects taught, experience, NIC number)</li>
                <li>Enrol in a class or make a payment (payment method details processed via Stripe)</li>
                <li>Send messages through our platform</li>
                <li>Contact our support team</li>
              </ul>
              <p className="mt-3">We also automatically collect certain technical information when you use TutorLink, including IP address, browser type, device information, and usage data.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Create and manage your account</li>
                <li>Facilitate connections between students and tutors</li>
                <li>Process payments and send receipts</li>
                <li>Send notifications about enrolments, messages, and class updates</li>
                <li>Verify tutor identity and qualifications during the application process</li>
                <li>Improve platform safety and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing of Information</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Tutors/Students:</strong> Your name and contact details are shared only as necessary to facilitate a confirmed enrolment.</li>
                <li><strong>Payment Processors:</strong> Stripe processes payment data on our behalf under strict security standards.</li>
                <li><strong>Service Providers:</strong> Third parties who assist with hosting, email delivery, and analytics under confidentiality agreements.</li>
                <li><strong>Legal Authorities:</strong> Where required by law or to protect the safety of our users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), hashed passwords, and secure cloud storage. However, no system is completely secure, and we encourage you to use a strong, unique password for your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:privacy@tutorlink.lk" className="text-indigo-600 hover:underline">privacy@tutorlink.lk</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children's Privacy</h2>
              <p>TutorLink serves students including minors. We require parental consent details during student registration. We do not knowingly collect personal information from children under 13 without verified parental consent. If you believe a child's data has been collected without consent, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
              <p>We may update this policy from time to time. We will notify you of material changes via email or a prominent notice on our platform. Continued use of TutorLink after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@tutorlink.lk" className="text-indigo-600 hover:underline">privacy@tutorlink.lk</a> or visit our <Link href="/contact-us" className="text-indigo-600 hover:underline">Contact Us</Link> page.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
