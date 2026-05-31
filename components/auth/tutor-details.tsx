"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft, Calendar, Phone, MapPin, CreditCard,
  Upload, FileText, Image as ImageIcon, X, CheckCircle,
  AlertCircle, Info
} from "lucide-react"
import { api, authStorage } from "@/lib/api"
import { SubjectSelector } from "@/components/subject-selector"

interface TutorDetailsProps {
  onBack: () => void
  onSuccess: () => void
  userData: {
    fullName: string
    email: string
    password: string
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const IMAGE_MAX_BYTES = 5 * 1024 * 1024   // 5 MB
const PDF_MAX_BYTES   = 10 * 1024 * 1024  // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"]

// ─── Upload mode ──────────────────────────────────────────────────────────────
type UploadMode = "image" | "pdf" | null

interface UploadedFile {
  url: string
  name: string
  type: string  // "image" | "pdf"
}

// ─── Helper: upload a single file to /api/upload/id-copy ─────────────────────
async function uploadIdFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("http://localhost:5001/api/upload/id-copy", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(err.message || "Upload failed")
  }
  const data = await res.json()
  return data.url as string
}

// ─── Helper: upload CV to /api/upload/cv ──────────────────────────────────────
async function uploadCvFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch("http://localhost:5001/api/upload/cv", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Upload failed" }))
    throw new Error(err.message || "Upload failed")
  }
  const data = await res.json()
  return data.url as string
}

export function TutorDetails({ onBack, onSuccess, userData }: TutorDetailsProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    dob: "",
    phone: "",
    address: "",
    idNumber: "",
    qualifications: [""],
    subjects: [],
    experience: [""]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── CV Upload state ───────────────────────────────────────────────────────
  const [cvFile, setCvFile] = useState<UploadedFile | null>(null)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvError, setCvError] = useState("")
  const cvRef = useRef<HTMLInputElement>(null)

  // ── ID Copy state ──────────────────────────────────────────────────────────
  const [uploadMode, setUploadMode] = useState<UploadMode>(null)

  // Image mode
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null)
  const [backFile,  setBackFile]  = useState<UploadedFile | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack,  setUploadingBack]  = useState(false)

  // PDF mode
  const [pdfFile, setPdfFile] = useState<UploadedFile | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Per-slot inline validation errors
  const [frontError, setFrontError] = useState<string>("")
  const [backError,  setBackError]  = useState<string>("")
  const [pdfError,   setPdfError]   = useState<string>("")

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)
  const pdfRef   = useRef<HTMLInputElement>(null)

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required"
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required"
    } else if (!/^\d{9}[Vv]$|^\d{12}$/.test(formData.idNumber)) {
      newErrors.idNumber = "Please enter a valid NIC number (9 digits + V or 12 digits)"
    }

    if (!formData.qualifications.some(q => q.trim())) {
      newErrors.qualifications = "At least one qualification is required"
    }

    if (!formData.subjects.some(s => s.trim())) {
      newErrors.subjects = "At least one subject taught is required"
    }

    // ID copy validation
    if (!uploadMode) {
      newErrors.idCopy = "Please upload your ID copy (both sides as images or as a PDF)"
    } else if (uploadMode === "image") {
      if (!frontFile) newErrors.idCopy = "Please upload the front side of your NIC"
      else if (!backFile) newErrors.idCopy = "Please upload the back side of your NIC"
    } else if (uploadMode === "pdf") {
      if (!pdfFile) newErrors.idCopy = "Please upload your NIC as a PDF"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── File handlers ──────────────────────────────────────────────────────────
  const validateFile = (file: File, isPdf: boolean): string | null => {
    if (isPdf) {
      if (file.type !== "application/pdf") return "Only PDF files are accepted here"
      if (file.size > PDF_MAX_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        return `File is too large (${sizeMB} MB). PDF must be 10 MB or smaller.`
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        return "Only JPEG, PNG or WebP images are accepted"
      if (file.size > IMAGE_MAX_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        return `Image is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`
      }
    }
    return null
  }

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""  // always reset so re-selecting the same file re-fires onChange
    if (!file) return
    const err = validateFile(file, false)
    if (err) { setFrontError(err); return }
    setFrontError("")
    setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingFront(true)
    try {
      const url = await uploadIdFile(file)
      setFrontFile({ url, name: file.name, type: "image" })
    } catch (err: unknown) {
      setFrontError(err instanceof Error ? err.message : "Front upload failed")
    } finally {
      setUploadingFront(false)
    }
  }

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""  // always reset so re-selecting the same file re-fires onChange
    if (!file) return
    const err = validateFile(file, false)
    if (err) { setBackError(err); return }
    setBackError("")
    setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingBack(true)
    try {
      const url = await uploadIdFile(file)
      setBackFile({ url, name: file.name, type: "image" })
    } catch (err: unknown) {
      setBackError(err instanceof Error ? err.message : "Back upload failed")
    } finally {
      setUploadingBack(false)
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""  // always reset so re-selecting the same file re-fires onChange
    if (!file) return
    const err = validateFile(file, true)
    if (err) { setPdfError(err); return }
    setPdfError("")
    setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingPdf(true)
    try {
      const url = await uploadIdFile(file)
      setPdfFile({ url, name: file.name, type: "pdf" })
    } catch (err: unknown) {
      setPdfError(err instanceof Error ? err.message : "PDF upload failed")
    } finally {
      setUploadingPdf(false)
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const CV_ALLOWED = [...ALLOWED_IMAGE_TYPES, "application/pdf"]
    if (!CV_ALLOWED.includes(file.type)) {
      setCvError("Only JPEG, PNG, WebP, PDF are accepted")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setCvError(`File too large (${sizeMB} MB). Max 5 MB.`)
      return
    }
    setCvError("")
    setUploadingCv(true)
    try {
      const url = await uploadCvFile(file)
      setCvFile({ url, name: file.name, type: "document" })
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : "CV upload failed")
    } finally {
      setUploadingCv(false)
    }
  }

  const switchMode = (mode: UploadMode) => {
    setUploadMode(mode)
    setFrontFile(null)
    setBackFile(null)
    setPdfFile(null)
    setFrontError("")
    setBackError("")
    setPdfError("")
    setErrors(prev => ({ ...prev, idCopy: "" }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      await api.signup({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: "tutor",
        dob: formData.dob,
        phone: formData.phone,
        address: formData.address,
        idNumber: formData.idNumber,
        idCopyFront: frontFile?.url,
        idCopyBack:  backFile?.url,
        idCopyPdf:   pdfFile?.url,
        qualifications: formData.qualifications.filter(q => q.trim()).join(" | "),
        subjects: formData.subjects.filter(s => s.trim()),
        experience: formData.experience.filter(e => e.trim()).join(" | "),
        cvUrl: cvFile?.url,
      })

      router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-[40%_60%] overflow-hidden">
      {/* Left Side - Image Panel */}
      <div className="hidden md:flex relative bg-white items-center justify-center p-6">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/Tutor.png"
            alt="Tutor teaching illustration"
            width={400}
            height={400}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full flex flex-col h-full overflow-hidden">
        {/* Sticky Header */}
        <div className="flex-shrink-0 bg-white px-8 md:px-12 pt-8 md:pt-12 pb-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 mt-1"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Complete Your Profile</h1>
              <p className="text-slate-500 text-sm mt-1">Tell us about your teaching expertise</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-4 min-h-0" style={{ scrollBehavior: "smooth" }}>
          <div className="space-y-6">

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setErrors(prev => ({ ...prev, dob: "" })) }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${errors.dob ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="0771234567"
                value={formData.phone}
                onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: "" })) }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${errors.phone ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setErrors(prev => ({ ...prev, address: "" })) }}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none ${errors.address ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                ID Number (NIC) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="123456789V or 123456789012"
                value={formData.idNumber}
                onChange={(e) => { setFormData({ ...formData, idNumber: e.target.value }); setErrors(prev => ({ ...prev, idNumber: "" })) }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${errors.idNumber ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z"/></svg>
                  Qualifications <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="space-y-2">
                {formData.qualifications.map((qual, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., BSc in Mathematics, MSc in Education..."
                      value={qual}
                      onChange={(e) => {
                        const newQuals = [...formData.qualifications]
                        newQuals[idx] = e.target.value
                        setFormData({ ...formData, qualifications: newQuals })
                        setErrors(prev => ({ ...prev, qualifications: "" }))
                      }}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${errors.qualifications && idx === 0 ? "border-red-500" : "border-slate-300"}`}
                    />
                    {formData.qualifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newQuals = formData.qualifications.filter((_, i) => i !== idx)
                          setFormData({ ...formData, qualifications: newQuals })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, qualifications: [...formData.qualifications, ""] })}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  + Add another qualification
                </button>
              </div>
              {errors.qualifications && <p className="mt-1 text-sm text-red-600">{errors.qualifications}</p>}
            </div>

            {/* Subjects Taught */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"/></svg>
                  Subjects Taught <span className="text-red-500">*</span>
                </span>
              </label>
              <SubjectSelector
                values={formData.subjects}
                onChange={(subjects) => {
                  setFormData({ ...formData, subjects })
                  setErrors(prev => ({ ...prev, subjects: "" }))
                }}
                onError={(error) => setErrors(prev => ({ ...prev, subjects: error }))}
              />
              {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>}
            </div>

            {/* Teaching Experience */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Teaching Experience
                </span>
              </label>
              <div className="space-y-2">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      placeholder="e.g., 5 years of teaching A/L Mathematics, Private tuition since 2020..."
                      value={exp}
                      onChange={(e) => {
                        const newExperience = [...formData.experience]
                        newExperience[idx] = e.target.value
                        setFormData({ ...formData, experience: newExperience })
                      }}
                      rows={2}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                    />
                    {formData.experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newExperience = formData.experience.filter((_, i) => i !== idx)
                          setFormData({ ...formData, experience: newExperience })
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors h-fit"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, experience: [...formData.experience, ""] })}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  + Add another experience
                </button>
              </div>
            </div>

            {/* ── CV Upload (Optional) ────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Upload CV <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              {cvFile ? (
                <div className="flex items-center gap-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                  <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{cvFile.name}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" /> Uploaded</p>
                  </div>
                  <button type="button" onClick={() => setCvFile(null)} className="p-1 rounded-full hover:bg-red-100">
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => cvRef.current?.click()} disabled={uploadingCv}
                  className={`w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-60 ${cvError ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50"}`}>
                  {uploadingCv ? (
                    <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" /><span className="text-sm text-slate-500">Uploading…</span></>
                  ) : cvError ? (
                    <><AlertCircle className="w-7 h-7 text-red-500" /><span className="text-xs text-red-500 text-center px-4">{cvError}</span></>
                  ) : (
                    <><FileText className="w-8 h-8 text-slate-400" /><span className="text-sm font-medium text-slate-600">Click to upload CV</span><span className="text-xs text-slate-400">PDF or images · max 5 MB</span></>
                  )}
                </button>
              )}
              <input ref={cvRef} type="file" accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleCvUpload} />
            </div>

            {/* ── ID Copy Upload ─────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Upload className="w-4 h-4 inline mr-2" />
                ID Copy Upload
                <span className="ml-1 text-red-500">*</span>
              </label>

              {/* Info box */}
              <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-semibold mb-0.5">Requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Upload <strong>both sides</strong> of your NIC as separate images, <strong>or</strong> a single PDF containing both sides.</li>
                    <li>Accepted image formats: JPEG, PNG, WebP &mdash; max <strong>5 MB</strong> per image.</li>
                    <li>Accepted PDF: max <strong>10 MB</strong>.</li>
                    <li>Ensure the ID is clearly visible and not blurry.</li>
                  </ul>
                </div>
              </div>

              {/* Mode selector */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => switchMode("image")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    uploadMode === "image"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Images (Front &amp; Back)
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("pdf")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    uploadMode === "pdf"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PDF Document
                </button>
              </div>

              {/* Image upload UI */}
              {uploadMode === "image" && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Front side */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1.5">Front Side</p>
                    {frontFile ? (
                      <div className="relative rounded-lg overflow-hidden border border-green-300 bg-green-50">
                        <img
                          src={frontFile.url}
                          alt="NIC front"
                          className="w-full h-28 object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          <button
                            type="button"
                            onClick={() => setFrontFile(null)}
                            className="bg-white rounded-full p-0.5 shadow hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs py-1 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Uploaded
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => frontRef.current?.click()}
                        disabled={uploadingFront}
                        className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                          frontError
                            ? "border-red-400 bg-red-50 hover:border-red-500 hover:bg-red-50"
                            : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50"
                        }`}
                      >
                        {uploadingFront ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                        ) : frontError ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-red-600">File rejected</span>
                            <span className="text-xs text-red-500 text-center px-2 leading-tight">{frontError}</span>
                            <span className="text-xs text-slate-400 mt-0.5">Click to choose another</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-xs text-slate-500">Click to upload</span>
                            <span className="text-xs text-slate-400">JPEG, PNG, WebP · max 5 MB</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={frontRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFrontUpload}
                    />
                  </div>

                  {/* Back side */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-1.5">Back Side</p>
                    {backFile ? (
                      <div className="relative rounded-lg overflow-hidden border border-green-300 bg-green-50">
                        <img
                          src={backFile.url}
                          alt="NIC back"
                          className="w-full h-28 object-cover"
                        />
                        <div className="absolute top-1.5 right-1.5">
                          <button
                            type="button"
                            onClick={() => setBackFile(null)}
                            className="bg-white rounded-full p-0.5 shadow hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs py-1 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Uploaded
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => backRef.current?.click()}
                        disabled={uploadingBack}
                        className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                          backError
                            ? "border-red-400 bg-red-50 hover:border-red-500 hover:bg-red-50"
                            : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50"
                        }`}
                      >
                        {uploadingBack ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                        ) : backError ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-red-600">File rejected</span>
                            <span className="text-xs text-red-500 text-center px-2 leading-tight">{backError}</span>
                            <span className="text-xs text-slate-400 mt-0.5">Click to choose another</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-xs text-slate-500">Click to upload</span>
                            <span className="text-xs text-slate-400">JPEG, PNG, WebP · max 5 MB</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={backRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleBackUpload}
                    />
                  </div>
                </div>
              )}

              {/* PDF upload UI */}
              {uploadMode === "pdf" && (
                <div>
                  {pdfFile ? (
                    <div className="flex items-center gap-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                      <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{pdfFile.name}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3" /> Uploaded successfully
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-red-100"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => pdfRef.current?.click()}
                      disabled={uploadingPdf}
                      className={`w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        pdfError
                          ? "border-red-400 bg-red-50 hover:border-red-500 hover:bg-red-50"
                          : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/50"
                      }`}
                    >
                      {uploadingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                          <span className="text-sm text-slate-500">Uploading PDF…</span>
                        </>
                      ) : pdfError ? (
                        <>
                          <AlertCircle className="w-7 h-7 text-red-500" />
                          <span className="text-sm font-semibold text-red-600">File rejected</span>
                          <span className="text-xs text-red-500 text-center px-4 leading-tight">{pdfError}</span>
                          <span className="text-xs text-slate-400 mt-0.5">Click to choose another</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">Click to upload PDF</span>
                          <span className="text-xs text-slate-400">PDF containing both NIC sides · max 10 MB</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={pdfRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                </div>
              )}

              {/* Upload error */}
              {errors.idCopy && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.idCopy}
                </p>
              )}
            </div>
            {/* ── End ID Copy Upload ──────────────────────────────────────────── */}

            {/* Submit error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 bg-white px-8 md:px-12 pb-8 md:pb-12 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Creating Account..." : "Complete Signup"}
          </button>
        </div>
      </div>
    </div>
  )
}
