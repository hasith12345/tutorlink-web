"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorShell } from "@/components/tutor/tutor-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  Plus,
  MessageSquare,
  ArrowUpRight,
  Clock,
  Video,
  AlertCircle,
  X,
  CalendarDays,
  Edit,
  Building,
  TrendingUp,
} from "lucide-react"

export default function TutorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tutorStatus, setTutorStatus] = useState<string>("NOT_SUBMITTED")
  const [classes, setClasses] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [tutorRating, setTutorRating] = useState<number>(0)
  const [tutorTotalReviews, setTutorTotalReviews] = useState<number>(0)
  const [earnings, setEarnings] = useState<{ totalEarned: number; thisMonth: number; recentPayments: any[] } | null>(null)
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

      // Heartbeat — records this dashboard visit as the tutor's last-online time
      // Used by the daily availability cron to flip isAvailable for inactive tutors
      api.recordTutorHeartbeat().catch(() => {})

      // Fetch current user with role flags and tutor status
      try {
        const [currentUserRes, statusRes, classesRes, earningsRes, studentsRes] = await Promise.all([
          api.getCurrentUser(),
          api.getTutorApplicationStatus(),
          api.getMyClasses().catch(() => ({ classes: [] })),
          api.getTutorEarnings().catch(() => null),
          api.getTutorStudents().catch(() => null),
        ])

        setTutorStatus(statusRes.tutorStatus)
        setTutorRating(statusRes.profile?.rating ?? 0)
        setTutorTotalReviews(statusRes.profile?.totalReviews ?? 0)
        setClasses((classesRes.classes || []).filter((c: any) => c.status === "ACTIVE"))
        if (studentsRes) setTotalStudents(studentsRes.totalStudents)
        if (earningsRes) {
          setEarnings({
            totalEarned: earningsRes.summary.totalEarned,
            thisMonth: earningsRes.summary.thisMonth,
            recentPayments: earningsRes.payments.slice(0, 4),
          })
        }

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

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      sub: "enrolled students",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/30",
    },
    {
      label: "Active Classes",
      value: classes.length,
      sub: "currently running",
      icon: BookOpen,
      gradient: "from-emerald-500 to-green-500",
      glow: "shadow-emerald-500/30",
    },
    {
      label: "Monthly Revenue",
      value: `Rs.${classes.reduce((s: number, c: any) => s + (c.fees || 0), 0).toLocaleString()}`,
      sub: "from active classes",
      icon: DollarSign,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/30",
    },
    {
      label: "Average Rating",
      value: tutorRating > 0 ? tutorRating.toFixed(1) : "—",
      sub: tutorTotalReviews > 0 ? `${tutorTotalReviews} review${tutorTotalReviews !== 1 ? "s" : ""}` : "no reviews yet",
      icon: Star,
      gradient: "from-amber-400 to-orange-500",
      glow: "shadow-amber-500/30",
      stars: true,
    },
  ]

  return (
    <TutorShell>
      {isLoading ? (
        <>
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-3">
                <Skeleton className="h-11 w-11 rounded-xl bg-slate-200" />
                <Skeleton className="h-3 w-24 bg-slate-200" />
                <Skeleton className="h-7 w-20 bg-slate-200" />
              </div>
            ))}
          </div>

          {/* Two-column grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28 bg-slate-200" />
                <Skeleton className="h-4 w-16 bg-slate-200" />
              </div>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 bg-slate-200" />
                    <Skeleton className="h-3 w-48 bg-slate-200" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg bg-slate-200 flex-shrink-0" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-4">
                <Skeleton className="h-5 w-32 bg-slate-200" />
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl bg-slate-200" />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36 bg-slate-200" />
                  <Skeleton className="h-4 w-16 bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 rounded-xl bg-slate-200" />
                  <Skeleton className="h-16 rounded-xl bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          {/* NOT_SUBMITTED Banner */}
          {tutorStatus === "NOT_SUBMITTED" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200/70 bg-blue-50/80 p-4 backdrop-blur-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Complete your tutor profile to get started</h3>
                <p className="mt-0.5 text-sm text-blue-700">
                  You need to submit your qualifications, subjects, and ID documents before your profile can be reviewed.
                </p>
                <Button
                  onClick={() => router.push('/complete-tutor-application')}
                  size="sm"
                  className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {/* PENDING Banner */}
          {tutorStatus === "PENDING" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 backdrop-blur-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">Your tutor application is under review</h3>
                <p className="mt-0.5 text-sm text-amber-700">
                  You will be notified once your application is approved. Some features are disabled until approval.
                </p>
                <button
                  onClick={() => router.push('/tutor-application-status')}
                  className="mt-3 text-xs font-medium text-amber-700 underline hover:text-amber-800"
                >
                  View Application Status →
                </button>
              </div>
            </div>
          )}

          {/* REJECTED Banner */}
          {tutorStatus === "REJECTED" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200/70 bg-red-50/80 p-4 backdrop-blur-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-900">Your tutor application was not approved</h3>
                <p className="mt-0.5 text-sm text-red-700">
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

          {/* Welcome Hero */}
          {showWelcome && (
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 px-7 py-7 shadow-xl shadow-indigo-500/20">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />
              <button
                onClick={dismissWelcome}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Welcome back, {user?.fullName?.split(" ")[0]} 👋
                </h1>
                <p className="mt-1.5 text-indigo-100">
                  Here&apos;s what&apos;s happening with your tutoring today.
                </p>
              </div>
            </div>
          )}

          {/* Statistics grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                  {stat.stars ? (
                    <div className="mt-1 flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`h-3 w-3 ${i <= Math.round(tutorRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                      <span className="ml-1 text-xs text-slate-400">{stat.sub}</span>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* My Classes */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <BookOpen className="h-4 w-4 text-indigo-500" />My Classes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tutor/classes")}
                  className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>

              {classes.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                    <BookOpen className="h-7 w-7 text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No active classes yet</p>
                  <p className="mt-1 text-xs text-slate-400">Create a class to start teaching</p>
                  {tutorStatus === "APPROVED" && (
                    <Button
                      size="sm"
                      onClick={() => router.push("/tutor/classes/create")}
                      className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-xs text-white hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />Create Class
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.slice(0, 4).map((cls) => (
                    <div key={cls.id} className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-sm">
                        {cls.mode === "online"
                          ? <Video className="h-5 w-5 text-white" />
                          : <Building className="h-5 w-5 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{cls.subject}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          {cls.schedule?.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <CalendarDays className="h-3 w-3" />{cls.schedule.join(", ")}
                            </span>
                          )}
                          {cls.time && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />{cls.time}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0 text-[10px] ${cls.mode === "online" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-green-200 bg-green-50 text-green-700"}`}
                          >
                            {cls.mode === "online"
                              ? <><Video className="mr-0.5 inline h-2.5 w-2.5" />Online</>
                              : <><Building className="mr-0.5 inline h-2.5 w-2.5" />Physical</>}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/tutor/classes")}
                        className="flex-shrink-0 border-indigo-200 text-xs text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" />Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => router.push("/tutor/classes/create")}
                    disabled={tutorStatus !== "APPROVED"}
                    className="flex h-auto flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 py-4 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs font-medium">Create Class</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/tutor/messages")}
                    disabled={tutorStatus !== "APPROVED"}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl border-slate-200 py-4 hover:bg-slate-50"
                  >
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    <span className="text-xs font-medium text-slate-700">Messages</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/tutor/earnings")}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl border-slate-200 py-4 hover:bg-slate-50"
                  >
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    <span className="text-xs font-medium text-slate-700">View Earnings</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/tutor/students")}
                    disabled={tutorStatus !== "APPROVED"}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl border-slate-200 py-4 hover:bg-slate-50"
                  >
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-xs font-medium text-slate-700">Students</span>
                  </Button>
                </div>
              </div>

              {/* Earnings Overview */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />Earnings Overview
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/tutor/earnings")}
                    className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>

                {earnings && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-3.5">
                      <p className="mb-1 text-xs font-medium text-indigo-500">This Month</p>
                      <p className="text-lg font-bold text-indigo-700">Rs.{earnings.thisMonth.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5">
                      <p className="mb-1 text-xs font-medium text-emerald-500">Total Earned</p>
                      <p className="text-lg font-bold text-emerald-700">Rs.{earnings.totalEarned.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {!earnings || earnings.recentPayments.length === 0 ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-400">No payments yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {earnings.recentPayments.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 border-t border-slate-50 py-2.5 first:border-0">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
                          {p.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{p.studentName}</p>
                          <p className="truncate text-xs text-slate-500">{p.className}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-bold text-emerald-600">+Rs.{p.tutorAmount.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </TutorShell>
  )
}
