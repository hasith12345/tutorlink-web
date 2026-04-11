"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  Building,
  MoreVertical,
  Edit,
  XCircle,
  Eye,
  BookOpen,
  AlertCircle,
} from "lucide-react"

export default function TutorClassesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [tutorStatus, setTutorStatus] = useState("NOT_SUBMITTED")
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push("/login")
        return
      }

      const userData = authStorage.getUser()
      if (!userData?.hasTutorProfile) {
        router.push("/dashboard")
        return
      }

      try {
        const statusRes = await api.getTutorApplicationStatus()
        setTutorStatus(statusRes.tutorStatus)

        if (statusRes.tutorStatus === "APPROVED") {
          const classesRes = await api.getMyClasses()
          setClasses(classesRes.classes || [])
        }
      } catch {
        // ignore
      }

      setIsLoading(false)
    }
    init()
  }, [router])

  const handleCancelClass = async (classId: string) => {
    try {
      await api.cancelClass(classId)
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, status: "CANCELLED" } : c))
      )
    } catch (err: any) {
      alert(err.message || "Failed to cancel class")
    }
    setActionMenuOpen(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  const activeClasses = classes.filter((c) => c.status === "ACTIVE")
  const cancelledClasses = classes.filter((c) => c.status === "CANCELLED")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <TutorNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-500 mt-0.5">Manage your tutoring classes and sessions</p>
          </div>
          <Button
            onClick={() => router.push("/tutor/classes/create")}
            disabled={tutorStatus !== "APPROVED"}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </div>

        {/* Pending Banner */}
        {tutorStatus !== "APPROVED" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Approval Required</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                You need to be an approved tutor to create and manage classes.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tutorStatus === "APPROVED" && classes.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes yet</h3>
              <p className="text-gray-500 mb-4">Create your first class to start accepting students</p>
              <Button
                onClick={() => router.push("/tutor/classes/create")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Class
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Classes */}
        {activeClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Classes ({activeClasses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClasses.map((cls) => (
                <Card key={cls.id} className="border-0 shadow-sm hover:shadow-md transition-shadow group">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cls.subject}</h3>
                        {cls.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cls.description}</p>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === cls.id ? null : cls.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {actionMenuOpen === cls.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Eye className="w-3.5 h-3.5" /> View Students
                            </button>
                            <button
                              onClick={() => handleCancelClass(cls.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel Class
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {cls.venue && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{cls.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {cls.mode === "online" ? (
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-green-400" />
                        )}
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls.mode === "online" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-green-200 text-green-700 bg-green-50"}`}>
                          {cls.mode === "online" ? "Online" : "Physical"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(cls.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cls.time} ({cls.duration})</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        Rs.{cls.fees?.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {cls.enrolledCount || 0} / {cls.maxStudents}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Classes */}
        {cancelledClasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-500 mb-4">Cancelled Classes ({cancelledClasses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledClasses.map((cls) => (
                <Card key={cls.id} className="border-0 shadow-sm opacity-60">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-600 line-through">{cls.subject}</h3>
                      <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 bg-red-50">Cancelled</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        {new Date(cls.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })} at {cls.time}
                      </p>
                      <p className="text-sm text-gray-400">Rs.{cls.fees?.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
