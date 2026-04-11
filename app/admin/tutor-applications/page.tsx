"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  FileText,
  GraduationCap,
  BookOpen,
  Briefcase,
  ArrowLeft,
  Loader2,
  Filter,
  ShieldCheck,
} from "lucide-react"

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | ""

export default function AdminTutorApplicationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [filter, setFilter] = useState<ApplicationStatus>("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [filter])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const res = await api.getAdminApplications(filter || undefined)
      setApplications(res.applications || [])
    } catch (err) {
      console.error("Failed to load applications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (tutorId: string) => {
    setProcessingId(tutorId)
    try {
      await api.approveApplication(tutorId)
      setApplications((prev) =>
        prev.map((a) => (a.id === tutorId ? { ...a, applicationStatus: "APPROVED" } : a))
      )
    } catch (err: any) {
      alert(err.message || "Failed to approve")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (tutorId: string) => {
    setProcessingId(tutorId)
    try {
      await api.rejectApplication(tutorId)
      setApplications((prev) =>
        prev.map((a) => (a.id === tutorId ? { ...a, applicationStatus: "REJECTED" } : a))
      )
    } catch (err: any) {
      alert(err.message || "Failed to reject")
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const pendingCount = applications.filter((a) => a.applicationStatus === "PENDING").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="TutorLink" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                TutorLink
              </span>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">Admin</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tutor Applications</h1>
              <p className="text-gray-500 text-sm">Review and manage tutor onboarding applications</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {["", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <Button
              key={status || "all"}
              onClick={() => setFilter(status as ApplicationStatus)}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              className={filter === status ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              {status || "All"}
              {status === "PENDING" && pendingCount > 0 && filter !== "PENDING" && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No applications found</h3>
              <p className="text-gray-500">
                {filter ? `No ${filter.toLowerCase()} applications` : "No tutor applications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {app.user?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "T"}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{app.user?.fullName}</h3>
                        {statusBadge(app.applicationStatus)}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{app.user?.email}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {app.qualifications && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">Qualifications</p>
                              <p className="text-sm text-gray-700">{app.qualifications}</p>
                            </div>
                          </div>
                        )}

                        {app.subjects?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">Subjects</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {app.subjects.map((s: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {app.experience && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                              <p className="text-sm text-gray-700">{app.experience}</p>
                            </div>
                          </div>
                        )}

                        {app.cvUrl && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase">CV</p>
                              <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                View CV
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Applied date */}
                      <p className="text-xs text-gray-400 mt-3">
                        Applied {new Date(app.updatedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    {app.applicationStatus === "PENDING" && (
                      <div className="flex sm:flex-col gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleApprove(app.id)}
                          disabled={processingId === app.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleReject(app.id)}
                          disabled={processingId === app.id}
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
