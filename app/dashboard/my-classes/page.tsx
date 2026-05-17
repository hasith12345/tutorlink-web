"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  GraduationCap, CalendarDays, Clock, Monitor, Building,
  ChevronRight, BookOpen, ArrowLeft,
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
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
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
                  onClick={() => router.push(`/tutor/${e.class.tutorId}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Tutor avatar */}
                        <div className="flex-shrink-0">
                          {e.class.tutorAvatar ? (
                            <img
                              src={e.class.tutorAvatar}
                              alt={e.class.tutorName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {e.class.tutorName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{e.class.subject}</h3>
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0"
                            >
                              <ModeIcon className="w-3 h-3 mr-1" />
                              {e.class.mode.charAt(0).toUpperCase() + e.class.mode.slice(1)}
                            </Badge>
                          </div>

                          <p className="text-sm text-indigo-600 font-medium mb-2">{e.class.tutorName}</p>

                          {e.class.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{e.class.description}</p>
                          )}

                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {e.class.schedule.length > 0 && (
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{e.class.schedule.join(", ")}</span>
                              </div>
                            )}
                            {e.class.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{e.class.time} · {e.class.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Monthly</p>
                          <p className="font-bold text-indigo-600 text-sm">
                            Rs.{e.class.fees.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          Active
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>

                    {e.payment && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <span>
                          Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="text-green-600 font-medium">
                          Paid Rs.{e.payment.totalAmount.toLocaleString()}
                        </span>
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
