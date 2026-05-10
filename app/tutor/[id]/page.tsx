"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { api, authStorage } from "@/lib/api"
import {
  ArrowLeft, Star, MapPin, Users, Clock, Award, BookOpen,
  CalendarDays, Monitor, Building, Video, CheckCircle,
  GraduationCap, Briefcase, ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"

const modeIcon = { online: Monitor, physical: Building, hybrid: Video }
const modeColor = {
  online: "bg-blue-50 text-blue-700 border-blue-200",
  physical: "bg-green-50 text-green-700 border-green-200",
  hybrid: "bg-purple-50 text-purple-700 border-purple-200",
}

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tutor, setTutor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null)
  const isLoggedIn = authStorage.isAuthenticated()

  useEffect(() => {
    api.getTutorById(id)
      .then(res => setTutor(res.tutor))
      .catch(() => setError("Tutor not found"))
      .finally(() => setLoading(false))
  }, [id])

  const handleEnroll = async (classId: string) => {
    if (!isLoggedIn) { router.push("/login"); return }
    setEnrolling(classId)
    try {
      // TODO: call enroll API when ready
      await new Promise(r => setTimeout(r, 1000))
      setEnrollSuccess(classId)
    } catch {
      alert("Enrollment failed. Please try again.")
    } finally {
      setEnrolling(null)
    }
  }

  const initials = tutor?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "T"

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner size="lg" fullPage /></div>
  )

  if (error || !tutor) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-gray-500 text-lg">Tutor not found.</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">Go back</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                  {tutor.avatar ? (
                    <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                {tutor.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
                  {tutor.isVerified && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 self-center sm:self-auto">
                      <Award className="w-3 h-3 mr-1" />Verified Tutor
                    </Badge>
                  )}
                </div>

                {tutor.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start mb-3">
                    {tutor.subjects.map((s: string) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        <BookOpen className="w-3 h-3" />{s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-gray-600">
                  {tutor.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">{tutor.rating.toFixed(1)}</span>
                      {tutor.totalReviews > 0 && <span className="text-gray-400">({tutor.totalReviews} reviews)</span>}
                    </div>
                  )}
                  {tutor.totalStudents > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{tutor.totalStudents} students</span>
                    </div>
                  )}
                  {tutor.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{tutor.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {(tutor.bio || tutor.experience || tutor.qualifications || tutor.education) && (
            <div className="p-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {tutor.bio && (
                <div className="sm:col-span-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{tutor.bio}</p>
                </div>
              )}
              {tutor.experience && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Experience</p>
                    <p className="text-sm text-gray-800 mt-0.5">{tutor.experience}</p>
                  </div>
                </div>
              )}
              {tutor.qualifications && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Qualifications</p>
                    <p className="text-sm text-gray-800 mt-0.5">{tutor.qualifications}</p>
                  </div>
                </div>
              )}
              {tutor.education && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Education</p>
                    <p className="text-sm text-gray-800 mt-0.5">{tutor.education}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Classes */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Available Classes
            <span className="ml-2 text-sm font-normal text-gray-400">({tutor.classes?.length || 0})</span>
          </h2>

          {!tutor.classes?.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No classes available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tutor.classes.map((cls: any) => {
                const ModeIcon = modeIcon[cls.mode as keyof typeof modeIcon] || Monitor
                const enrolled = enrollSuccess === cls.id
                return (
                  <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        {/* Subject & mode */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-base">{cls.subject}</h3>
                          <Badge variant="outline" className={`text-xs ${modeColor[cls.mode as keyof typeof modeColor] || modeColor.online}`}>
                            <ModeIcon className="w-3 h-3 mr-1" />
                            {cls.mode?.charAt(0).toUpperCase() + cls.mode?.slice(1)}
                          </Badge>
                        </div>

                        {cls.description && (
                          <p className="text-sm text-gray-500 mb-3">{cls.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {cls.schedule?.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span>{cls.schedule.join(", ")}</span>
                            </div>
                          )}
                          {cls.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span>{cls.time} · {cls.duration}</span>
                            </div>
                          )}
                          {cls.venue && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <span>{cls.venue}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <span>{cls.enrolledCount || 0} / {cls.maxStudents} students</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Enroll */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Monthly fee</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Rs.{cls.fees?.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">/month</p>
                        </div>

                        {enrolled ? (
                          <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />Enrolled!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(cls.id)}
                            disabled={enrolling === cls.id || cls.enrolledCount >= cls.maxStudents}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enrolling === cls.id ? (
                              <LoadingSpinner size="sm" />
                            ) : cls.enrolledCount >= cls.maxStudents ? (
                              "Class Full"
                            ) : (
                              <><span>Enroll Now</span><ChevronRight className="w-4 h-4" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
