"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function OAuthErrorPage() {
  const [error, setError] = useState<string>('Authentication failed')
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Google Sign In Failed</h1>
        <p className="text-slate-600 mb-6">{error}</p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </button>
          <button
            onClick={() => {
              const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
              window.location.href = `${backendUrl}/auth/oauth/login`
            }}
            className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Try Google Sign In Again
          </button>
        </div>
      </div>
    </div>
  )
}