"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { TutorShell } from "@/components/tutor/tutor-shell"
import { TutorPageHeader } from "@/components/tutor/tutor-page-header"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Users, GraduationCap, CalendarDays, MessageCircle,
  Clock, Monitor, Building, Mail, ChevronDown, ChevronRight, Search, BookOpen,
} from "lucide-react"

export default function TutorStudentsPage() {
  const router = useRouter()
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getTutorStudents>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState<string>("all")

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

  // Distinct classes across all students, for the filter chips
  const classes = useMemo(() => {
    const map = new Map<string, string>()
    data?.students.forEach(s =>
      s.enrolledClasses.forEach(c => map.set(c.classId, c.subject))
    )
    return Array.from(map, ([id, subject]) => ({ id, subject }))
  }, [data])

  const filtered = data?.students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchesClass =
      classFilter === "all" || s.enrolledClasses.some(c => c.classId === classFilter)
    return matchesSearch && matchesClass
  }) ?? []

  return (
    <TutorShell maxWidth="max-w-6xl">
        <TutorPageHeader
          icon={Users}
          title="My Students"
          subtitle="All students enrolled in your classes"
          action={data && (
            <div className="flex gap-3">
              {[
                { value: data.totalStudents, label: "Students" },
                { value: data.totalEnrollments, label: "Enrollments" },
              ].map(({ value, label }) => (
                <div key={label} className="w-28 rounded-2xl border border-slate-200/70 bg-white py-3 text-center shadow-sm">
                  <p className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        />

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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        ) : !data || data.students.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-900">No students yet</h3>
            <p className="text-sm text-slate-500">Students will appear here once they enroll in your classes</p>
          </div>
        ) : (
          <>
            {/* Search + class filter */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {classes.length > 0 && (
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="h-[42px] w-full justify-between gap-2 rounded-xl border-slate-200 bg-white text-sm shadow-sm sm:w-60">
                    <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <BookOpen className="h-4 w-4 shrink-0 text-indigo-500" />
                      <SelectValue placeholder="Filter by class" className="truncate" />
                    </span>
                  </SelectTrigger>
                  <SelectContent className="max-w-[min(90vw,20rem)] rounded-xl">
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Student list */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">No students match your filters</p>
              ) : filtered.map(student => {
                const initials = student.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                const isExpanded = expandedStudents.has(student.id)

                return (
                  <div key={student.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                    {/* Student row */}
                    <div className="flex items-center gap-2 pr-3 sm:pr-4">
                      <button
                        onClick={() => toggleExpand(student.id)}
                        className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
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
                          <p className="font-semibold text-gray-900 truncate">{student.fullName}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{student.email}</span>
                          </p>
                        </div>

                        {/* Enrolled date */}
                        <div className="hidden md:block flex-shrink-0 text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(student.enrolledAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-gray-400">enrolled</p>
                        </div>

                        <div className="flex-shrink-0 ml-1">
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-400" />
                            : <ChevronRight className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </button>

                      {/* Message button */}
                      <button
                        onClick={() => router.push(`/tutor/messages?student=${student.id}`)}
                        title={`Message ${student.fullName}`}
                        className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    </div>

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
    </TutorShell>
  )
}
