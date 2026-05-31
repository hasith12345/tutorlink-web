import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: May 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using TutorLink, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users including students, tutors, and visitors.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Platform Description</h2>
              <p>TutorLink is an online marketplace that connects students in Sri Lanka with qualified tutors for private tuition. We facilitate the discovery, booking, and payment process but are not a party to the educational relationship between students and tutors.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>Accounts are personal and must not be shared or transferred.</li>
                <li>You must be at least 13 years of age. Students under 18 require a parent or guardian to complete their registration details.</li>
                <li>Tutors must be at least 18 years of age and submit a valid application for approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Tutor Obligations</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Tutors must provide truthful information about their qualifications, experience, and subjects taught.</li>
                <li>Tutors are responsible for delivering classes as advertised.</li>
                <li>Tutors must comply with all applicable laws in Sri Lanka including child protection regulations.</li>
                <li>Tutors must maintain a professional standard of conduct at all times.</li>
                <li>TutorLink retains an 8% service fee from each monthly payment processed through the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Student Obligations</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Students must pay the monthly class fee on time to maintain access.</li>
                <li>Students must treat tutors with respect and professionalism.</li>
                <li>Students must not share class materials, meeting links, or access credentials with unauthorised persons.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Payments and Refunds</h2>
              <p>All payments are processed securely via Stripe. Monthly fees are charged upon enrolment and at each renewal period. Refunds are at the discretion of TutorLink and will be considered on a case-by-case basis. Contact <a href="mailto:support@tutorlink.lk" className="text-indigo-600 hover:underline">support@tutorlink.lk</a> for any payment disputes.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Prohibited Conduct</h2>
              <p>You must not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use TutorLink for any unlawful purpose</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Post false or misleading information</li>
                <li>Attempt to circumvent the platform to avoid service fees</li>
                <li>Upload harmful or offensive content</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Termination</h2>
              <p>TutorLink reserves the right to suspend or terminate any account that violates these Terms of Service without prior notice. Tutors whose applications are rejected or accounts suspended will be notified via email.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>TutorLink acts as a marketplace and is not liable for the quality of tuition provided, disputes between students and tutors, or any indirect losses arising from use of the platform. Our liability is limited to the fees paid to TutorLink in the preceding month.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Governing Law</h2>
              <p>These Terms of Service are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
              <p>For questions about these terms, please visit our <Link href="/contact-us" className="text-indigo-600 hover:underline">Contact Us</Link> page or email <a href="mailto:legal@tutorlink.lk" className="text-indigo-600 hover:underline">legal@tutorlink.lk</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
