import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, FileText, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: Search,
    title: "Search Tutors Easily",
    description: "Find qualified tutors by subject, location, and learning preference with our smart search.",
  },
  {
    icon: BookOpen,
    title: "Enroll in Classes",
    description: "Book sessions with your preferred tutors and manage your learning schedule effortlessly.",
  },
  {
    icon: FileText,
    title: "Access Learning Materials",
    description: "Get shared resources, notes, and study materials directly from your tutors.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "View your grades, attendance, and learning milestones all in one place.",
  },
]

export function StudentBenefits() {
  return (
    <section id="students" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            For Students
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 mb-6 leading-tight drop-shadow-lg">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our platform makes it easy to find the right tutor and achieve your academic goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-gray-50 border-0 rounded-2xl hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
