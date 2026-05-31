"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TutorNavbar } from "@/components/tutor-navbar"
import {
  ArrowLeft, User, Mail, Calendar, Edit2, GraduationCap, BookOpen,
  Loader2, X, Camera, Phone, MapPin, CreditCard, School, Users,
  Award, BookMarked, Briefcase, Cake,
} from "lucide-react"
import { api, authStorage, UserProfile, UpdateProfileData } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { SubjectSelector } from "@/components/subject-selector"

type EditSection = "personal" | "student" | "tutor" | null

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingTutorAvatar, setUploadingTutorAvatar] = useState(false)
  const [tutorApplicationData, setTutorApplicationData] = useState<{
    applicationStatus: string
    qualifications: string | null
    subjects: string[]
    experience: string | null
  } | null>(null)

  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [editSection, setEditSection] = useState<EditSection>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    student: { dob: "", phone: "", address: "", schoolGrade: "", schoolName: "", parentName: "", parentPhone: "" },
    tutor: { dob: "", phone: "", address: "", idNumber: "", qualifications: [] as string[], subjects: [] as string[], experience: [] as string[] },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!authStorage.isAuthenticated()) { router.push("/login"); return }
        const [data, appStatus] = await Promise.allSettled([api.getProfile(), api.getTutorApplicationStatus()])
        if (data.status === "rejected") throw data.reason
        const profileData = data.value
        if (appStatus.status === "fulfilled") {
          setTutorApplicationData({
            applicationStatus: appStatus.value.profile.applicationStatus,
            qualifications: appStatus.value.profile.qualifications,
            subjects: appStatus.value.profile.subjects,
            experience: appStatus.value.profile.experience,
          })
        }
        setProfile(profileData)
        setActiveRole(authStorage.getActiveRole())
        syncFormData(profileData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
        if (err instanceof Error && err.message.includes("Unauthorized")) { authStorage.clear(); router.push("/login") }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  const syncFormData = (p: UserProfile) => {
    setFormData({
      fullName: p.fullName,
      student: {
        dob: p.student?.dob || "", phone: p.student?.phone || "", address: p.student?.address || "",
        schoolGrade: p.student?.schoolGrade || "", schoolName: p.student?.schoolName || "",
        parentName: p.student?.parentName || "", parentPhone: p.student?.parentPhone || "",
      },
      tutor: { dob: p.tutor?.dob || "", phone: p.tutor?.phone || "", address: p.tutor?.address || "", idNumber: p.tutor?.idNumber || "", qualifications: tutorApplicationData?.qualifications ? tutorApplicationData.qualifications.split(" | ").filter(Boolean) : [], subjects: tutorApplicationData?.subjects || [], experience: tutorApplicationData?.experience ? tutorApplicationData.experience.split(" | ").filter(Boolean) : [] },
    })
  }

  const openEdit = (section: EditSection) => { setSaveError(null); setEditSection(section) }
  const closeEdit = () => { setEditSection(null); setSaveError(null); if (profile) syncFormData(profile) }

  const getInitials = (name: string) => name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    setUploadingAvatar(true)
    try {
      const result = await api.uploadStudentAvatar(file)
      setProfile(prev => prev ? { ...prev, student: prev.student ? { ...prev.student, avatar: result.imageUrl } : prev.student } : prev)
      const u = authStorage.getUser()
      if (u) authStorage.setUser({ ...u, avatar: result.imageUrl })
      window.dispatchEvent(new Event("userDataUpdated"))
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to upload") }
    finally { setUploadingAvatar(false) }
  }

  const handleTutorAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    setUploadingTutorAvatar(true)
    try {
      const result = await api.uploadTutorAvatar(file)
      setProfile(prev => prev ? { ...prev, tutor: prev.tutor ? { ...prev.tutor, avatar: result.imageUrl } : prev.tutor } : prev)
      const u = authStorage.getUser()
      if (u) authStorage.setUser({ ...u, avatar: result.imageUrl })
      window.dispatchEvent(new Event("userDataUpdated"))
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to upload") }
    finally { setUploadingTutorAvatar(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const updateData: UpdateProfileData = { fullName: formData.fullName }
      if (editSection === "personal" || editSection === "student") {
        if (profile?.hasStudentProfile) updateData.student = { ...formData.student }
      }
      if (editSection === "personal") {
        if (profile?.hasTutorProfile) updateData.tutor = { dob: formData.tutor.dob, phone: formData.tutor.phone, address: formData.tutor.address, idNumber: formData.tutor.idNumber }
      }
      if (editSection === "tutor") {
        const qualsStr = formData.tutor.qualifications.join(" | ")
        const expStr = formData.tutor.experience.join(" | ")
        if (profile?.hasTutorProfile) updateData.tutor = { qualifications: qualsStr, subjects: formData.tutor.subjects, experience: expStr }
      }
      const result = await api.updateProfile(updateData)
      setProfile(result.profile)
      if (editSection === "tutor") {
        setTutorApplicationData(prev => prev ? { ...prev, qualifications: formData.tutor.qualifications.join(" | "), subjects: formData.tutor.subjects, experience: formData.tutor.experience.join(" | ") } : prev)
      }
      setEditSection(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const TagInput = ({ label, items, onAdd, onRemove, placeholder, tagColor, inputId }: {
    label: string; items: string[]; onAdd: (val: string) => void; onRemove: (i: number) => void
    placeholder: string; tagColor: "green" | "indigo" | "blue"; inputId: string
  }) => {
    const colors = {
      green: "bg-green-50 text-green-700",
      indigo: "bg-indigo-50 text-indigo-700",
      blue: "bg-blue-50 text-blue-700",
    }
    const addItem = () => {
      const input = document.getElementById(inputId) as HTMLInputElement
      const val = input?.value.trim()
      if (val && !items.includes(val)) { onAdd(val); input.value = "" }
    }
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {items.map((item, i) => (
              <span key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[tagColor]}`}>
                {item}
                <button type="button" onClick={() => onRemove(i)} className="hover:text-red-500 ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            placeholder={placeholder}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem() } }}
          />
          <button type="button" onClick={addItem} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            Add
          </button>
        </div>
      </div>
    )
  }

  const EditBtn = ({ section }: { section: EditSection }) => (
    <button
      onClick={() => openEdit(section)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
    >
      <Edit2 className="w-3 h-3" />Edit
    </button>
  )

  const Field = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start space-x-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  )

  const NavComponent = activeRole === 'tutor' ? TutorNavbar : Navbar

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-4 w-16 bg-gray-200 mb-6" />

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-44 bg-gray-200" />
              <Skeleton className="h-4 w-36 bg-gray-200" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Personal info card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-5 w-44 bg-gray-200" />
            <Skeleton className="h-7 w-16 rounded-lg bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[0,1,2,3].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded bg-gray-200 mt-0.5 flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 bg-gray-200" />
                  <Skeleton className="h-4 w-28 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student/tutor section card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-5 w-36 bg-gray-200" />
            <Skeleton className="h-7 w-16 rounded-lg bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[0,1].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded bg-gray-200 mt-0.5 flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )

  if (error || !profile) return (
    <div className="min-h-screen bg-gray-50"><NavComponent />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <p className="text-red-600 mb-4">{error || "Failed to load profile"}</p>
        <button onClick={() => router.push("/")} className="text-indigo-600 hover:text-indigo-700">Go back home</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavComponent />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />Back
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center gap-5">
            <div className="relative group flex-shrink-0">
              {(profile.student?.avatar || profile.tutor?.avatar) ? (
                <img src={profile.student?.avatar || profile.tutor?.avatar || ""} alt={profile.fullName} className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
                  {getInitials(profile.fullName)}
                </div>
              )}
              {(profile.hasStudentProfile || profile.hasTutorProfile) && (
                <label className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer transition-opacity ${(uploadingAvatar || uploadingTutorAvatar) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  {(uploadingAvatar || uploadingTutorAvatar) ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={profile.hasStudentProfile ? handleAvatarUpload : handleTutorAvatarUpload} disabled={uploadingAvatar || uploadingTutorAvatar} />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{profile.fullName}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {profile.hasStudentProfile && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <GraduationCap className="w-3 h-3 mr-1" />Student
                  </span>
                )}
                {profile.hasTutorProfile && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <BookOpen className="w-3 h-3 mr-1" />Tutor
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-slate-800">Personal Information</h2>
            </div>
            <EditBtn section="personal" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field icon={User} label="Full Name" value={profile.fullName} />
            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-800 font-medium">{profile.email}</p>
                {profile.isEmailVerified && <span className="text-xs text-green-600 font-medium">✓ Verified</span>}
              </div>
            </div>
            <Field icon={Calendar} label="Member Since" value={formatDate(profile.createdAt)} />
            {(profile.student?.dob || profile.tutor?.dob) && (
              <Field icon={Cake} label="Date of Birth" value={profile.student?.dob || profile.tutor?.dob || ""} />
            )}
            {(profile.student?.phone || profile.tutor?.phone) && (
              <Field icon={Phone} label="Phone Number" value={profile.student?.phone || profile.tutor?.phone || ""} />
            )}
            {profile.tutor?.idNumber && (
              <Field icon={CreditCard} label="ID Number" value={profile.tutor.idNumber} />
            )}
            {(profile.student?.address || profile.tutor?.address) && (
              <div className="sm:col-span-2">
                <Field icon={MapPin} label="Address" value={profile.student?.address || profile.tutor?.address || ""} />
              </div>
            )}
          </div>
        </div>

        {/* Student Profile — only when active role is student */}
        {profile.student && activeRole !== 'tutor' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Student Profile</h2>
              </div>
              <EditBtn section="student" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {profile.student.schoolGrade && <Field icon={GraduationCap} label="School Grade" value={profile.student.schoolGrade} />}
              {profile.student.schoolName && <Field icon={School} label="School Name" value={profile.student.schoolName} />}
              {profile.student.parentName && <Field icon={Users} label="Parent Name" value={profile.student.parentName} />}
              {profile.student.parentPhone && <Field icon={Phone} label="Parent Phone" value={profile.student.parentPhone} />}
            </div>
          </div>
        )}

        {/* Tutor Profile — only when active role is tutor */}
        {profile.tutor && activeRole === 'tutor' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h2 className="text-base font-bold text-slate-800">Tutor Profile</h2>
              </div>
              {tutorApplicationData?.applicationStatus === "APPROVED" && <EditBtn section="tutor" />}
            </div>
            {tutorApplicationData?.applicationStatus === "APPROVED" ? (
              <div className="space-y-5">
                {tutorApplicationData.qualifications && (
                  <div className="flex items-start space-x-3">
                    <Award className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Qualifications</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {tutorApplicationData.qualifications.split(" | ").map((q, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">{q}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {tutorApplicationData.subjects?.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <BookMarked className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Subjects</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {tutorApplicationData.subjects.map((s, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {tutorApplicationData.experience && (
                  <div className="flex items-start space-x-3">
                    <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Experience</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {tutorApplicationData.experience.split(" | ").map((e, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Loader2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pending Admin Approval</p>
                  <p className="text-xs text-amber-600 mt-0.5">Qualifications, Subjects, and Experience will be visible once approved.</p>
                  <button onClick={() => router.push("/tutor-application-status")} className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-800 underline">
                    View Application Status →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                Edit {editSection === "personal" ? "Personal Information" : editSection === "student" ? "Student Profile" : "Tutor Profile"}
              </h3>
              <button onClick={closeEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {saveError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{saveError}</div>}

              {/* Personal section fields */}
              {editSection === "personal" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                    <input type="date" value={formData.student.dob || formData.tutor.dob}
                      onChange={e => { const v = e.target.value; setFormData(p => ({ ...p, student: { ...p.student, dob: v }, tutor: { ...p.tutor, dob: v } })) }}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                    <input type="tel" value={formData.student.phone || formData.tutor.phone}
                      onChange={e => { const v = e.target.value; setFormData(p => ({ ...p, student: { ...p.student, phone: v }, tutor: { ...p.tutor, phone: v } })) }}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="0771234567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                    <textarea value={formData.student.address || formData.tutor.address}
                      onChange={e => { const v = e.target.value; setFormData(p => ({ ...p, student: { ...p.student, address: v }, tutor: { ...p.tutor, address: v } })) }}
                      rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" placeholder="Your address" />
                  </div>
                  {profile?.hasTutorProfile && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Number (NIC)</label>
                      <input type="text" value={formData.tutor.idNumber}
                        onChange={e => setFormData(p => ({ ...p, tutor: { ...p.tutor, idNumber: e.target.value } }))}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="123456789V" />
                    </div>
                  )}
                </>
              )}

              {/* Student section fields */}
              {editSection === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">School Grade</label>
                    <input type="text" value={formData.student.schoolGrade}
                      onChange={e => setFormData(p => ({ ...p, student: { ...p.student, schoolGrade: e.target.value } }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. Grade 10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">School Name</label>
                    <input type="text" value={formData.student.schoolName}
                      onChange={e => setFormData(p => ({ ...p, student: { ...p.student, schoolName: e.target.value } }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="School name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Name</label>
                    <input type="text" value={formData.student.parentName}
                      onChange={e => setFormData(p => ({ ...p, student: { ...p.student, parentName: e.target.value } }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Parent / Guardian name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Phone</label>
                    <input type="tel" value={formData.student.parentPhone}
                      onChange={e => setFormData(p => ({ ...p, student: { ...p.student, parentPhone: e.target.value } }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="0771234567" />
                  </div>
                </>
              )}

              {/* Tutor section fields */}
              {editSection === "tutor" && (
                <>
                  <TagInput
                    label="Qualifications"
                    items={formData.tutor.qualifications}
                    onAdd={val => setFormData(p => ({ ...p, tutor: { ...p.tutor, qualifications: [...p.tutor.qualifications, val] } }))}
                    onRemove={i => setFormData(p => ({ ...p, tutor: { ...p.tutor, qualifications: p.tutor.qualifications.filter((_, idx) => idx !== i) } }))}
                    placeholder="e.g. BSc Mathematics"
                    tagColor="green"
                    inputId="qualInput"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subjects</label>
                    <SubjectSelector
                      values={formData.tutor.subjects}
                      onChange={vals => setFormData(p => ({ ...p, tutor: { ...p.tutor, subjects: vals } }))}
                    />
                  </div>
                  <TagInput
                    label="Experience"
                    items={formData.tutor.experience}
                    onAdd={val => setFormData(p => ({ ...p, tutor: { ...p.tutor, experience: [...p.tutor.experience, val] } }))}
                    onRemove={i => setFormData(p => ({ ...p, tutor: { ...p.tutor, experience: p.tutor.experience.filter((_, idx) => idx !== i) } }))}
                    placeholder="e.g. 2 years teaching at Royal College"
                    tagColor="blue"
                    inputId="expInput"
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 flex-shrink-0">
              <button onClick={closeEdit} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm">Cancel</button>
              {(
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
