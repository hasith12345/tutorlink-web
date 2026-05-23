"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
  BookOpen, Search, Loader2, Trash2, Monitor, Building,
  Users, CalendarDays, Clock, AlertTriangle, Pause, Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type AdminClass = Awaited<ReturnType<typeof api.getAdminClasses>>["classes"][number]

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<AdminClass[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "on hold" | "cancelled">("all")
  const [deleteTarget, setDeleteTarget] = useState<AdminClass | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null
        if (!token) return
        const res = await api.getAdminClasses()
        setClasses(res.classes)
      } catch (err) {
        console.error("Failed to fetch classes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handleForceDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await api.forceDeleteClassAdmin(deleteTarget.id)
      setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete class")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleHold = async (cls: AdminClass) => {
    setTogglingId(cls.id)
    try {
      if (cls.status === "ON_HOLD") {
        await api.unholdClassAdmin(cls.id)
        setClasses((prev) => prev.map((c) => c.id === cls.id ? { ...c, status: "ACTIVE" } : c))
      } else {
        await api.holdClassAdmin(cls.id)
        setClasses((prev) => prev.map((c) => c.id === cls.id ? { ...c, status: "ON_HOLD" } : c))
      }
    } catch (err: any) {
      alert(err.message || "Failed to update class status")
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase().trim()
    const matchesSearch = !q ||
      c.subject.toLowerCase().includes(q) ||
      c.tutorName.toLowerCase().includes(q) ||
      c.tutorEmail.toLowerCase().includes(q)
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && c.status === "ACTIVE") ||
      (filter === "on hold" && c.status === "ON_HOLD") ||
      (filter === "cancelled" && c.status === "CANCELLED")
    return matchesSearch && matchesFilter
  })

  const totalActive = classes.filter((c) => c.status === "ACTIVE").length
  const totalOnHold = classes.filter((c) => c.status === "ON_HOLD").length
  const totalEnrollments = classes.reduce((sum, c) => sum + c.totalEnrollments, 0)

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
            <p className="text-gray-500 text-sm">Manage all classes on the platform</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Classes", value: classes.length, icon: BookOpen, color: "indigo" },
          { label: "Active", value: totalActive, icon: BookOpen, color: "green" },
          { label: "On Hold", value: totalOnHold, icon: Pause, color: "amber" },
          { label: "Total Enrollments", value: totalEnrollments, icon: Users, color: "blue" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            {loading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
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
              placeholder="Search by tutor name or subject..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "on hold", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="hidden md:flex gap-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-14 rounded-lg" />
                  <Skeleton className="h-7 w-14 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No classes found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "No classes created yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((cls) => {
              const ModeIcon = cls.mode === "physical" ? Building : Monitor
              return (
                <div
                  key={cls.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50/60 ${
                    cls.status === "CANCELLED" ? "opacity-60" : ""
                  }`}
                >
                  {/* Tutor avatar + class info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {cls.tutorAvatar ? (
                      <img src={cls.tutorAvatar} alt={cls.tutorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0">
                        {getInitials(cls.tutorName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900 truncate">{cls.subject}</span>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                          <ModeIcon className="w-2.5 h-2.5 mr-1" />
                          {cls.mode}
                        </Badge>
                        {cls.status === "ACTIVE" && (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">Active</Badge>
                        )}
                        {cls.status === "ON_HOLD" && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                            <Pause className="w-2.5 h-2.5 mr-1" />On Hold
                          </Badge>
                        )}
                        {cls.status === "CANCELLED" && (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">Cancelled</Badge>
                        )}
                        {cls.status === "COMPLETED" && (
                          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px]">Completed</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">by {cls.tutorName}</p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {cls.schedule?.join(", ") || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cls.time}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        {cls.totalEnrollments}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {cls.paidEnrollments} paid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        Rs.{cls.fees.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400">monthly</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cls.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleToggleHold(cls)}
                        disabled={togglingId === cls.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors disabled:opacity-50 ${
                          cls.status === "ON_HOLD"
                            ? "text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                            : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                        }`}
                      >
                        {togglingId === cls.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : cls.status === "ON_HOLD" ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Pause className="w-3 h-3" />
                        )}
                        {cls.status === "ON_HOLD" ? "Unhold" : "Hold"}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(cls)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {classes.length} classes
          </div>
        )}
      </div>

      {/* Force Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Force delete class?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This will permanently delete <strong>{deleteTarget.subject}</strong> by {deleteTarget.tutorName} along with all enrollments, payments, materials, and conversations linked to it.
                  </p>
                </div>
              </div>

              {deleteTarget.totalEnrollments > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      This class has <strong>{deleteTarget.totalEnrollments} enrollment{deleteTarget.totalEnrollments !== 1 ? "s" : ""}</strong>
                      {deleteTarget.paidEnrollments > 0 && (
                        <> including <strong>{deleteTarget.paidEnrollments} paid</strong></>
                      )}. This action cannot be undone.
                    </span>
                  </div>
                </div>
              )}

              {deleteError && (
                <p className="text-sm text-red-600 mb-3">{deleteError}</p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setDeleteTarget(null); setDeleteError("") }}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForceDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Force Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
