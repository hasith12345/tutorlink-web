"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  Building,
  Loader2,
  CheckCircle,
  FileText,
} from "lucide-react"

export default function CreateClassPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    subject: "",
    description: "",
    venue: "",
    mode: "physical",
    location: "",
    date: "",
    time: "",
    duration: "",
    fees: "",
    maxStudents: "10",
  })

  useEffect(() => {
    const init = async () => {
      if (!authStorage.isAuthenticated()) {
        router.push("/login")
        return
      }

      const userData = authStorage.getUser()
      if (!userData?.hasTutorProfile) {
        router.push("/dashboard")
        return
      }

      // Check if tutor is approved
      try {
        const statusRes = await api.getTutorApplicationStatus()
        if (statusRes.tutorStatus !== "APPROVED") {
          router.push("/tutor/dashboard")
          return
        }
      } catch {
        router.push("/tutor/dashboard")
        return
      }

      setIsLoading(false)
    }
    init()
  }, [router])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.subject.trim()) return setError("Subject is required")
    if (!form.mode) return setError("Mode is required")
    if (!form.date) return setError("Date is required")
    if (!form.time) return setError("Time is required")
    if (!form.duration.trim()) return setError("Duration is required")
    if (!form.fees) return setError("Fees are required")

    setIsSubmitting(true)
    try {
      await api.createClass({
        subject: form.subject.trim(),
        description: form.description.trim() || undefined,
        venue: form.venue.trim() || undefined,
        mode: form.mode,
        location: form.location.trim() || undefined,
        date: form.date,
        time: form.time,
        duration: form.duration.trim(),
        fees: parseInt(form.fees),
        maxStudents: parseInt(form.maxStudents) || 10,
      })
      setSuccess(true)
      setTimeout(() => {
        router.push("/tutor/classes")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create class")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <TutorNavbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Created!</h2>
            <p className="text-gray-500">Redirecting to your classes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <TutorNavbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create a New Class</h1>
          <p className="text-gray-500 mt-1">Fill in the details for your tutoring class</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="e.g., Mathematics - Calculus"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of what will be covered..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Mode <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("mode", "physical")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      form.mode === "physical"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span className="text-sm font-medium">Physical</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("mode", "online")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      form.mode === "online"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Video className="w-5 h-5" />
                    <span className="text-sm font-medium">Online</span>
                  </button>
                </div>
              </div>

              {/* Venue & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Building className="w-4 h-4 text-indigo-500" />
                    Venue
                  </Label>
                  <Input
                    value={form.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    placeholder="e.g., Colombo"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Location
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., 123 Main St, Colombo 07"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                  />
                </div>
              </div>

              {/* Duration & Fees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder="e.g., 2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    Fees (Rs.) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={form.fees}
                    onChange={(e) => handleChange("fees", e.target.value)}
                    placeholder="e.g., 2500"
                    min="0"
                  />
                </div>
              </div>

              {/* Max Students */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Maximum Students
                </Label>
                <Input
                  type="number"
                  value={form.maxStudents}
                  onChange={(e) => handleChange("maxStudents", e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                  max="100"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Class...
                  </span>
                ) : (
                  "Create Class"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
