"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GraduationCap, CalendarDays, Clock, Monitor, Building,
  ChevronRight, BookOpen, ArrowLeft, Video,
} from "lucide-react"
import { api } from "@/lib/api"

export default function MyClassesPage() {
  const router = useRouter()
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getStudentEnrollments>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.getStudentEnrollments()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load classes"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-sm text-gray-500">Your active enrolled classes</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-28 bg-gray-200" />
                        <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                      </div>
                      <Skeleton className="h-3 w-24 bg-gray-200" />
                      <div className="flex gap-3">
                        <Skeleton className="h-3 w-32 bg-gray-200" />
                        <Skeleton className="h-3 w-24 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Skeleton className="h-3 w-10 bg-gray-200" />
                    <Skeleton className="h-4 w-16 bg-gray-200" />
                    <Skeleton className="h-5 w-14 rounded-full bg-gray-200" />
                    <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : !data || data.enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">No classes yet</p>
            <p className="text-gray-400 text-sm mb-6">Find a tutor and enroll in a class to get started</p>
            <Button
              onClick={() => router.push("/search")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl px-6"
            >
              Browse Tutors
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.enrollments.map((e) => {
              const ModeIcon = e.class.mode === "physical" ? Building : Monitor
              return (
                <Card
                  key={e.enrollmentId}
                  className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/my-classes/${e.class.id}`)}
                >
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Tutor avatar */}
                        <div className="flex-shrink-0">
                          {e.class.tutorAvatar ? (
                            <img
                              src={e.class.tutorAvatar}
                              alt={e.class.tutorName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {e.class.tutorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-900 truncate">{e.class.subject}</h3>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0">
                              <ModeIcon className="w-3 h-3 mr-1" />
                              {e.class.mode.charAt(0).toUpperCase() + e.class.mode.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">{e.class.tutorName}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                            {e.class.schedule.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-indigo-400" />
                                {e.class.schedule.join(", ")}
                              </span>
                            )}
                            {e.class.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                {e.class.time} · {e.class.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Monthly</p>
                          <p className="font-bold text-indigo-600 text-sm">Rs.{e.class.fees.toLocaleString()}</p>
                        </div>
                        {e.status === "UNENROLLED" && e.accessUntil ? (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                            Ends {new Date(e.accessUntil).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </Badge>
                        ) : e.accessBlocked ? (
                          <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">
                            Access Blocked
                          </Badge>
                        ) : e.isPaymentDue ? (
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">
                            Payment Due
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Active</Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>

                    {/* Quick actions row — only shown when there's content */}
                    {(e.class.meetingLink || e.payment) && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                        {e.class.meetingLink && !e.accessBlocked && (
                          <a
                            href={e.class.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={ev => ev.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Video className="w-3 h-3" /> Join Class
                          </a>
                        )}
                        {e.accessBlocked && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">
                            <Clock className="w-3 h-3" /> Renew to access
                          </span>
                        )}
                        {e.payment && (
                          <span className="ml-auto text-xs text-green-600 font-medium">
                            Paid Rs.{e.payment.totalAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
