"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const FAQS = [
  {
    category: "For Students",
    items: [
      {
        q: "How do I find a tutor on TutorLink?",
        a: "Use the search bar at the top of any page. Enter the subject or tutor name, choose your location and preferred mode (online or physical), and browse the results. Click on any tutor to view their full profile and available classes.",
      },
      {
        q: "How do I enrol in a class?",
        a: "Once you find a class you like, click 'Enrol Now' on the tutor's profile page. You will be directed to a secure payment page powered by Stripe. After successful payment, you will receive an enrolment confirmation.",
      },
      {
        q: "What subjects are available?",
        a: "TutorLink covers the full Sri Lankan national curriculum from Grade 6 to Grade 13 — including all O/L and A/L streams (Science, Commerce, Arts, and Technology). Subjects range from Combined Mathematics and Physics to Accounting, History, Tamil, and ICT.",
      },
      {
        q: "Can I take online classes?",
        a: "Yes. Many tutors on TutorLink offer online classes via Google Meet or Zoom. You can filter by mode (online / physical / hybrid) in the search to find the right option for you.",
      },
      {
        q: "How are payments handled?",
        a: "All payments are processed monthly through Stripe, our secure payment partner. Your card details are never stored on TutorLink servers. A receipt and enrollment confirmation are sent to you after each payment.",
      },
      {
        q: "Can I unenrol from a class?",
        a: "Yes. Go to My Classes in your dashboard and select the class you wish to leave. Click 'Unenrol'. Your access will remain active until the end of the current paid period.",
      },
      {
        q: "What should I do if there is a problem with my tutor?",
        a: "Use the 'Message Tutor' button on your class page to communicate directly. For unresolved issues, contact our support team via the Contact Us page and we will assist you promptly.",
      },
    ],
  },
  {
    category: "For Tutors",
    items: [
      {
        q: "How do I become a tutor on TutorLink?",
        a: "Click 'Become a Tutor' and complete the tutor application form. You will need to provide your personal details, educational qualifications, subjects you teach, and a short bio. Our team reviews all applications and you will be notified of the outcome via email.",
      },
      {
        q: "How long does tutor approval take?",
        a: "Applications are typically reviewed within 2–5 business days. You can check your application status at any time by visiting the Tutor Application Status page after signing in.",
      },
      {
        q: "How do I get paid?",
        a: "Once approved, students pay monthly through TutorLink. After deducting an 8% platform service fee, your earnings are credited to your TutorLink wallet. Payouts are processed to your bank account on a regular schedule.",
      },
      {
        q: "What is the 8% service fee?",
        a: "TutorLink charges an 8% fee on each payment to cover platform costs, payment processing, and continued development of the platform. This fee is automatically deducted — students pay the full class fee and you receive 92%.",
      },
      {
        q: "Can I teach multiple subjects?",
        a: "Yes. You can list multiple subjects in your profile and create separate classes for each. Each class can have its own schedule, fees, and mode (online or physical).",
      },
      {
        q: "What happens if I am inactive?",
        a: "If you do not log into your tutor dashboard for 30 consecutive days, your profile will be marked as unavailable and will not appear in search results. Log back in at any time to restore your availability.",
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        q: "Is TutorLink available across Sri Lanka?",
        a: "Yes. TutorLink is available island-wide. Physical classes are location-based, but online classes are accessible from anywhere in Sri Lanka with an internet connection.",
      },
      {
        q: "Is my personal information safe?",
        a: "Yes. We take data security seriously. All data is transmitted over HTTPS, passwords are hashed, and we comply with data protection best practices. See our Privacy Policy for full details.",
      },
      {
        q: "Can I have both a student and tutor account?",
        a: "Yes. You can add both a student and tutor profile to the same account. Simply go to Settings and choose 'Add Role'. You can switch between roles at any time using the role selector.",
      },
      {
        q: "How do I contact TutorLink support?",
        a: "Visit our Contact Us page or email support@tutorlink.lk. We aim to respond to all enquiries within 24 hours on business days.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-indigo-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white text-gray-600 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-500">Everything you need to know about TutorLink. Can't find an answer? <a href="/contact-us" className="text-indigo-600 hover:underline">Contact us</a>.</p>
        </div>

        <div className="space-y-10">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-lg font-bold text-indigo-700 mb-4 px-1">{section.category}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
