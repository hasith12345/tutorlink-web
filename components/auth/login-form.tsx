"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { api, authStorage } from "@/lib/api"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await api.login({ email, password })

      // ✅ Store JWT token
      authStorage.setToken(response.token)

      // ✅ Check if response contains user object (new format)
      if (response.user) {
        // Store user info
        authStorage.setUser(response.user)

        const { hasStudentProfile, hasTutorProfile } = response.user

        // ✅ ROLE-BASED REDIRECT LOGIC
        // Case 1: User has ONLY Student profile → redirect to search page
        if (hasStudentProfile && !hasTutorProfile) {
          authStorage.setActiveRole('student')
          window.location.href = '/search'
        }
        // Case 2: User has ONLY Tutor profile → redirect to tutor dashboard
        else if (hasTutorProfile && !hasStudentProfile) {
          authStorage.setActiveRole('tutor')
          window.location.href = '/tutor/dashboard'
        }
        // Case 3: User has BOTH profiles → must select role
        else if (hasStudentProfile && hasTutorProfile) {
          window.location.href = '/select-role'
        }
        // Case 4: User has NO profiles → redirect to complete profile
        else {
          window.location.href = '/complete-profile'
        }
      } else {
        // Fallback for old response format (during transition)
        authStorage.setRole(response.role!)
        window.location.href = '/dashboard'
      }

    } catch (error: any) {
      console.error('Login error:', error)
      
      // Check if error is due to unverified email
      if (error.message?.includes('verify your email')) {
        // Redirect to verification page
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Handle Google OAuth login
  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
    // Pass mode=login to indicate this is a sign-in attempt (requires existing account)
    window.location.href = `${backendUrl}/auth/oauth/login?mode=login`
  }


  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">Sign In</h1>
      <p className="text-slate-500 text-sm mb-6 text-center">Welcome back! Please enter your details</p>

      {/* Social Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full mb-6 px-4 py-3 border border-slate-300 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all duration-200 bg-white cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-slate-700 font-medium">Continue with Google</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("")
            }}
            className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("")
            }}
            className="w-full pl-11 pr-11 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => window.location.href = '/forgot-password'}
            className="text-sm text-indigo-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-black/50 text-xs max-w-xs mx-auto leading-relaxed">
            By signing in, you agree to our <span className="underline cursor-pointer hover:text-blue-500">Terms</span> & <span className="underline cursor-pointer hover:text-blue-500">Privacy Policy</span>
        </p>
      </form>
    </div>
  )
}
