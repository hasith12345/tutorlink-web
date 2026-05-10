"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

/**
 * Complete Profile Page
 * 
 * This page now redirects to the unified OAuth signup flow at /choose-role
 * which handles role selection AND profile completion with animations.
 * 
 * Kept for backwards compatibility - redirects to the new flow.
 */

function CompleteProfileContent() {
  const router = useRouter()

  useEffect(() => {
    // Check for OAuth data - if present, redirect to the unified flow
    const oauthDataStr = typeof window !== 'undefined' ? localStorage.getItem('oauthData') : null
    
    if (oauthDataStr) {
      // Redirect to the unified OAuth signup flow
      router.push('/choose-role')
    } else {
      // No OAuth data - redirect to register
      router.push('/register')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
