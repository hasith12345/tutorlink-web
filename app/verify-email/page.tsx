"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { authStorage } from "@/lib/api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
      router.push('/register')
    }
  }, [email, router])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6)
    setCode(newCode)

    // Focus last filled input or last input
    const lastFilledIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastFilledIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode
        }),
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        // ── Auto-login: store token + user, skip the login page ──
        if (data.token && data.user) {
          authStorage.setToken(data.token)
          authStorage.setUser(data.user)

          const { hasStudentProfile, hasTutorProfile } = data.user

          setSuccess(true)
          setTimeout(() => {
            if (hasStudentProfile && hasTutorProfile) {
              window.location.href = '/select-role'
            } else if (hasTutorProfile) {
              authStorage.setActiveRole('tutor')
              window.location.href = '/tutor/dashboard'
            } else if (hasStudentProfile) {
              authStorage.setActiveRole('student')
              window.location.href = '/search'
            } else {
              window.location.href = '/'
            }
          }, 1500)
        } else {
          // Fallback (old backend) — just go to login
          setSuccess(true)
          setTimeout(() => { router.push('/login') }, 2000)
        }
      } else {
        setError(data.message || 'Verification failed. Please try again.')
        if (data.expired) {
          setResendCooldown(0) // Allow immediate resend if code expired
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setResendLoading(true)
    setError("")

    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.sent) {
        setResendCooldown(60) // 60 second cooldown
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        setError(data.message || 'Failed to resend code. Please try again.')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Email Verified!</h1>
          <p className="text-slate-600 mb-4">Your account has been successfully verified.</p>
          <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/register')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign Up</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Verify Your Email</h1>
            <p className="text-slate-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-indigo-600 font-semibold mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mb-8">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-100 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.join("").length !== 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s` 
                  : resendLoading 
                    ? 'Sending...' 
                    : 'Resend Code'
                }
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Make sure to check your spam folder if you don't see the email.
              The code expires in 15 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
