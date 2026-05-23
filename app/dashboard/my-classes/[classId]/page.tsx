"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, ClassFolder, ClassMaterial, Review } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Video, Monitor, Building, CalendarDays, Clock,
  MapPin, FolderOpen, Folder, FileText, Image, VideoIcon,
  Download, ChevronDown, ChevronRight, BookOpen, Link as LinkIcon,
  Star, Trash2, Loader2, MessageCircle,
} from "lucide-react"

function formatBytes(bytes?: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function MaterialIcon({ resourceType }: { resourceType: string }) {
  if (resourceType === "image") return <Image className="w-4 h-4 text-blue-500 flex-shrink-0" />
  if (resourceType === "video") return <VideoIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
  return <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
}

export default function ClassDetailPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string

  const [enrollment, setEnrollment] = useState<any>(null)
  const [folders, setFolders] = useState<ClassFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"details" | "materials">("details")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // Rating state
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [deletingReview, setDeletingReview] = useState(false)

  // Unenroll state
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [unenrollError, setUnenrollError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const enrollmentsRes = await api.getStudentEnrollments()
        const found = enrollmentsRes.enrollments.find(e => e.class.id === classId)
        if (!found) { setError("Class not found"); return }
        setEnrollment(found)

        // Only fetch folders if access isn't blocked — saves a 403 round trip
        if (!found.accessBlocked) {
          try {
            const foldersRes = await api.getClassFolders(classId)
            setFolders(foldersRes.folders)
            setExpandedFolders(new Set(foldersRes.folders.filter(f => f.materials.length > 0).map(f => f.id)))
          } catch {
            setFolders([])
          }
        } else {
          setFolders([])
        }

        // Check if already reviewed (best-effort)
        try {
          const reviewRes = await api.getMyReview(found.enrollmentId)
          if (reviewRes.review) {
            setExistingReview(reviewRes.review)
            setSelectedRating(reviewRes.review.rating)
            setReviewComment(reviewRes.review.comment || "")
          }
        } catch {}
      } catch (e: any) {
        setError(e.message || "Failed to load class")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [classId])

  async function handleSubmitReview() {
    if (!selectedRating) { setReviewError("Please select a star rating"); return }
    setSubmittingReview(true)
    setReviewError("")
    try {
      const res = await api.submitReview({
        enrollmentId: enrollment.enrollmentId,
        rating: selectedRating,
        comment: reviewComment.trim() || undefined,
      })
      setExistingReview(res.review)
    } catch (e: any) {
      setReviewError(e.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleUnenroll() {
    if (!enrollment) return
    setUnenrolling(true)
    setUnenrollError("")
    try {
      const res = await api.unenrollFromClass(enrollment.enrollmentId)
      setEnrollment({
        ...enrollment,
        status: res.enrollment.status,
        unenrolledAt: res.enrollment.unenrolledAt,
        accessUntil: res.enrollment.accessUntil,
      })
      setShowUnenrollConfirm(false)
    } catch (e: any) {
      setUnenrollError(e.message || "Failed to unenroll")
    } finally {
      setUnenrolling(false)
    }
  }

  async function handleDeleteReview() {
    if (!existingReview) return
    setDeletingReview(true)
    try {
      await api.deleteReview(existingReview.id)
      setExistingReview(null)
      setSelectedRating(0)
      setReviewComment("")
    } catch (e: any) {
      setReviewError(e.message)
    } finally {
      setDeletingReview(false)
    }
  }

  function toggleFolder(id: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
    </div>
  )

  if (error || !enrollment) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500">{error || "Class not found"}</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">Go back</button>
      </div>
    </div>
  )

  const cls = enrollment.class
  const ModeIcon = cls.mode === "physical" ? Building : Monitor
  const totalMaterials = folders.reduce((sum, f) => sum + f.materials.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Class Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{cls.subject}</h1>
                  <Badge variant="outline" className="text-xs bg-white border-indigo-200 text-indigo-700">
                    <ModeIcon className="w-3 h-3 mr-1" />
                    {cls.mode?.charAt(0).toUpperCase() + cls.mode?.slice(1)}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
                </div>
                {cls.description && <p className="text-sm text-gray-500 mb-3">{cls.description}</p>}

                {/* Tutor */}
                <button
                  onClick={() => router.push(`/tutor/${cls.tutorId}`)}
                  className="flex items-center gap-2 mb-4 group"
                >
                  {cls.tutorAvatar ? (
                    <img src={cls.tutorAvatar} alt={cls.tutorName} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {cls.tutorName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-indigo-600 group-hover:underline">{cls.tutorName}</span>
                </button>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {cls.schedule?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-indigo-400" />
                      <span>{cls.schedule.join(", ")}</span>
                    </div>
                  )}
                  {cls.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{cls.time} · {cls.duration}</span>
                    </div>
                  )}
                  {cls.venue && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span>{cls.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">Monthly</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Rs.{cls.fees?.toLocaleString()}
                </p>
                {enrollment.payment && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Paid Rs.{enrollment.payment.totalAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              {cls.meetingLink && !enrollment.accessBlocked && (
                <a
                  href={cls.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-200"
                >
                  <Video className="w-4 h-4" /> Join Class
                </a>
              )}
              {cls.meetingLink && enrollment.accessBlocked && (
                <button
                  disabled
                  title="Renew payment to regain access"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-not-allowed"
                >
                  <Video className="w-4 h-4" /> Join Class
                </button>
              )}
              <button
                onClick={() => router.push(`/dashboard/messages?tutorId=${cls.tutorId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 text-sm font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Message Tutor
              </button>
              {enrollment.status === "ACTIVE" && (
                <button
                  onClick={() => setShowUnenrollConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Unenroll
                </button>
              )}
            </div>

            {/* Pending payment banner — grace period (access still works) */}
            {enrollment.isPaymentDue && !enrollment.accessBlocked && enrollment.status === "ACTIVE" && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-semibold text-amber-900">Monthly payment due</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Renew before <strong>{enrollment.accessExpiresAt && new Date(enrollment.accessExpiresAt).toLocaleDateString("en-US", { day: "numeric", month: "long" })}</strong> to keep access. After that, materials and meeting link will be blocked until you pay.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/payment/${cls.tutorId}?classId=${cls.id}`)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  Pay Now
                </button>
              </div>
            )}

            {/* Access blocked banner — overdue past grace period */}
            {enrollment.accessBlocked && enrollment.status === "ACTIVE" && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-semibold text-red-900">Access blocked — payment overdue</p>
                  <p className="text-red-700 text-xs mt-0.5">
                    Your 15-day grace period has ended. Renew your monthly payment to restore access to materials and the meeting link.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/payment/${cls.tutorId}?classId=${cls.id}`)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  Pay Now
                </button>
              </div>
            )}

            {/* Access ending banner — shown when student has unenrolled but still has grace period */}
            {enrollment.status === "UNENROLLED" && enrollment.accessUntil && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900">You've unenrolled from this class</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Access to materials and meeting link continues until{" "}
                    <strong>{new Date(enrollment.accessUntil).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 px-6 pt-4">
            {(["details", "materials"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize mr-2 ${
                  tab === t
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "materials" ? `Materials (${totalMaterials})` : "Details"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "details" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Schedule</p>
                    <p className="text-sm font-medium text-gray-800">
                      {cls.schedule?.join(", ") || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Time</p>
                    <p className="text-sm font-medium text-gray-800">{cls.time || "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Duration</p>
                    <p className="text-sm font-medium text-gray-800">{cls.duration || "—"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Mode</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{cls.mode}</p>
                  </div>
                  {cls.venue && (
                    <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Venue</p>
                      <p className="text-sm font-medium text-gray-800">{cls.venue}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Enrolled</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Monthly Fee</p>
                    <p className="text-sm font-medium text-indigo-600">Rs.{cls.fees?.toLocaleString()}</p>
                  </div>
                </div>

                {cls.meetingLink && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-indigo-700 mb-0.5">Meeting Link</p>
                      <p className="text-xs text-indigo-500 truncate">{cls.meetingLink}</p>
                    </div>
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Join
                    </a>
                  </div>
                )}

                {/* Rate your Tutor */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Rate your Tutor</h3>
                    {existingReview && (
                      <button
                        onClick={handleDeleteReview}
                        disabled={deletingReview}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        {deletingReview ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Star picker */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        disabled={!!existingReview}
                        onMouseEnter={() => !existingReview && setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => !existingReview && setSelectedRating(star)}
                        className="transition-transform hover:scale-110 disabled:cursor-default"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || selectedRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    {selectedRating > 0 && (
                      <span className="ml-2 text-sm font-semibold text-amber-600">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][selectedRating]}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  {!existingReview && (
                    <textarea
                      rows={2}
                      placeholder="Share your experience (optional)…"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white mb-3"
                    />
                  )}

                  {existingReview?.comment && (
                    <p className="text-sm text-gray-600 italic mb-3">"{existingReview.comment}"</p>
                  )}

                  {reviewError && <p className="text-xs text-red-500 mb-2">{reviewError}</p>}

                  {!existingReview ? (
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !selectedRating}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                      Submit Review
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      Review submitted — thank you!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Materials Tab */
              enrollment.accessBlocked ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">Materials are locked</p>
                  <p className="text-gray-400 text-sm mb-4">Renew your monthly payment to access materials again</p>
                  <button
                    onClick={() => router.push(`/payment/${cls.tutorId}?classId=${cls.id}`)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              ) : folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <FolderOpen className="w-7 h-7 text-indigo-300" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">No materials yet</p>
                  <p className="text-gray-400 text-sm">Your tutor hasn't uploaded any materials yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {folders.map(folder => (
                    <div key={folder.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        {expandedFolders.has(folder.id)
                          ? <FolderOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          : <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        }
                        <span className="flex-1 text-sm font-semibold text-gray-800">{folder.name}</span>
                        <span className="text-xs text-gray-400 mr-1">{folder.materials.length} file{folder.materials.length !== 1 ? "s" : ""}</span>
                        {expandedFolders.has(folder.id)
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </button>

                      {expandedFolders.has(folder.id) && (
                        <div className="border-t border-gray-100">
                          {folder.materials.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-gray-400">No files in this folder</p>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {folder.materials.map((m: ClassMaterial) => (
                                <div key={m.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                  <MaterialIcon resourceType={m.resourceType} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                                    <p className="text-xs text-gray-400 mt-0.5">{formatBytes(m.sizeBytes)}</p>
                                  </div>
                                  <a
                                    href={m.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium rounded-lg transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Open
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Unenroll Confirmation Modal */}
      {showUnenrollConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Unenroll from this class?</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    You'll keep access to materials and the meeting link for the rest of your paid period (30 days from your last payment). After that you'll lose access.
                  </p>
                </div>
              </div>

              {unenrollError && (
                <p className="text-sm text-red-600 mb-3">{unenrollError}</p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowUnenrollConfirm(false); setUnenrollError("") }}
                  disabled={unenrolling}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Enrolled
                </button>
                <button
                  onClick={handleUnenroll}
                  disabled={unenrolling}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {unenrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Unenroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
