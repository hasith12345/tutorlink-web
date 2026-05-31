"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft, Users, GraduationCap, BookOpen, CalendarDays,
  Clock, Monitor, Building, Mail, ChevronDown, ChevronRight,
} from "lucide-react"

export default function TutorStudentsPage() {
  const router = useRouter()
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getTutorStudents>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.getTutorStudents()
      .then(setData)
      .catch(err => setError(err.message || "Failed to load students"))
      .finally(() => setLoading(false))
  }, [])

  function toggleExpand(id: string) {
    setExpandedStudents(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = data?.students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
              <p className="text-sm text-gray-500">All students enrolled in your classes</p>
            </div>
          </div>
          {data && (
            <div className="flex gap-3">
              {[
                { value: data.totalStudents, label: "Students" },
                { value: data.totalEnrollments, label: "Enrollments" },
              ].map(({ value, label }) => (
                <div key={label} className="w-32 bg-white border border-gray-100 rounded-xl py-3 text-center shadow-sm">
                  <p className="text-xl font-bold text-indigo-600">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <>
            {/* Search skeleton */}
            <Skeleton className="h-10 w-72 rounded-xl bg-gray-200 mb-4" />

            {/* Student rows skeleton */}
            <div className="space-y-3">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36 bg-gray-200" />
                    <Skeleton className="h-3 w-48 bg-gray-200" />
                  </div>
                  <div className="hidden sm:block space-y-1 text-right flex-shrink-0">
                    <Skeleton className="h-3 w-20 bg-gray-200" />
                    <Skeleton className="h-3 w-14 bg-gray-200" />
                  </div>
                  <Skeleton className="w-4 h-4 rounded bg-gray-200 flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : !data || data.students.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No students yet</h3>
            <p className="text-sm text-gray-500">Students will appear here once they enroll in your classes</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
              />
            </div>

            {/* Student list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No students match your search</p>
              ) : filtered.map(student => {
                const initials = student.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                const isExpanded = expandedStudents.has(student.id)

                return (
                  <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Student row */}
                    <button
                      onClick={() => toggleExpand(student.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.fullName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {initials}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{student.fullName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />{student.email}
                        </p>
                      </div>

                      {/* Enrolled date */}
                      <div className="hidden sm:block flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(student.enrolledAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-400">enrolled</p>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </button>

                    {/* Expanded: enrolled classes */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {student.enrolledClasses.map(cls => {
                          const ModeIcon = cls.mode === "physical" ? Building : Monitor
                          return (
                            <div key={cls.enrollmentId} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 bg-gray-50/50">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-gray-800">{cls.subject}</p>
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls.mode === "online" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-green-200 text-green-700 bg-green-50"}`}>
                                    <ModeIcon className="w-2.5 h-2.5 mr-1 inline" />
                                    {cls.mode.charAt(0).toUpperCase() + cls.mode.slice(1)}
                                  </Badge>
                                </div>
                                {cls.description && (
                                  <p className="text-xs text-gray-500 mb-1">{cls.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  {cls.schedule.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3 text-indigo-400" />{cls.schedule.join(", ")}
                                    </span>
                                  )}
                                  {cls.time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-indigo-400" />{cls.time}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-indigo-600">Rs.{cls.fees.toLocaleString()}</p>
                                  <p className="text-xs text-gray-400">/month</p>
                                </div>
                                {cls.payment && (
                                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">Paid</Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
