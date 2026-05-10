"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, BookOpen, Award, Clock,
  Upload, X, CheckCircle, AlertCircle, ArrowLeft, GraduationCap
} from "lucide-react"
import { api, authStorage } from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { SubjectSelector } from "@/components/subject-selector"

const CV_MAX_BYTES = 5 * 1024 * 1024
const CV_ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]

async function uploadCvFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/upload/cv`,
    { method: "POST", body: formData }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(err.message || "Upload failed")
  }
  const data = await res.json()
  return data.url as string
}

interface UploadedFile { url: string; name: string }

export default function CompleteTutorApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [qualifications, setQualifications] = useState([""])
  const [subjects, setSubjects] = useState<string[]>([])
  const [experience, setExperience] = useState([""])
  const [cvFile, setCvFile] = useState<UploadedFile | null>(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvError, setCvError] = useState("")
  const cvRef = useRef<HTMLInputElement>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login")
      return
    }
    const userData = authStorage.getUser()
    if (!userData?.hasTutorProfile) {
      router.push("/add-tutor-profile")
      return
    }
    setUser(userData)
    setIsLoading(false)
  }, [router])

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!CV_ALLOWED.includes(file.type)) { setCvError("Only JPEG, PNG, WebP, or PDF are accepted"); return }
    if (file.size > CV_MAX_BYTES) { setCvError(`File too large. Max 5 MB.`); return }
    setCvError("")
    setUploadingCv(true)
    try {
      const url = await uploadCvFile(file)
      setCvFile({ url, name: file.name })
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploadingCv(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!qualifications.some(q => q.trim())) newErrors.qualifications = "At least one qualification is required"
    if (subjects.length === 0) newErrors.subjects = "At least one subject is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await api.submitTutorApplication({
        qualifications: qualifications.filter(q => q.trim()).join(" | "),
        subjects: subjects,
        experience: experience.filter(e => e.trim()).join(" | ") || undefined,
        cvUrl: cvFile?.url,
      })
      const currentUser = authStorage.getUser()
      if (currentUser) authStorage.setUser({ ...currentUser, tutorStatus: "PENDING" })
      setSuccess(true)
      setTimeout(() => router.push("/tutor-application-status"), 1500)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Submission failed" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  )

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Application submitted!</h2>
        <p className="text-gray-500">Redirecting to your application status…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Tutor Application</h1>
            <p className="text-gray-500 text-sm">Hi {user?.fullName} — submit your teaching details for admin review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-2" />
              Qualifications <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {qualifications.map((qual, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., BSc in Mathematics, MSc in Education, PGDE..."
                    value={qual}
                    onChange={e => {
                      const updated = [...qualifications]; updated[idx] = e.target.value; setQualifications(updated)
                      setErrors(prev => ({ ...prev, qualifications: "" }))
                    }}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.qualifications ? "border-red-500" : "border-gray-300"}`}
                  />
                  {qualifications.length > 1 && (
                    <button type="button" onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setQualifications([...qualifications, ""])}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                + Add another qualification
              </button>
            </div>
            {errors.qualifications && <p className="mt-1 text-sm text-red-600">{errors.qualifications}</p>}
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Subjects Taught <span className="text-red-500">*</span>
            </label>
            <SubjectSelector
              values={subjects}
              onChange={vals => { setSubjects(vals); setErrors(prev => ({ ...prev, subjects: "" })) }}
              onError={msg => setErrors(prev => ({ ...prev, subjects: msg }))}
            />
            {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>}
          </div>

          {/* Teaching Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Teaching Experience <span className="text-gray-400">(optional)</span>
            </label>
            <div className="space-y-2">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    placeholder="e.g., 5 years of teaching A/L Mathematics, Private tuition since 2020..."
                    value={exp}
                    onChange={e => { const updated = [...experience]; updated[idx] = e.target.value; setExperience(updated) }}
                    rows={2}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  />
                  {experience.length > 1 && (
                    <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors h-fit">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setExperience([...experience, ""])}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                + Add another experience
              </button>
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Upload CV <span className="text-gray-400">(optional)</span>
            </label>
            {cvFile ? (
              <div className="flex items-center gap-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{cvFile.name}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" /> Uploaded</p>
                </div>
                <button type="button" onClick={() => setCvFile(null)} className="p-1 rounded-full hover:bg-red-100">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => cvRef.current?.click()} disabled={uploadingCv}
                className={`w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-60 ${cvError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"}`}>
                {uploadingCv
                  ? <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /><span className="text-sm text-gray-500">Uploading…</span></>
                  : cvError
                    ? <><AlertCircle className="w-7 h-7 text-red-500" /><span className="text-xs text-red-500 text-center px-4">{cvError}</span></>
                    : <><Upload className="w-8 h-8 text-gray-400" /><span className="text-sm font-medium text-gray-600">Click to upload CV</span><span className="text-xs text-gray-400">PDF or images · max 5 MB</span></>
                }
              </button>
            )}
            <input ref={cvRef} type="file" accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleCvUpload} />
          </div>

          {errors.submit && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? "Submitting…" : "Submit Tutor Application"}
          </button>
        </form>
      </div>
    </div>
  )
}
