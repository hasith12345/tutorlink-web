"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  Star, 
  TrendingUp,
  Clock,
  Award,
  MessageCircle,
  Settings,
  Plus,
  ArrowUpRight
} from "lucide-react"

export default function TutorDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const [activeRole, setActiveRole] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const userType = sessionStorage.getItem("userType")
    const storedUserName = sessionStorage.getItem("userName")
    const hasStudentProfile = sessionStorage.getItem("hasStudentProfile") === "true"

    if (!token) {
      router.push("/login")
      return
    }

    if (userType !== "tutor") {
      router.push("/")
      return
    }

    setUserName(storedUserName || "Tutor")
    setActiveRole(hasStudentProfile ? "dual" : "tutor")
    setIsLoading(false)
  }, [router])

  const handleSwitchRole = () => {
    sessionStorage.setItem("userType", "student")
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">Here's what's happening with your tutoring today.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeRole === "dual" && (
                <Button
                  onClick={handleSwitchRole}
                  variant="outline"
                  className="bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold"
                >
                  Switch to Student
                </Button>
              )}
              <Button
                onClick={() => router.push("/dashboard/settings")}
                variant="outline"
                className="bg-white rounded-xl"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">+3 new</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-0">This week</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <span>4 completed, 8 upcoming</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">MTD</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">$2,450</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span>18% increase</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-0">
                  <Award className="w-3 h-3 mr-1" />
                  Top rated
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">4.9</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <span>Based on 156 reviews</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Sessions */}
            <Card className="bg-white rounded-2xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <Button
                    onClick={() => router.push("/schedule")}
                    variant="outline"
                    className="bg-transparent border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Session Card 1 */}
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        AM
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Alice Miller</h3>
                            <p className="text-sm text-indigo-600 font-medium">Mathematics • Calculus</p>
                          </div>
                          <Badge className="bg-green-500 text-white border-0 flex-shrink-0">
                            <Clock className="w-3 h-3 mr-1" />
                            Today
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            4:00 PM - 5:00 PM
                          </span>
                          <span>•</span>
                          <span>1 hour session</span>
                        </div>
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold">
                            Start Session
                          </Button>
                          <Button variant="outline" className="bg-white rounded-xl">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Card 2 */}
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg flex-shrink-0">
                        BJ
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Bob Johnson</h3>
                            <p className="text-sm text-gray-600 font-medium">Physics • Mechanics</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">Tomorrow</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            2:00 PM - 3:30 PM
                          </span>
                          <span>•</span>
                          <span>1.5 hour session</span>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 bg-white rounded-xl">
                            View Details
                          </Button>
                          <Button variant="outline" className="bg-white rounded-xl">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="bg-white rounded-2xl border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    <Star className="w-3 h-3 mr-1 fill-yellow-700" />
                    4.9 Average
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                          ST
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Sarah Thompson</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      "Excellent tutor! Very patient and explains concepts clearly. Highly recommend for anyone struggling with calculus!"
                    </p>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          MC
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Mike Chen</p>
                          <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      "Great session! Helped me understand difficult concepts in no time. Looking forward to more sessions."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Actions */}
            <Card className="bg-white rounded-2xl border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Gig
                  </Button>
                  <Button variant="outline" className="w-full h-12 bg-transparent border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Schedule
                  </Button>
                  <Button variant="outline" className="w-full h-12 bg-transparent border-green-200 text-green-600 hover:bg-green-50 rounded-xl font-semibold justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Earnings
                  </Button>
                  <Button variant="outline" className="w-full h-12 bg-transparent border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl font-semibold justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl border-0 shadow-lg text-white">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold mb-4">This Month's Performance</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/90">Sessions Completed</span>
                      <span className="font-bold">24/30</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/90">Student Satisfaction</span>
                      <span className="font-bold">98%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/90">Response Rate</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badge */}
            <Card className="bg-white rounded-2xl border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Top Rated Tutor</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You're in the top 10% of tutors this month! Keep up the great work.
                </p>
                <Badge className="bg-yellow-100 text-yellow-700 border-0">
                  Excellence Award
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
