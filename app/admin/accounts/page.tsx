"use client"

import { useEffect, useState } from "react"
import { api, authStorage } from "@/lib/api"
import { Users, GraduationCap, BookOpen, Search, CheckCircle, Loader2, Mail, Calendar, Ban, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AccountsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "students" | "tutors" | "banned">("all")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
        if (token) {
          const res = await api.getAllUsers()
          setUsers(res.users)
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleBan = async (userId: string) => {
    setProcessingId(userId)
    try {
      await api.banUser(userId)
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: true } : u))
    } catch (err: any) {
      alert(err.message || "Failed to ban user")
    } finally {
      setProcessingId(null)
    }
  }

  const handleUnban = async (userId: string) => {
    setProcessingId(userId)
    try {
      await api.unbanUser(userId)
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBanned: false } : u))
    } catch (err: any) {
      alert(err.message || "Failed to unban user")
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    if (filter === "students") return matchesSearch && u.hasStudentProfile
    if (filter === "tutors") return matchesSearch && u.hasTutorProfile
    if (filter === "banned") return matchesSearch && u.isBanned
    return matchesSearch
  })

  const totalStudents = users.filter((u) => u.hasStudentProfile).length
  const totalTutors = users.filter((u) => u.hasTutorProfile).length
  const totalBanned = users.filter((u) => u.isBanned).length

  const getInitials = (name: string) =>
    name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-500 text-sm">Manage all user accounts on the platform</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "blue" },
          { label: "Students", value: totalStudents, icon: GraduationCap, color: "indigo" },
          { label: "Tutors", value: totalTutors, icon: BookOpen, color: "green" },
          { label: "Banned", value: totalBanned, icon: Ban, color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? "—" : value}</p>
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
            {(["all", "students", "tutors", "banned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filter === f
                    ? f === "banned" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {f}
                {f === "banned" && totalBanned > 0 && filter !== "banned" && (
                  <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded-full">{totalBanned}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No accounts found</p>
            <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search term" : "No users registered yet"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  user.isBanned ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-gray-50/60"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      user.isBanned ? "bg-gray-400" : "bg-gradient-to-br from-indigo-400 to-purple-500"
                    }`}>
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  {user.isBanned && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <Ban className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${user.isBanned ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {user.fullName}
                    </span>
                    {user.isBanned && <Badge className="bg-red-100 text-red-600 border-red-200 text-[10px]"><Ban className="w-2.5 h-2.5 mr-1" />Banned</Badge>}
                    {!user.isBanned && user.isEmailVerified && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Roles */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  {user.hasStudentProfile && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                      <GraduationCap className="w-2.5 h-2.5 mr-1" />Student
                    </Badge>
                  )}
                  {user.hasTutorProfile && user.tutorStatus === "APPROVED" && (
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                      <BookOpen className="w-2.5 h-2.5 mr-1" />Tutor
                    </Badge>
                  )}
                  {user.hasTutorProfile && user.tutorStatus === "PENDING" && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                      <BookOpen className="w-2.5 h-2.5 mr-1" />Tutor Pending
                    </Badge>
                  )}
                  {user.hasTutorProfile && user.tutorStatus === "REJECTED" && (
                    <Badge className="bg-red-50 text-red-600 border-red-200 text-[10px]">
                      <BookOpen className="w-2.5 h-2.5 mr-1" />Tutor Rejected
                    </Badge>
                  )}
                  {user.hasTutorProfile && user.tutorStatus === "NOT_SUBMITTED" && (
                    <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-[10px]">
                      <BookOpen className="w-2.5 h-2.5 mr-1" />Tutor
                    </Badge>
                  )}
                </div>

                {/* Joined */}
                <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* Ban / Unban */}
                <div className="flex-shrink-0">
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnban(user.id)}
                      disabled={processingId === user.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBan(user.id)}
                      disabled={processingId === user.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                      Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {users.length} accounts
          </div>
        )}
      </div>
    </div>
  )
}
