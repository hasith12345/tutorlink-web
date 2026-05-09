"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Calendar, Phone, MapPin, CreditCard,
  Upload, FileText, Image as ImageIcon, X, CheckCircle,
  AlertCircle, Info, ArrowLeft, GraduationCap
} from "lucide-react"
import { api, authStorage } from "@/lib/api"
import { Navbar } from "@/components/navbar"

const IMAGE_MAX_BYTES = 5 * 1024 * 1024
const PDF_MAX_BYTES   = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

type UploadMode = "image" | "pdf" | null

interface UploadedFile {
  url: string
  name: string
  type: string
}

async function uploadIdFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/upload/id-copy`, {
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

export default function AddTutorProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    dob: "",
    phone: "",
    address: "",
    idNumber: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [uploadMode, setUploadMode] = useState<UploadMode>(null)
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null)
  const [backFile,  setBackFile]  = useState<UploadedFile | null>(null)
  const [pdfFile,   setPdfFile]   = useState<UploadedFile | null>(null)
  const [uploadingFront, setUploadingFront] = useState(false)
  const [uploadingBack,  setUploadingBack]  = useState(false)
  const [uploadingPdf,   setUploadingPdf]   = useState(false)
  const [frontError, setFrontError] = useState("")
  const [backError,  setBackError]  = useState("")
  const [pdfError,   setPdfError]   = useState("")

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)
  const pdfRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push('/login?redirect=/add-tutor-profile')
      return
    }
    const userData = authStorage.getUser()
    if (!userData) {
      router.push('/login?redirect=/add-tutor-profile')
      return
    }
    if (userData.hasTutorProfile) {
      // Already has a tutor profile
      router.push('/select-role')
      return
    }
    setUser(userData)
    setIsLoading(false)
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.dob) newErrors.dob = "Date of birth is required"
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID number is required"
    } else if (!/^\d{9}[Vv]$|^\d{12}$/.test(formData.idNumber)) {
      newErrors.idNumber = "Please enter a valid NIC number (9 digits + V or 12 digits)"
    }
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

  const validateFile = (file: File, isPdf: boolean): string | null => {
    if (isPdf) {
      if (file.type !== "application/pdf") return "Only PDF files are accepted here"
      if (file.size > PDF_MAX_BYTES) return `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 10 MB.`
    } else {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG or WebP images are accepted"
      if (file.size > IMAGE_MAX_BYTES) return `Image too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 5 MB.`
    }
    return null
  }

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file) return
    const err = validateFile(file, false)
    if (err) { setFrontError(err); return }
    setFrontError(""); setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingFront(true)
    try { setFrontFile({ url: await uploadIdFile(file), name: file.name, type: "image" }) }
    catch (e: unknown) { setFrontError(e instanceof Error ? e.message : "Upload failed") }
    finally { setUploadingFront(false) }
  }

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file) return
    const err = validateFile(file, false)
    if (err) { setBackError(err); return }
    setBackError(""); setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingBack(true)
    try { setBackFile({ url: await uploadIdFile(file), name: file.name, type: "image" }) }
    catch (e: unknown) { setBackError(e instanceof Error ? e.message : "Upload failed") }
    finally { setUploadingBack(false) }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ""
    if (!file) return
    const err = validateFile(file, true)
    if (err) { setPdfError(err); return }
    setPdfError(""); setErrors(prev => ({ ...prev, idCopy: "" }))
    setUploadingPdf(true)
    try { setPdfFile({ url: await uploadIdFile(file), name: file.name, type: "pdf" }) }
    catch (e: unknown) { setPdfError(e instanceof Error ? e.message : "Upload failed") }
    finally { setUploadingPdf(false) }
  }

  const switchMode = (mode: UploadMode) => {
    setUploadMode(mode)
    setFrontFile(null); setBackFile(null); setPdfFile(null)
    setFrontError(""); setBackError(""); setPdfError("")
    setErrors(prev => ({ ...prev, idCopy: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const result = await api.addRole({
        role: "tutor",
        dob: formData.dob,
        phone: formData.phone,
        address: formData.address,
        idNumber: formData.idNumber,
        idCopyFront: frontFile?.url,
        idCopyBack:  backFile?.url,
        idCopyPdf:   pdfFile?.url,
      })
      // Update stored user flags
      const currentUser = authStorage.getUser()
      if (currentUser) {
        authStorage.setUser({ ...currentUser, hasTutorProfile: true })
      }
      authStorage.setActiveRole('tutor')
      window.dispatchEvent(new Event('userDataUpdated'))
      setSuccess(true)
      setTimeout(() => router.push('/select-role'), 1500)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tutor profile created!</h2>
          <p className="text-gray-500">Redirecting you to choose your active role…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Your Tutor Profile</h1>
              <p className="text-gray-500 text-sm">Hi {user?.fullName} — just a few more details to get started</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setErrors(prev => ({ ...prev, dob: "" })) }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.dob ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="0771234567"
              value={formData.phone}
              onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors(prev => ({ ...prev, phone: "" })) }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address
            </label>
            <textarea
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setErrors(prev => ({ ...prev, address: "" })) }}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none ${errors.address ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              NIC Number
            </label>
            <input
              type="text"
              placeholder="123456789V or 123456789012"
              value={formData.idNumber}
              onChange={(e) => { setFormData({ ...formData, idNumber: e.target.value }); setErrors(prev => ({ ...prev, idNumber: "" })) }}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.idNumber ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
          </div>

          {/* ID Copy Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Upload className="w-4 h-4 inline mr-2" />
              NIC Copy <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-700">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <div>
                Upload <strong>both sides</strong> as separate images, or a single PDF with both sides.
                Images max 5 MB · PDF max 10 MB.
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => switchMode("image")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  uploadMode === "image"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:border-indigo-300"
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
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Document
              </button>
            </div>

            {/* Image mode */}
            {uploadMode === "image" && (
              <div className="grid grid-cols-2 gap-3">
                {/* Front */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Front Side</p>
                  {frontFile ? (
                    <div className="relative rounded-lg overflow-hidden border border-green-300 bg-green-50">
                      <img src={frontFile.url} alt="NIC front" className="w-full h-28 object-cover" />
                      <button type="button" onClick={() => setFrontFile(null)} className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow hover:bg-red-50">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs py-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => frontRef.current?.click()} disabled={uploadingFront}
                      className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60 ${frontError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"}`}>
                      {uploadingFront ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" /> : frontError ? (
                        <><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-xs text-red-500 text-center px-2">{frontError}</span></>
                      ) : (
                        <><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-500">Click to upload</span></>
                      )}
                    </button>
                  )}
                  <input ref={frontRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFrontUpload} />
                </div>

                {/* Back */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Back Side</p>
                  {backFile ? (
                    <div className="relative rounded-lg overflow-hidden border border-green-300 bg-green-50">
                      <img src={backFile.url} alt="NIC back" className="w-full h-28 object-cover" />
                      <button type="button" onClick={() => setBackFile(null)} className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow hover:bg-red-50">
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600/80 text-white text-xs py-1 flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Uploaded
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => backRef.current?.click()} disabled={uploadingBack}
                      className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-60 ${backError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"}`}>
                      {uploadingBack ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" /> : backError ? (
                        <><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-xs text-red-500 text-center px-2">{backError}</span></>
                      ) : (
                        <><Upload className="w-5 h-5 text-gray-400" /><span className="text-xs text-gray-500">Click to upload</span></>
                      )}
                    </button>
                  )}
                  <input ref={backRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleBackUpload} />
                </div>
              </div>
            )}

            {/* PDF mode */}
            {uploadMode === "pdf" && (
              <div>
                {pdfFile ? (
                  <div className="flex items-center gap-3 p-3 border border-green-300 bg-green-50 rounded-lg">
                    <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" /> Uploaded</p>
                    </div>
                    <button type="button" onClick={() => setPdfFile(null)} className="p-1 rounded-full hover:bg-red-100">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => pdfRef.current?.click()} disabled={uploadingPdf}
                    className={`w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-60 ${pdfError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"}`}>
                    {uploadingPdf ? <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /><span className="text-sm text-gray-500">Uploading…</span></> : pdfError ? (
                      <><AlertCircle className="w-7 h-7 text-red-500" /><span className="text-xs text-red-500 text-center px-4">{pdfError}</span></>
                    ) : (
                      <><FileText className="w-8 h-8 text-gray-400" /><span className="text-sm font-medium text-gray-600">Click to upload PDF</span><span className="text-xs text-gray-400">Both NIC sides · max 10 MB</span></>
                    )}
                  </button>
                )}
                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </div>
            )}

            {errors.idCopy && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.idCopy}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSubmitting ? "Creating tutor profile…" : "Create Tutor Profile"}
          </button>
        </form>
      </div>
    </div>
  )
}
