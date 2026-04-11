"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  UserPlus, 
  CheckSquare, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  Shield,
  BookOpen,
  Headphones,
  ArrowRight,
  Star,
  MapPin,
  Banknote
} from "lucide-react"

export default function BecomeTutorPage() {
  const router = useRouter()

  const steps = [
    {
      icon: UserPlus,
      title: "Sign up",
      description: "Create your TutorLink tutor profile",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: CheckSquare,
      title: "Get approved",
      description: "Reviewed by our Sri Lanka team",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: DollarSign,
      title: "Start earning",
      description: "Teach students and get paid in LKR",
      color: "from-green-500 to-emerald-500"
    }
  ]

  const benefits = [
    {
      icon: Banknote,
      title: "Set your own rate (LKR/hour)",
      description: "You decide how much you charge per hour"
    },
    {
      icon: Clock,
      title: "Teach anytime, anywhere in Sri Lanka",
      description: "Flexible schedule that fits your lifestyle"
    },
    {
      icon: TrendingUp,
      title: "Grow your local tutoring career",
      description: "Build your reputation and expand your student base"
    }
  ]

  const features = [
    { icon: Users, text: "Steady flow of Sri Lankan students" },
    { icon: Calendar, text: "Local timetable support" },
    { icon: Shield, text: "Secure LKR payments" },
    { icon: BookOpen, text: "OL / AL / University syllabus support" },
    { icon: Headphones, text: "Dedicated Sri Lankan tutor support" }
  ]

  const testimonials = [
    {
      name: "Priya Jayawardena",
      role: "Math Teacher - Colombo",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4",
      quote: "Teaching online with TutorLink has been amazing! I now teach students from Kandy to Galle from my home in Colombo.",
      rating: 5
    },
    {
      name: "Ashan Perera",
      role: "University Student - Engineering",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashan&backgroundColor=c0aede",
      quote: "As a university student, this is perfect. I teach A/L Physics in the evenings and earn extra income in LKR.",
      rating: 5
    },
    {
      name: "Nimali Fernando",
      role: "English Tutor - Kurunegala",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nimali&backgroundColor=d1d4f9",
      quote: "The platform makes it easy to connect with O/L and A/L students. Payment is secure and always on time!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background2.png)' }}
        />
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 lg:pt-16 lg:pb-25">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-6">
              <Badge className="bg-indigo-200 text-indigo-800 border-0 backdrop-blur-sm px-4 py-2 text-sm font-medium">
                <MapPin className="w-4 h-4 mr-2 inline" />
                Trusted by tutors across Sri Lanka
              </Badge>

              <h1 className="text-4xl md:text-5xl text-black lg:text-6xl font-bold leading-tight">
                Earn by teaching students across{" "}<br />
                <span className="text-indigo-500">Sri Lanka</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-500 max-w-2xl">
                Teach OL, AL, university subjects, or skills online from home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="bg-indigo-500 text-white hover:bg-indigo-600 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                >
                  Start Teaching Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/search')}
                  className="bg-transparent border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white text-lg px-8 py-6 rounded-xl font-semibold transition-all duration-300"
                >
                  See Tutor Profiles
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-indigo-500">500+</div>
                  <div className="text-sm text-indigo-400">Active Tutors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-500">10k+</div>
                  <div className="text-sm text-indigo-400">Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-500">4.8★</div>
                  <div className="text-sm text-indigo-400">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Image/Illustration
            <div className="hidden lg:block">
              <div className="border relative rounded-4xl overflow-hidden">
                <img src="/become-tutor.jpg" alt="Become a Tutor" />
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gray-600 text-sm font-medium mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Start teaching in 3 easy steps
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute top-[60px] left-[80px] right-[80px] h-[2px] bg-gray-300 hidden md:block" />
              
              <div className="grid md:grid-cols-3 gap-8 md:gap-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 w-[100px] h-[100px] bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-5xl font-bold">1</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Sign up
                  </h3>
                  <p className="text-gray-600 text-base">
                    to create your tutor profile
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 w-[100px] h-[100px] bg-blue-200 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-gray-900 text-5xl font-bold">2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Get approved
                  </h3>
                  <p className="text-gray-600 text-base">
                    by our team in 5 business days
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 w-[100px] h-[100px] bg-blue-200 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-gray-900 text-5xl font-bold">3</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Start earning
                  </h3>
                  <p className="text-gray-600 text-base">
                    by teaching students all over the world!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 text-white text-lg px-12 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create a tutor profile now
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits of Teaching on TutorLink
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of tutors earning from home
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-1 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Features List */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why tutors love TutorLink
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We provide all the tools and support you need to succeed
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900">
                        {feature.text}
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image/Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/50 to-purple-200/50 rounded-3xl blur-3xl" />
              <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center pb-6 border-b">
                      <div className="text-5xl font-bold text-blue-600 mb-2">LKR 2,000 - 5,000</div>
                      <div className="text-gray-600">Average hourly rate for tutors</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className=" rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                        <div className="text-sm text-gray-600">Active Tutors</div>
                      </div>
                      <div className="rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                        <div className="text-sm text-gray-600">Satisfaction Rate</div>
                      </div>
                      <div className="rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                        <div className="text-sm text-gray-600">Support</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center">
                      <div className="text-sm font-medium opacity-90 mb-1">Join our community</div>
                      <div className="text-2xl font-bold">Start earning today!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hear from our tutors
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from real tutors across Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full border-2 border-indigo-100"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Get paid to teach online in Sri Lanka
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join TutorLink today and start building your teaching career from home
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold"
            >
              Create Your Profile Now
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>

          <p className="mt-8 text-blue-100">
            Have questions?{" "}
            <a href="/contact-us" className="text-yellow-300 hover:text-yellow-200 font-semibold underline">
              Contact our team
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
