"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/api"
import { OAuthSignupContainer } from "@/components/auth/oauth-signup-container"

/**
 * Choose Role Page
 * 
 * This page is shown when a new OAuth user needs to complete their signup.
 * It uses the OAuthSignupContainer for smooth animated transitions
 * between role selection and profile completion forms.
 * 
 * Flow:
 * 1. User completes OAuth authentication (Google)
 * 2. User has no account yet (oauthData stored in localStorage)
 * 3. User is redirected here for animated signup flow
 * 4. After completing profile, account is created
 */

interface OAuthData {
  email: string
  fullName: string
  picture?: string
}

export default function ChooseRolePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [oauthData, setOauthData] = useState<OAuthData | null>(null)

  useEffect(() => {
    // Check for OAuth data (new OAuth user who hasn't created account yet)
    const oauthDataStr = typeof window !== 'undefined' ? localStorage.getItem('oauthData') : null
    
    if (oauthDataStr) {
      try {
        const parsedData = JSON.parse(oauthDataStr) as OAuthData
        setOauthData(parsedData)
        setIsLoading(false)
        return
      } catch (e) {
        console.error('Failed to parse OAuth data:', e)
      }
    }

    // Check if user is already authenticated (existing user)
    if (authStorage.isAuthenticated()) {
      const userData = authStorage.getUser()
      
      if (userData) {
        // If user already has a profile, redirect them appropriately
        if (userData.hasStudentProfile || userData.hasTutorProfile) {
          if (userData.hasStudentProfile && userData.hasTutorProfile) {
            router.push('/select-role')
          } else if (userData.hasStudentProfile) {
            authStorage.setActiveRole('student')
            router.push('/')
          } else if (userData.hasTutorProfile) {
            authStorage.setActiveRole('tutor')
            router.push('/dashboard')
          }
          return
        }
      }
    }

    // No OAuth data and not authenticated - redirect to register
    if (!oauthDataStr && !authStorage.isAuthenticated()) {
      router.push('/register')
      return
    }

    setIsLoading(false)
  }, [router])

  const handleCancel = () => {
    // Clear OAuth data and go back to register page
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oauthData')
      localStorage.removeItem('selectedRole')
    }
    authStorage.clear()
    router.push('/register')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!oauthData) {
    return null
  }

  return (
    <OAuthSignupContainer 
      oauthData={oauthData} 
      onCancel={handleCancel} 
    />
  )
}
