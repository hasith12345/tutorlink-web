"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
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
  CalendarDays,
  Edit,
  Building,
} from "lucide-react"

export default function TutorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tutorStatus, setTutorStatus] = useState<string>("NOT_SUBMITTED")
  const [classes, setClasses] = useState<any[]>([])
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
        const [currentUserRes, statusRes, classesRes] = await Promise.all([
          api.getCurrentUser(),
          api.getTutorApplicationStatus(),
          api.getMyClasses().catch(() => ({ classes: [] })),
        ])

        setTutorStatus(statusRes.tutorStatus)
        setClasses((classesRes.classes || []).filter((c: any) => c.status === "ACTIVE"))

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
        <LoadingSpinner size="lg" />
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
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Your tutor application is under review</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                You will be notified once your application is approved. Some features are disabled until approval.
              </p>
              <button
                onClick={() => router.push('/tutor-application-status')}
                className="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800 underline"
              >
                View Application Status →
              </button>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{user?.totalStudents ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">enrolled students</p>
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
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
                  <p className="text-xs text-gray-400 mt-1">currently running</p>
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
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    Rs.{classes.reduce((sum: number, c: any) => sum + (c.fees || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">from active classes</p>
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{user?.rating?.toFixed(1) ?? "—"}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-3 h-3 ${i <= Math.round(user?.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
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
          {/* My Classes */}
          <div>
            <Card className="border-0 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/tutor/classes")}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    View all <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">No active classes yet</p>
                    <p className="text-xs text-gray-400 mt-1">Create a class to start teaching</p>
                    {tutorStatus === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/tutor/classes/create")}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />Create Class
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classes.slice(0, 4).map((cls) => (
                      <div key={cls.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          {cls.mode === "online"
                            ? <Video className="w-5 h-5 text-white" />
                            : <Building className="w-5 h-5 text-white" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{cls.subject}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {cls.schedule?.length > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />{cls.schedule.join(", ")}
                              </span>
                            )}
                            {cls.time && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />{cls.time}
                              </span>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${cls.mode === "online" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-green-200 text-green-700 bg-green-50"}`}
                            >
                              {cls.mode === "online"
                                ? <><Video className="w-2.5 h-2.5 mr-0.5 inline" />Online</>
                                : <><Building className="w-2.5 h-2.5 mr-0.5 inline" />Physical</>}
                            </Badge>
                          </div>
                        </div>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push("/tutor/classes")}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs flex-shrink-0"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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

            {/* Class Stats */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Overview</h2>
                {classes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400">No classes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classes.slice(0, 4).map((cls: any) => (
                      <div key={cls.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{cls.subject}</p>
                          <p className="text-xs text-gray-500">{cls.schedule?.join(", ")} · {cls.time}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-semibold text-indigo-600">Rs.{cls.fees?.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">{cls.enrolledCount || 0}/{cls.maxStudents}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Tutor Footer */}
      <footer className="mt-12 border-t border-gray-100 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} TutorLink. All rights reserved.</p>
          <a href="/contact-us" className="text-xs text-gray-400 hover:text-white transition-colors">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  )
}
