"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, AlertCircle, XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { authStorage, api } from "@/lib/api"

export default function TutorApplicationStatusPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState<string>("PENDING")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const userData = authStorage.getUser()
      if (!userData) { router.push('/login'); return }
      setUser(userData)

      try {
        const res = await api.getTutorApplicationStatus()
        setStatus(res.tutorStatus)
      } catch {
        setStatus(userData.tutorStatus || "PENDING")
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [router])

  if (isLoading) {
    return <LoadingSpinner size="lg" fullPage />
  }

  if (status === "REJECTED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />Back
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Application Not Approved</h1>
              <p className="text-gray-500">
                Your tutor application was reviewed but could not be approved at this time. Your previously submitted documents have been cleared.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 space-y-1">
                  <p className="font-medium">What you can do:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Review and resubmit your qualifications and documents</li>
                    <li>Ensure your NIC copies are clear and valid</li>
                    <li>Contact our support team if you need assistance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{user?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    Not Approved
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => router.push('/complete-tutor-application')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Apply Again
              </button>
              <button
                onClick={() => router.push('/contact-us')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PENDING state (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Application Pending Review</h1>
            <p className="text-gray-500">
              Your tutor profile has been successfully created and is awaiting admin approval.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 space-y-2">
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Our admin team will review your qualifications and documents</li>
                  <li>We'll verify your NIC and CV if provided</li>
                  <li>You'll receive an email once your profile is approved or if we need more information</li>
                  <li>Once approved, you can create classes and start accepting students</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Application Timeline</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200 my-2" />
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">Profile Created</p>
                  <p className="text-sm text-gray-500">You've submitted your tutor profile</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200 my-2" />
                </div>
                <div className="pb-4">
                  <p className="font-medium text-gray-900">Under Review</p>
                  <p className="text-sm text-gray-500">Admin team is verifying your details (1-3 days)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Approved & Ready to Teach</p>
                  <p className="text-sm text-gray-500">Start creating classes and connecting with students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Profile Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  Pending Approval
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => router.push('/tutor/dashboard')}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
