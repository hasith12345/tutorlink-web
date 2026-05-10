"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/api"
import { GraduationCap, Users, ArrowRight } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

/**
 * Role Selection Page
 * 
 * This page is shown ONLY when a user has BOTH Student and Tutor profiles.
 * The user must select which role they want to use for the current session.
 * 
 * Flow:
 * 1. User logs in
 * 2. Backend detects: hasStudentProfile=true AND hasTutorProfile=true
 * 3. Login redirects here
 * 4. User selects role
 * 5. activeRole is saved in localStorage
 * 6. User is redirected to their dashboard
 */
export default function SelectRolePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!authStorage.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Get user info
    const userData = authStorage.getUser()
    
    if (!userData) {
      router.push('/login')
      return
    }

    // Verify user has both profiles (they should to see this page)
    if (!userData.hasStudentProfile || !userData.hasTutorProfile) {
      // User doesn't have both roles, redirect based on what they have
      if (userData.hasStudentProfile) {
        authStorage.setActiveRole('student')
        router.push('/dashboard')
      } else if (userData.hasTutorProfile) {
        authStorage.setActiveRole('tutor')
        router.push('/tutor/dashboard')
      } else {
        router.push('/complete-profile')
      }
      return
    }

    setUser(userData)
    setIsLoading(false)
  }, [router])

  const handleRoleSelection = (role: 'student' | 'tutor') => {
    // Save the selected role as active
    authStorage.setActiveRole(role)
    
    // Redirect: Students → Home page, Tutors → Tutor Dashboard
    if (role === 'student') {
      router.push('/')
    } else {
      router.push('/tutor/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Welcome back, {user?.fullName || 'User'}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            You have access to both Student and Tutor profiles.
          </p>
          <p className="text-slate-500 mt-2">
            Choose how you'd like to continue:
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Card */}
          <button
            onClick={() => handleRoleSelection('student')}
            className="group relative bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-indigo-600" />
            </div>

            <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
              <GraduationCap className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Continue as Student
            </h2>
            <p className="text-slate-600 mb-4">
              Access your courses, find tutors, and manage your learning journey.
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></div>
                Browse tutor profiles
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></div>
                Book tutoring sessions
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></div>
                Track your progress
              </div>
            </div>

            <div className="mt-6 inline-flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
              Browse as Student
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          {/* Tutor Card */}
          <button
            onClick={() => handleRoleSelection('tutor')}
            className="group relative bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 text-left"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-6 h-6 text-purple-600" />
            </div>

            <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <Users className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Continue as Tutor
            </h2>
            <p className="text-slate-600 mb-4">
              Manage your students, create courses, and share your expertise.
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                Manage student bookings
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                Post tutoring gigs
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                Track your earnings
              </div>
            </div>

            <div className="mt-6 inline-flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
              Enter Dashboard as Tutor
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            💡 You can switch between roles anytime from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
