"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle, XCircle, Clock, Mail, FileText, GraduationCap,
  BookOpen, Briefcase, Loader2, Search, ShieldCheck, CreditCard, ImageIcon, X,
  Calendar, Phone, MapPin, User,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | ""

export default function TutorApprovalsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<any[]>([])
  const [filter, setFilter] = useState<ApplicationStatus>("")
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isDetailed, setIsDetailed] = useState(false)

  useEffect(() => { loadApplications() }, [filter])

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
      setApplications((prev) => prev.map((a) => a.id === tutorId ? { ...a, applicationStatus: "APPROVED" } : a))
      setSelectedApp(null)
    } catch (err: any) { alert(err.message || "Failed to approve") }
    finally { setProcessingId(null) }
  }

  const handleReject = async (tutorId: string) => {
    setProcessingId(tutorId)
    try {
      await api.rejectApplication(tutorId)
      setApplications((prev) => prev.map((a) => a.id === tutorId ? { ...a, applicationStatus: "REJECTED" } : a))
      setSelectedApp(null)
    } catch (err: any) { alert(err.message || "Failed to reject") }
    finally { setProcessingId(null) }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "APPROVED": return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case "REJECTED": return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case "NOT_SUBMITTED": return <Badge className="bg-gray-100 text-gray-600 border-gray-200"><Clock className="w-3 h-3 mr-1" />Not Submitted</Badge>
      default: return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const getInitials = (name: string) =>
    name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "T"

  const pendingCount = applications.filter((a) => a.applicationStatus === "PENDING").length
  const approvedCount = applications.filter((a) => a.applicationStatus === "APPROVED").length
  const rejectedCount = applications.filter((a) => a.applicationStatus === "REJECTED").length

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tutor Approvals</h1>
            <p className="text-gray-500 text-sm">Review and manage tutor onboarding applications</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applications", value: applications.length, icon: BookOpen, color: "blue" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "amber" },
          { label: "Approved", value: approvedCount, icon: CheckCircle, color: "green" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "PENDING", "APPROVED", "REJECTED"] as (ApplicationStatus | "all")[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f === "all" ? "" : (f as ApplicationStatus))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  (filter === "" && f === "all") || (filter === f)
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {f}
                {f === "PENDING" && pendingCount > 0 && filter !== "PENDING" && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[9px] px-1 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="hidden md:flex gap-2">
                  <Skeleton className="h-5 w-28 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
                <Skeleton className="hidden lg:block h-3 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <GraduationCap className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search term" : "No tutor applications yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => { setSelectedApp(app); setIsDetailed(true) }}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50/60 cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {(app.avatar || app.user?.student?.avatar) ? (
                    <img src={app.avatar || app.user?.student?.avatar} alt={app.user?.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-indigo-400 to-purple-500">
                      {getInitials(app.user?.fullName)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {app.user?.fullName}
                    </span>
                    {statusBadge(app.applicationStatus)}
                    {app.user?.student && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]"><GraduationCap className="w-2.5 h-2.5 mr-1" />Student</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{app.user?.email}</span>
                  </div>
                </div>

                {/* Details Summary */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0 text-xs text-gray-600">
                  {app.qualifications && <span className="px-2 py-1 bg-gray-50 rounded">Has qualifications</span>}
                  {app.subjects?.length > 0 && <span className="px-2 py-1 bg-gray-50 rounded">{app.subjects.length} subjects</span>}
                </div>

                {/* Date */}
                <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(app.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {applications.length} applications
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && isDetailed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {(selectedApp.avatar || selectedApp.user?.student?.avatar) ? (
                    <img src={selectedApp.avatar || selectedApp.user?.student?.avatar} alt={selectedApp.user?.fullName} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-indigo-400 to-purple-500">
                      {getInitials(selectedApp.user?.fullName)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedApp.user?.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {statusBadge(selectedApp.applicationStatus)}
                    {selectedApp.user?.student && <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]"><GraduationCap className="w-2.5 h-2.5 mr-1" />Student</Badge>}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsDetailed(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Personal Information */}
              <section>
                <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2 text-indigo-600">
                  <User className="w-4 h-4" />Personal Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Full Name</label>
                    <p className="text-sm text-gray-900">{selectedApp.user?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Email</label>
                    <p className="text-sm text-gray-900">{selectedApp.user?.email}</p>
                  </div>
                  {selectedApp.phone && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Phone</label>
                      <p className="text-sm text-gray-900">{selectedApp.phone}</p>
                    </div>
                  )}
                  {selectedApp.dob && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Date of Birth</label>
                      <p className="text-sm text-gray-900">{selectedApp.dob}</p>
                    </div>
                  )}
                  {selectedApp.address && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 font-medium">Address</label>
                      <p className="text-sm text-gray-900">{selectedApp.address}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Member Since</label>
                    <p className="text-sm text-gray-900">{new Date(selectedApp.user?.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              </section>

              {/* Tutor Application Details */}
              <section>
                <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2 text-indigo-600">
                  <BookOpen className="w-4 h-4" />Tutor Application Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {selectedApp.qualifications && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><GraduationCap className="w-3 h-3" />Qualifications</label>
                      <p className="text-sm text-gray-800 mt-1">{selectedApp.qualifications}</p>
                    </div>
                  )}
                  {selectedApp.subjects?.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Subjects ({selectedApp.subjects.length})</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApp.subjects.map((subject: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedApp.experience && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><Briefcase className="w-3 h-3" />Experience</label>
                      <p className="text-sm text-gray-800 mt-1">{selectedApp.experience}</p>
                    </div>
                  )}
                  {selectedApp.idNumber && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><CreditCard className="w-3 h-3" />ID / NIC Number</label>
                      <p className="text-sm text-gray-800 mt-1 font-mono">{selectedApp.idNumber}</p>
                    </div>
                  )}
                  {selectedApp.cvUrl && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium flex items-center gap-1"><FileText className="w-3 h-3" />CV / Resume</label>
                      <a href={selectedApp.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1">
                        View CV →
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* ID Documents */}
              {(selectedApp.idCopyFront || selectedApp.idCopyBack || selectedApp.idCopyPdf) ? (
                <section>
                  <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2 text-indigo-600">
                    <ImageIcon className="w-4 h-4" />ID Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedApp.idCopyFront && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Front Side</p>
                        <a href={selectedApp.idCopyFront} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors">
                          <img src={selectedApp.idCopyFront} alt="ID Front" className="w-full h-32 object-cover hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    )}
                    {selectedApp.idCopyBack && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Back Side</p>
                        <a href={selectedApp.idCopyBack} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors">
                          <img src={selectedApp.idCopyBack} alt="ID Back" className="w-full h-32 object-cover hover:opacity-80 transition-opacity" />
                        </a>
                      </div>
                    )}
                    {selectedApp.idCopyPdf && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">PDF Copy</p>
                        <a href={selectedApp.idCopyPdf} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors text-xs text-indigo-600 font-medium h-32">
                          <FileText className="w-4 h-4" />View PDF
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <section>
                  <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2 text-indigo-600">
                    <ImageIcon className="w-4 h-4" />ID Documents
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
                    No ID documents uploaded.
                  </div>
                </section>
              )}

              {/* Student Profile */}
              <section>
                <h3 className="text-sm font-semibold uppercase mb-3 flex items-center gap-2 text-indigo-600">
                  <GraduationCap className="w-4 h-4" />Student Profile
                </h3>
                {selectedApp.user?.student ? (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 grid grid-cols-2 gap-4">
                    {selectedApp.user.student.schoolGrade && (
                      <div>
                        <label className="text-xs text-gray-500 font-medium">School Grade</label>
                        <p className="text-sm text-gray-900 font-medium mt-0.5">{selectedApp.user.student.schoolGrade}</p>
                      </div>
                    )}
                    {selectedApp.user.student.schoolName && (
                      <div>
                        <label className="text-xs text-gray-500 font-medium">School Name</label>
                        <p className="text-sm text-gray-900 font-medium mt-0.5">{selectedApp.user.student.schoolName}</p>
                      </div>
                    )}
                    {selectedApp.user.student.parentName && (
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Parent Name</label>
                        <p className="text-sm text-gray-900 font-medium mt-0.5">{selectedApp.user.student.parentName}</p>
                      </div>
                    )}
                    {selectedApp.user.student.parentPhone && (
                      <div>
                        <label className="text-xs text-gray-500 font-medium">Parent Phone</label>
                        <p className="text-sm text-gray-900 font-medium mt-0.5">{selectedApp.user.student.parentPhone}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-sm text-gray-500">
                    No student profile registered.
                  </div>
                )}
              </section>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 p-6">
              {selectedApp.applicationStatus === "PENDING" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    disabled={processingId === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedApp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedApp.id)}
                    disabled={processingId === selectedApp.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedApp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-600 bg-gray-50 -m-6 p-6">
                  Application <span className="font-semibold">{selectedApp.applicationStatus === "NOT_SUBMITTED" ? "not submitted" : selectedApp.applicationStatus.toLowerCase()}</span> on{" "}
                  {new Date(selectedApp.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
