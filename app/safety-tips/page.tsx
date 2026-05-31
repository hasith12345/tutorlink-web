import { Shield, UserCheck, Lock, AlertTriangle, MessageCircle, CreditCard } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

const TIPS = [
  {
    icon: UserCheck,
    color: "bg-indigo-100 text-indigo-600",
    title: "Verify Before You Commit",
    tips: [
      "Always review a tutor's profile thoroughly — check their qualifications, subjects, experience, and student reviews before enrolling.",
      "Look for the verified badge on tutor profiles. Verified tutors have had their identity and credentials checked by TutorLink.",
      "Start with a short-term commitment before enrolling for multiple months.",
    ],
  },
  {
    icon: MessageCircle,
    color: "bg-purple-100 text-purple-600",
    title: "Keep Communication on TutorLink",
    tips: [
      "Use the built-in messaging system for all communication with tutors or students. This keeps a record and protects both parties.",
      "Be cautious if anyone asks you to move communication off the platform (e.g., to WhatsApp or personal email) before a formal enrolment.",
      "Report any inappropriate messages immediately using the Report function or contact our support team.",
    ],
  },
  {
    icon: CreditCard,
    color: "bg-green-100 text-green-600",
    title: "Pay Only Through TutorLink",
    tips: [
      "All payments must be made through TutorLink's secure payment system powered by Stripe.",
      "Never make direct cash payments or bank transfers to tutors outside the platform. Doing so removes your payment protection.",
      "TutorLink will never ask for your password or full card number via email or chat.",
    ],
  },
  {
    icon: Lock,
    color: "bg-blue-100 text-blue-600",
    title: "Protect Your Account",
    tips: [
      "Use a strong, unique password for your TutorLink account and do not share it with anyone.",
      "Enable a strong email password as TutorLink uses your email for account recovery.",
      "Log out from shared or public devices after use.",
      "If you suspect unauthorised access, change your password immediately and contact support.",
    ],
  },
  {
    icon: Shield,
    color: "bg-orange-100 text-orange-600",
    title: "For Students & Parents",
    tips: [
      "For underage students, parents or guardians should be involved in selecting tutors and setting up enrolments.",
      "For physical classes, conduct the first session in a public or supervised environment until you are comfortable.",
      "Inform a trusted adult of any physical class location and schedule.",
      "Trust your instincts — if something feels wrong, end the session and contact TutorLink support.",
    ],
  },
  {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
    title: "Recognise and Report Suspicious Behaviour",
    tips: [
      "Report tutors who misrepresent their qualifications or fail to deliver classes as described.",
      "Report any tutor or student who behaves inappropriately, makes you feel unsafe, or requests personal financial information.",
      "TutorLink has a zero-tolerance policy for harassment, abuse, and fraudulent activity.",
      "Use the Contact Us page or email safety@tutorlink.lk to report concerns confidentially.",
    ],
  },
]

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Safety Tips</h1>
          <p className="text-indigo-100 max-w-2xl mx-auto">
            TutorLink is committed to providing a safe learning environment for all students and tutors. Follow these guidelines to stay safe on our platform.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIPS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-2">Need to report something?</h3>
          <p className="text-gray-600 text-sm mb-4">If you experience or witness unsafe behaviour on TutorLink, please contact us immediately. All reports are treated confidentially.</p>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
