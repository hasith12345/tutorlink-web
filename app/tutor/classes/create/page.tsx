"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage, api } from "@/lib/api"
import { TutorShell } from "@/components/tutor/tutor-shell"
import { TutorPageHeader } from "@/components/tutor/tutor-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  BookOpen, MapPin, Clock, DollarSign, Users,
  Video, Building, Loader2, CheckCircle, FileText, CalendarDays,
} from "lucide-react"

const DAYS = [
  { key: "MON", label: "Mon" },
  { key: "TUE", label: "Tue" },
  { key: "WED", label: "Wed" },
  { key: "THU", label: "Thu" },
  { key: "FRI", label: "Fri" },
  { key: "SAT", label: "Sat" },
  { key: "SUN", label: "Sun" },
]

export default function CreateClassPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([])

  const [form, setForm] = useState({
    subject: "",
    description: "",
    venue: "",
    mode: "physical",
    location: "",
    schedule: [] as string[],
    time: "",
    duration: "",
    fees: "",
    maxStudents: "10",
  })

  useEffect(() => {
    const init = async () => {
      if (!authStorage.isAuthenticated()) { router.push("/login"); return }
      const userData = authStorage.getUser()
      if (!userData?.hasTutorProfile) { router.push("/dashboard"); return }
      try {
        const statusRes = await api.getTutorApplicationStatus()
        if (statusRes.tutorStatus !== "APPROVED") { router.push("/tutor/dashboard"); return }
        if (statusRes.profile?.subjects?.length > 0) {
          setTutorSubjects(statusRes.profile.subjects)
        }
      } catch { router.push("/tutor/dashboard"); return }
      setIsLoading(false)
    }
    init()
  }, [router])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      schedule: prev.schedule.includes(day)
        ? prev.schedule.filter(d => d !== day)
        : [...prev.schedule, day],
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.subject.trim()) return setError("Subject is required")
    if (!form.mode) return setError("Mode is required")
    if (form.schedule.length === 0) return setError("Select at least one class day")
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
        schedule: form.schedule,
        time: form.time,
        duration: form.duration.trim(),
        fees: parseInt(form.fees),
        maxStudents: parseInt(form.maxStudents) || 10,
      })
      setSuccess(true)
      setTimeout(() => router.push("/tutor/classes"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to create class")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return (
    <TutorShell maxWidth="max-w-2xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    </TutorShell>
  )

  if (success) return (
    <TutorShell maxWidth="max-w-2xl">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-in fade-in-0 zoom-in-95 duration-500 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">Class Created!</h2>
          <p className="text-slate-500">Redirecting to your classes...</p>
        </div>
      </div>
    </TutorShell>
  )

  return (
    <TutorShell maxWidth="max-w-2xl">
        <TutorPageHeader
          icon={BookOpen}
          title="Create a New Class"
          subtitle="Monthly enrollment class — students pay per month"
        />

        <Card className="rounded-2xl border border-slate-200/70 shadow-sm">
          <CardContent className="p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <select
                  value={form.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                >
                  <option value="">Select a subject...</option>
                  {tutorSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
                  {[
                    { value: "physical", label: "Physical", Icon: Building },
                    { value: "online", label: "Online", Icon: Video },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange("mode", value)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        form.mode === value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue & Location — physical only */}
              {form.mode === "physical" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building className="w-4 h-4 text-indigo-500" />Venue
                    </Label>
                    <Input value={form.venue} onChange={(e) => handleChange("venue", e.target.value)} placeholder="e.g., Colombo" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-indigo-500" />Location
                    </Label>
                    <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g., 123 Main St, Colombo 07" />
                  </div>
                </div>
              )}

              {/* Schedule — day picker */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CalendarDays className="w-4 h-4 text-indigo-500" />
                  Class Days <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 ml-1">— recurring weekly</span>
                </Label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map(({ key, label }) => {
                    const selected = form.schedule.includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleDay(key)}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                          selected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                {form.schedule.length > 0 && (
                  <p className="text-xs text-indigo-600 font-medium">
                    {form.schedule.join(", ")} — {form.schedule.length} day{form.schedule.length > 1 ? "s" : ""}/week
                  </p>
                )}
              </div>

              {/* Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Class Time <span className="text-red-500">*</span>
                  </Label>
                  <TimePicker value={form.time} onChange={(time) => handleChange("time", time)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Input value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} placeholder="e.g., 2 hours" />
                </div>
              </div>

              {/* Monthly Fees & Max Students */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    Monthly Fees (Rs.) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={form.fees}
                    onChange={(e) => handleChange("fees", e.target.value)}
                    placeholder="e.g., 2500"
                    min="0"
                  />
                  {form.fees && Number(form.fees) > 0 ? (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Platform charges <strong className="text-indigo-600">8%</strong> · You receive{" "}
                      <strong className="text-green-600">Rs.{(Number(form.fees) - Math.round(Number(form.fees) * 0.08)).toLocaleString()}</strong>{" "}
                      per student/month
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Platform charges <strong className="text-indigo-600">8%</strong> service fee on every payment
                    </p>
                  )}
                </div>
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
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />Creating Class...
                  </span>
                ) : "Create Class"}
              </Button>
            </form>
          </CardContent>
        </Card>
    </TutorShell>
  )
}
