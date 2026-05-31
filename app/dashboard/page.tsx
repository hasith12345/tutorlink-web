"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login")
      return
    }

    const userData = authStorage.getUser()
    if (!userData) {
      router.push("/login")
      return
    }

    const role = authStorage.getActiveRole()

    if (!role) {
      if (userData.hasStudentProfile && !userData.hasTutorProfile) {
        authStorage.setActiveRole("student")
        router.push("/dashboard/my-classes")
      } else if (userData.hasTutorProfile && !userData.hasStudentProfile) {
        authStorage.setActiveRole("tutor")
        router.push("/tutor/dashboard")
      } else if (userData.hasStudentProfile && userData.hasTutorProfile) {
        router.push("/select-role")
      } else {
        router.push("/complete-profile")
      }
    } else if (role === "tutor") {
      router.push("/tutor/dashboard")
    } else {
      router.push("/dashboard/my-classes")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
