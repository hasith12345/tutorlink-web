import { Card, CardContent } from "@/components/ui/card"
import { Shield, CheckCircle, Eye, Building2 } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and encrypted payment processing for all transactions between students and tutors.",
  },
  {
    icon: CheckCircle,
    title: "Enrollment Confirmations",
    description: "Instant confirmations and reminders for all your scheduled sessions and classes.",
  },
  {
    icon: Eye,
    title: "Admin Monitoring",
    description: "Platform integrity maintained through careful monitoring and quality assurance.",
  },
  {
    icon: Building2,
    title: "Centralized Platform",
    description: "One unified platform instead of scattered individual websites or social media pages.",
  },
]

export function PlatformFeatures() {
  return (
    <section id="about" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 mb-6 leading-tight drop-shadow-lg">
            Built for Trust and Reliability
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            TutorLink provides a secure, monitored, and centralized platform for seamless learning experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-8 flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
