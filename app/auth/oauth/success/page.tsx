"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authStorage } from '@/lib/api'

function OAuthSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      // Get the response data from query parameters
      const dataParam = searchParams.get('data')
      
      if (!dataParam) {
        setError('No authentication data received')
        setStatus('error')
        return
      }

      // Parse the response data
      const responseData = JSON.parse(decodeURIComponent(dataParam))
      console.log('OAuth response data:', responseData)

      // ✅ Check if this is a NEW user (no account created yet)
      if (responseData.isNewUser && responseData.oauthData) {
        // Store OAuth data temporarily for the signup flow
        // Account will be created when they complete their profile
        if (typeof window !== 'undefined') {
          localStorage.setItem('oauthData', JSON.stringify(responseData.oauthData))
        }
        
        // Redirect immediately to choose role page
        window.location.href = '/choose-role'
        return
      }

      // ✅ EXISTING user - they have an account
      if (!responseData.token || !responseData.user) {
        setError('Invalid authentication response')
        setStatus('error')
        return
      }

      // Store JWT token and user info
      authStorage.setToken(responseData.token)
      authStorage.setUser(responseData.user)

      const { hasStudentProfile, hasTutorProfile } = responseData.user

      // ✅ ROLE-BASED REDIRECT LOGIC - Redirect immediately
      // Case 1: User has ONLY Student profile → redirect to home page
      if (hasStudentProfile && !hasTutorProfile) {
        authStorage.setActiveRole('student')
        window.location.href = '/'
      }
      // Case 2: User has ONLY Tutor profile → redirect to dashboard
      else if (hasTutorProfile && !hasStudentProfile) {
        authStorage.setActiveRole('tutor')
        window.location.href = '/dashboard'
      }
      // Case 3: User has BOTH profiles → must select role
      else if (hasStudentProfile && hasTutorProfile) {
        window.location.href = '/select-role'
      }
      // Case 4: User has NO profiles → redirect to choose role page
      else {
        window.location.href = '/choose-role'
      }

    } catch (err) {
      console.error('OAuth success page error:', err)
      setError('Failed to process authentication data')
      setStatus('error')
    }
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Completing Sign In...</h1>
          <p className="text-slate-600">Please wait while we set up your account</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Sign In Failed</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Sign In Successful!</h1>
        <p className="text-slate-600">Redirecting you...</p>
      </div>
    </div>
  )
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  )
}