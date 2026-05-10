"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Plus, MapPin, CalendarDays, Clock, Users,
  Video, Building, MoreVertical, Edit, Trash2, Eye,
  BookOpen, AlertCircle, X, GraduationCap, Mail,
} from "lucide-react"

export default function TutorClassesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [tutorStatus, setTutorStatus] = useState("NOT_SUBMITTED")
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; subject: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit modal
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ subject: "", description: "", time: "", duration: "", fees: "", maxStudents: "" })
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState("")

  // Students modal
  const [studentsTarget, setStudentsTarget] = useState<any | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!authStorage.isAuthenticated()) { router.push("/login"); return }
      const userData = authStorage.getUser()
      if (!userData?.hasTutorProfile) { router.push("/dashboard"); return }
      try {
        const statusRes = await api.getTutorApplicationStatus()
        setTutorStatus(statusRes.tutorStatus)
        if (statusRes.tutorStatus === "APPROVED") {
          const classesRes = await api.getMyClasses()
          setClasses(classesRes.classes || [])
        }
      } catch { /* ignore */ }
      setIsLoading(false)
    }
    init()
  }, [router])

  // Close action menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActionMenuOpen(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.deleteClass(deleteTarget.id)
      setClasses(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err: any) {
      alert(err.message || "Failed to delete class")
    } finally {
      setIsDeleting(false)
    }
  }

  const openEdit = (cls: any) => {
    setEditTarget(cls)
    setEditForm({
      subject: cls.subject || "",
      description: cls.description || "",
      time: cls.time || "",
      duration: cls.duration || "",
      fees: cls.fees?.toString() || "",
      maxStudents: cls.maxStudents?.toString() || "",
    })
    setEditError("")
    setActionMenuOpen(null)
  }

  const handleSaveEdit = async () => {
    if (!editTarget) return
    if (!editForm.subject.trim()) { setEditError("Subject is required"); return }
    setIsSavingEdit(true)
    setEditError("")
    try {
      const res = await api.updateClass(editTarget.id, {
        subject: editForm.subject.trim(),
        description: editForm.description.trim() || undefined,
        time: editForm.time || undefined,
        duration: editForm.duration.trim() || undefined,
        fees: editForm.fees ? parseInt(editForm.fees) : undefined,
        maxStudents: editForm.maxStudents ? parseInt(editForm.maxStudents) : undefined,
      })
      setClasses(prev => prev.map(c => c.id === editTarget.id ? res.class : c))
      setEditTarget(null)
    } catch (err: any) {
      setEditError(err.message || "Failed to update class")
    } finally {
      setIsSavingEdit(false)
    }
  }

  const openStudents = (cls: any) => { setStudentsTarget(cls); setActionMenuOpen(null) }

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  const activeClasses = classes.filter(c => c.status === "ACTIVE")
  const cancelledClasses = classes.filter(c => c.status === "CANCELLED")

  const ClassCard = ({ cls }: { cls: any }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-gray-900 truncate">{cls.subject}</h3>
            {cls.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cls.description}</p>}
          </div>
          <div className="relative flex-shrink-0" ref={actionMenuOpen === cls.id ? menuRef : undefined}>
            <button
              onClick={() => setActionMenuOpen(actionMenuOpen === cls.id ? null : cls.id)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {actionMenuOpen === cls.id && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={() => openEdit(cls)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-500" /> Edit Class
                </button>
                <button
                  onClick={() => openStudents(cls)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" /> View Students
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setDeleteTarget({ id: cls.id, subject: cls.subject }); setActionMenuOpen(null) }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Class
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${cls.mode === "online" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-green-200 text-green-700 bg-green-50"}`}>
              {cls.mode === "online" ? <><Video className="w-2.5 h-2.5 mr-1 inline" />Online</> : <><Building className="w-2.5 h-2.5 mr-1 inline" />Physical</>}
            </Badge>
          </div>
          {cls.schedule?.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{cls.schedule.join(", ")}</span>
            </div>
          )}
          {cls.venue && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{cls.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{cls.time} · {cls.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
            Rs.{cls.fees?.toLocaleString()}/mo
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-3.5 h-3.5" />
            {cls.enrolledCount || 0} / {cls.maxStudents}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <TutorNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-500 mt-0.5">Manage your tutoring classes</p>
          </div>
          <Button
            onClick={() => router.push("/tutor/classes/create")}
            disabled={tutorStatus !== "APPROVED"}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />Create Class
          </Button>
        </div>

        {tutorStatus !== "APPROVED" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Approval Required</h3>
              <p className="text-sm text-amber-700 mt-0.5">You need to be an approved tutor to create and manage classes.</p>
            </div>
          </div>
        )}

        {tutorStatus === "APPROVED" && classes.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes yet</h3>
              <p className="text-gray-500 mb-4">Create your first class to start accepting students</p>
              <Button onClick={() => router.push("/tutor/classes/create")} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />Create Your First Class
              </Button>
            </CardContent>
          </Card>
        )}

        {activeClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Classes ({activeClasses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)}
            </div>
          </div>
        )}

        {cancelledClasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-500 mb-4">Cancelled Classes ({cancelledClasses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledClasses.map(cls => (
                <Card key={cls.id} className="border-0 shadow-sm opacity-60">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-600 line-through">{cls.subject}</h3>
                      <Badge variant="outline" className="text-[10px] border-red-200 text-red-600 bg-red-50">Cancelled</Badge>
                    </div>
                    <p className="text-sm text-gray-400">{cls.time} · Rs.{cls.fees?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Delete Class?</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              <span className="font-medium text-gray-700">"{deleteTarget.subject}"</span> will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Class</h3>
              <button onClick={() => setEditTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {editError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{editError}</div>}
              {[
                { label: "Subject *", field: "subject", placeholder: "e.g. Mathematics" },
                { label: "Description", field: "description", placeholder: "Brief description..." },
                { label: "Time", field: "time", placeholder: "e.g. 4:00 PM", type: "time" },
                { label: "Duration", field: "duration", placeholder: "e.g. 2 hours" },
                { label: "Monthly Fees (Rs.)", field: "fees", placeholder: "e.g. 2500", type: "number" },
                { label: "Max Students", field: "maxStudents", placeholder: "e.g. 10", type: "number" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type || "text"}
                    value={(editForm as any)[field]}
                    onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setEditTarget(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingEdit && <LoadingSpinner size="sm" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {studentsTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Students</h3>
                <p className="text-sm text-gray-500">{studentsTarget.subject}</p>
              </div>
              <button onClick={() => setStudentsTarget(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {studentsTarget.enrollments?.length > 0 ? (
                <div className="space-y-3">
                  {studentsTarget.enrollments.map((enrollment: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {enrollment.student?.user?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{enrollment.student?.user?.fullName || "Student"}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{enrollment.student?.user?.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">No students enrolled yet</p>
                  <p className="text-xs text-gray-400 mt-1">{studentsTarget.enrolledCount || 0} / {studentsTarget.maxStudents} spots filled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
