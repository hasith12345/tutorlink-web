"use client"

import { useState } from "react"
import { X, Upload, FileText, GraduationCap, BookOpen, Briefcase, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

interface CompleteTutorProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
}

export function CompleteTutorProfileModal({ isOpen, onClose, onSubmitted }: CompleteTutorProfileModalProps) {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState("")
  const [qualifications, setQualifications] = useState("")
  const [subjects, setSubjects] = useState("")
  const [experience, setExperience] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleCVUpload = async (file: File) => {
    setCvFile(file)
    setIsUploading(true)
    setError("")
    try {
      const result = await api.uploadCV(file)
      setCvUrl(result.cvUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload CV")
      setCvFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!qualifications.trim()) {
      setError("Please enter your qualifications")
      return
    }

    if (!subjects.trim()) {
      setError("Please enter at least one subject")
      return
    }

    setIsSubmitting(true)
    try {
      const subjectsArray = subjects.split(",").map((s) => s.trim()).filter(Boolean)
      await api.submitTutorApplication({
        cvUrl: cvUrl || undefined,
        qualifications: qualifications.trim(),
        subjects: subjectsArray,
        experience: experience.trim() || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        onSubmitted()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600">
            Your tutor application is now under review. You&apos;ll be notified once approved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Your Tutor Profile</h2>
            <p className="text-sm text-gray-500 mt-0.5">Tell us about your teaching expertise</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Upload CV */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-indigo-500" />
              Upload CV
              <span className="text-xs text-gray-400">(optional)</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                cvFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
              }`}
              onClick={() => document.getElementById("cv-upload")?.click()}
            >
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleCVUpload(file)
                }}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
              ) : cvFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <p className="text-sm font-medium text-green-700">{cvFile.name}</p>
                  <p className="text-xs text-gray-400">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload your CV</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Qualifications <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              placeholder="e.g., BSc in Mathematics, MSc in Education, PGDE..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Subjects Taught <span className="text-red-500">*</span>
            </Label>
            <Input
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g., Mathematics, Physics, Chemistry (comma separated)"
            />
            <p className="text-xs text-gray-400">Separate multiple subjects with commas</p>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Teaching Experience
              <span className="text-xs text-gray-400">(optional)</span>
            </Label>
            <Textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g., 5 years of teaching A/L Mathematics, Private tuition since 2020..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit Tutor Application"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
