"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, GraduationCap, Calendar, Phone, MapPin, User, School, CreditCard, UserCheck } from "lucide-react"
import { api, authStorage } from "@/lib/api"

/**
 * OAuth Signup Container
 * 
 * This component handles the complete OAuth signup flow with smooth animations
 * similar to the email/password signup flow in AuthContainer.
 * 
 * Flow:
 * 1. Role Selection (student/tutor)
 * 2. Student Details or Tutor Details form
 * 3. Account creation on "Complete Profile" click
 */

interface OAuthData {
  email: string
  fullName: string
  picture?: string
}

interface OAuthSignupContainerProps {
  oauthData: OAuthData
  onCancel: () => void
}

export function OAuthSignupContainer({ oauthData, onCancel }: OAuthSignupContainerProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [step, setStep] = useState<"role" | "student-details" | "tutor-details">("role")

  // Enable transitions after first paint to prevent initial animation
  useEffect(() => {
    if (containerRef.current) {
      void containerRef.current.offsetHeight
    }
    
    let frameId1: number
    let frameId2: number
    
    frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(() => {
        setIsReady(true)
      })
    })

    return () => {
      cancelAnimationFrame(frameId1)
      cancelAnimationFrame(frameId2)
    }
  }, [])

  const handleRoleSelect = useCallback((role: "student" | "tutor") => {
    setStep(role === "student" ? "student-details" : "tutor-details")
  }, [])

  const handleBackToRoles = useCallback(() => {
    setStep("role")
  }, [])

  const handleSignupSuccess = useCallback((role: "student" | "tutor") => {
    if (role === "student") {
      router.push("/")
    } else {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[72rem] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          contain: "layout style paint",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {/* Role Selection */}
          {step === "role" && (
            <motion.div
              key="role"
              initial={isReady ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <RoleSelectionPanel 
                onRoleSelect={handleRoleSelect}
                onBack={onCancel}
              />
            </motion.div>
          )}

          {/* Student Details Form */}
          {step === "student-details" && (
            <motion.div
              key="student-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <StudentProfileForm 
                oauthData={oauthData}
                onBack={handleBackToRoles}
                onSuccess={() => handleSignupSuccess("student")}
              />
            </motion.div>
          )}

          {/* Tutor Details Form */}
          {step === "tutor-details" && (
            <motion.div
              key="tutor-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <TutorProfileForm 
                oauthData={oauthData}
                onBack={handleBackToRoles}
                onSuccess={() => handleSignupSuccess("tutor")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Role Selection Panel
function RoleSelectionPanel({ onRoleSelect, onBack }: { 
  onRoleSelect: (role: "student" | "tutor") => void
  onBack: () => void 
}) {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-[40%_60%]">
      {/* Left Side - Image Panel */}
      <div className="hidden md:flex relative bg-white items-center justify-center p-6">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/Tutoring.png"
            alt="Tutoring illustration"
            width={400}
            height={400}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full p-8 md:p-12 flex flex-col justify-center">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-slate-800">Choose Your Role</h1>
            <p className="text-slate-500 text-sm mt-1">
              Select how you'd like to use TutorLink
            </p>
          </div>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Student Card */}
          <button
            onClick={() => onRoleSelect("student")}
            className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  I'm a Student
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Looking for tutoring help to improve my grades and understanding
                </p>
                <div className="mt-3">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Find Tutors
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Tutor Card */}
          <button
            onClick={() => onRoleSelect("tutor")}
            className="w-full p-6 border-2 border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 text-left group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  I'm a Tutor
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Ready to share my knowledge and help students succeed
                </p>
                <div className="mt-3">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Teach Students
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8">
          You can always change your role later in settings
        </p>
      </div>
    </div>
  )
}

// Student Profile Form for OAuth users
function StudentProfileForm({ onBack, onSuccess, oauthData }: { 
  onBack: () => void
  onSuccess: () => void
  oauthData: OAuthData 
}) {
  const [formData, setFormData] = useState({
    dob: "",
    phone: "",
    address: "",
    schoolGrade: "",
    schoolName: "",
    parentName: "",
    parentPhone: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const gradeOptions = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11",
    "Grade 12", "Grade 13"
  ]

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

    if (!formData.schoolGrade) {
      newErrors.schoolGrade = "School grade is required"
    }

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School name is required"
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent name is required"
    }

    if (!formData.parentPhone) {
      newErrors.parentPhone = "Parent phone number is required"
    } else if (!/^\d{10}$/.test(formData.parentPhone)) {
      newErrors.parentPhone = "Please enter a valid 10-digit phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.oauthSignup({
        email: oauthData.email,
        fullName: oauthData.fullName,
        role: 'student',
        dob: formData.dob,
        phone: formData.phone,
        address: formData.address,
        schoolGrade: formData.schoolGrade,
        schoolName: formData.schoolName,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
      })

      authStorage.setToken(response.token)
      if (response.user) {
        authStorage.setUser(response.user)
      }
      authStorage.setActiveRole('student')

      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauthData')
        localStorage.removeItem('selectedRole')
      }

      onSuccess()

    } catch (error) {
      console.error('OAuth signup error:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-[40%_60%] overflow-hidden">
      {/* Left Side - Image Panel */}
      <div className="hidden md:flex relative bg-white items-center justify-center p-6">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/Student.png"
            alt="Student learning illustration"
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
              <p className="text-slate-500 text-sm mt-1">
                Tell us about your learning needs
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-4 min-h-0" style={{ scrollBehavior: 'smooth' }}>
          <div className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.dob ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0771234567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.phone ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none ${
                  errors.address ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* School Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                School Grade
              </label>
              <select
                value={formData.schoolGrade}
                onChange={(e) => setFormData({ ...formData, schoolGrade: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.schoolGrade ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="">Select your grade</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              {errors.schoolGrade && (
                <p className="mt-1 text-sm text-red-600">{errors.schoolGrade}</p>
              )}
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <School className="w-4 h-4 inline mr-2" />
                School Name
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="Enter your school name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.schoolName ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.schoolName && (
                <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>
              )}
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Parent/Guardian Name
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Enter parent/guardian name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.parentName ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.parentName && (
                <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>
              )}
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Parent/Guardian Phone Number
              </label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="0771234567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
                  errors.parentPhone ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.parentPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>
              )}
            </div>

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
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Completing Profile..." : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}

// Tutor Profile Form for OAuth users
function TutorProfileForm({ onBack, onSuccess, oauthData }: { 
  onBack: () => void
  onSuccess: () => void
  oauthData: OAuthData 
}) {
  const [formData, setFormData] = useState({
    dob: "",
    phone: "",
    address: "",
    idNumber: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    if (!formData.idNumber) {
      newErrors.idNumber = "National ID/NIC number is required"
    } else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(formData.idNumber)) {
      newErrors.idNumber = "Please enter a valid NIC number (e.g., 123456789V or 200012345678)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.oauthSignup({
        email: oauthData.email,
        fullName: oauthData.fullName,
        role: 'tutor',
        dob: formData.dob,
        phone: formData.phone,
        address: formData.address,
        idNumber: formData.idNumber,
      })

      authStorage.setToken(response.token)
      if (response.user) {
        authStorage.setUser(response.user)
      }
      authStorage.setActiveRole('tutor')

      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauthData')
        localStorage.removeItem('selectedRole')
      }

      onSuccess()

    } catch (error) {
      console.error('OAuth signup error:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <p className="text-slate-500 text-sm mt-1">
                Tell us about your teaching expertise
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-4 min-h-0" style={{ scrollBehavior: 'smooth' }}>
          <div className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${
                  errors.dob ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0771234567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${
                  errors.phone ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your address"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none ${
                  errors.address ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* National ID/NIC */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                National ID/NIC Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="123456789V or 200012345678"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all ${
                  errors.idNumber ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.idNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
              )}
            </div>

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
            {isSubmitting ? "Completing Profile..." : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}
