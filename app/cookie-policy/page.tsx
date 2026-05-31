import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. What Are Cookies?</h2>
              <p>Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and improve your experience. TutorLink uses cookies and similar technologies to make our platform work effectively.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cookies We Use</h2>

              <div className="mt-4 space-y-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">Essential Cookies</h3>
                  <p className="text-sm">These are required for TutorLink to function. They maintain your login session, remember your role (student or tutor), and keep your cart/enrolment state. You cannot opt out of these.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">Functional Cookies</h3>
                  <p className="text-sm">These remember your preferences such as your preferred language, search filters, and last-visited pages to improve your browsing experience on TutorLink.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h3>
                  <p className="text-sm">We use anonymised analytics to understand how users interact with TutorLink — which pages are visited most, where users drop off, and how to improve the platform. No personally identifiable information is tracked.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Third-Party Cookies</h2>
              <p>Some features of TutorLink use third-party services that may set their own cookies:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Stripe</strong> — for secure payment processing</li>
                <li><strong>Google OAuth</strong> — if you choose to sign in with Google</li>
                <li><strong>Supabase</strong> — our database and authentication provider</li>
              </ul>
              <p className="mt-2">These services have their own cookie and privacy policies which we encourage you to review.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Managing Cookies</h2>
              <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>View the cookies stored on your device</li>
                <li>Delete cookies at any time</li>
                <li>Block cookies from specific sites</li>
                <li>Block all third-party cookies</li>
              </ul>
              <p className="mt-3">Please note that disabling essential cookies may prevent TutorLink from working correctly, including keeping you logged in.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Updates to This Policy</h2>
              <p>We may update this Cookie Policy as our services evolve. We recommend reviewing it periodically. Continued use of TutorLink after changes constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact</h2>
              <p>For questions about our use of cookies, contact us at <a href="mailto:privacy@tutorlink.lk" className="text-indigo-600 hover:underline">privacy@tutorlink.lk</a> or visit our <Link href="/contact-us" className="text-indigo-600 hover:underline">Contact Us</Link> page.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
