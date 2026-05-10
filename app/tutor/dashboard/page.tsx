"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { MyClasses } from "@/components/my-classes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  Plus,
  Calendar,
  Upload,
  ArrowUpRight,
  Clock,
  Video,
  MapPin,
  AlertCircle,
  TrendingUp,
  X,
} from "lucide-react"

// Mock data for dashboard
const mockStats = {
  totalStudents: 24,
  activeSessions: 12,
  totalEarnings: 245000,
  averageRating: 4.9,
}

const mockUpcomingSessions = [
  {
    id: "1",
    studentName: "Alice Miller",
    subject: "Mathematics - Calculus",
    date: "Today",
    time: "4:00 PM - 5:00 PM",
    mode: "Online",
    avatar: null,
  },
  {
    id: "2",
    studentName: "David Chen",
    subject: "Physics - Mechanics",
    date: "Today",
    time: "6:00 PM - 7:30 PM",
    mode: "Physical",
    avatar: null,
  },
  {
    id: "3",
    studentName: "Sarah Wilson",
    subject: "Chemistry - Organic",
    date: "Tomorrow",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
    avatar: null,
  },
]

const mockRecentStudents = [
  { name: "Alice Miller", subject: "Mathematics", lastSession: "Today", rating: 5 },
  { name: "David Chen", subject: "Physics", lastSession: "Yesterday", rating: 4 },
  { name: "Sarah Wilson", subject: "Chemistry", lastSession: "2 days ago", rating: 5 },
  { name: "James Lee", subject: "Biology", lastSession: "3 days ago", rating: 5 },
]

export default function TutorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tutorStatus, setTutorStatus] = useState<string>("NOT_SUBMITTED")
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return true
    return localStorage.getItem("tutorWelcomeDismissed") !== "true"
  })

  const dismissWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem("tutorWelcomeDismissed", "true")
  }

  useEffect(() => {
    const init = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push("/login")
        return
      }

      const userData = authStorage.getUser()
      if (!userData || !userData.hasTutorProfile) {
        router.push("/dashboard")
        return
      }

      setUser(userData)
      authStorage.setActiveRole("tutor")

      // Fetch current user with role flags and tutor status
      try {
        const [currentUserRes, statusRes] = await Promise.all([
          api.getCurrentUser(),
          api.getTutorApplicationStatus()
        ])

        setTutorStatus(statusRes.tutorStatus)

        // Sync user data with latest info from backend
        const syncedUser = {
          ...currentUserRes.user,
          tutorStatus: statusRes.tutorStatus
        }
        authStorage.setUser(syncedUser)
        setUser(syncedUser)

      } catch (err) {
        const storedStatus = userData.tutorStatus || "NOT_SUBMITTED"
        setTutorStatus(storedStatus)
      }

      setIsLoading(false)
    }

    init()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <TutorNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NOT_SUBMITTED Banner - profile created but no details submitted */}
        {tutorStatus === "NOT_SUBMITTED" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800">Complete your tutor profile to get started</h3>
              <p className="text-sm text-blue-700 mt-0.5">
                You need to submit your qualifications, subjects, and ID documents before your profile can be reviewed.
              </p>
              <Button
                onClick={() => router.push('/complete-tutor-application')}
                size="sm"
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        )}

        {/* PENDING Banner - details submitted, awaiting admin review */}
        {tutorStatus === "PENDING" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Your tutor application is under review</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                You will be notified once your application is approved. Some features are disabled until approval.
              </p>
            </div>
          </div>
        )}

        {/* REJECTED Banner */}
        {tutorStatus === "REJECTED" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Your tutor application was not approved</h3>
              <p className="text-sm text-red-700 mt-0.5">
                Please contact our support team or resubmit your profile for review.
              </p>
              <Button
                onClick={() => router.push('/tutor-application-status')}
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                View Application Status
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        {showWelcome && (
          <div className="mb-8 relative bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
            <button
              onClick={dismissWelcome}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 pr-8">
              Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.fullName?.split(" ")[0]}</span>
            </h1>
            <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your tutoring today.</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockStats.totalStudents}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +3 this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockStats.activeSessions}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +2 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Rs.{mockStats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +Rs.12,000
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockStats.averageRating}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-3 h-3 ${i <= Math.round(mockStats.averageRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <div>
            <Card className="border-0 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockUpcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {session.studentName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{session.studentName}</p>
                        <p className="text-xs text-gray-500">{session.subject}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {session.date} {session.time}
                          </span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${session.mode === "Online" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-green-200 text-green-700 bg-green-50"}`}>
                            {session.mode === "Online" ? <Video className="w-2.5 h-2.5 mr-0.5" /> : <MapPin className="w-2.5 h-2.5 mr-0.5" />}
                            {session.mode}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs shadow-md"
                      >
                        Start Session
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Actions + Recent Students */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => router.push("/tutor/classes/create")}
                    disabled={tutorStatus !== "APPROVED"}
                    className="h-auto py-4 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex flex-col items-center gap-2 rounded-xl shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-medium">Create Class</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/tutor/schedule")}
                    disabled={tutorStatus !== "APPROVED"}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">Manage Schedule</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/tutor/earnings")}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">View Earnings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">Upload Materials</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Students */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Students</h2>
                <div className="space-y-3">
                  {mockRecentStudents.map((student, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.subject}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s <= student.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* My Classes */}
        <MyClasses />
      </main>
    </div>
  )
}
