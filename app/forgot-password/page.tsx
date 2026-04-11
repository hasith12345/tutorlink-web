"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    try {
      await api.forgotPassword(email.trim())
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Back */}
        <button
          onClick={() => router.push("/login")}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Forgot Password</h1>
              <p className="text-sm text-slate-500">We'll send you a reset link via email</p>
            </div>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Check your inbox!</p>
                <p className="text-xs text-green-700 mt-0.5">
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent.
                  Check your spam folder if you don't see it.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null) }}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending reset link...</>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setSuccess(false); setEmail("") }}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                Send to a different email
              </button>
              <button
                onClick={() => router.push("/login")}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
