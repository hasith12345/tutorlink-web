"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, XCircle, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

interface RegisterFormProps {
  onSignUpClick?: (userData: { fullName: string; email: string; password: string }) => void
}

export function RegisterForm({ onSignUpClick }: RegisterFormProps = {}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isChecking, setIsChecking] = useState(false)
  // null = unchecked, true = available, false = taken
  const [emailStatus, setEmailStatus] = useState<null | true | false>(null)

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" }
    
    let score = 0
    const hasLength = pwd.length >= 8 && pwd.length <= 12
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasLowercase = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSpecialChar = /[!@#$%^&*]/.test(pwd)
    
    if (hasLength) score++
    if (hasUppercase) score++
    if (hasLowercase) score++
    if (hasNumber) score++
    if (hasSpecialChar) score++
    
    if (score <= 2) return { strength: score, label: "Weak", color: "bg-red-500" }
    if (score <= 4) return { strength: score, label: "Medium", color: "bg-yellow-500" }
    return { strength: score, label: "Strong", color: "bg-green-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Full name is required"
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8 || password.length > 12) {
      newErrors.password = "Password must be 8-12 characters"
    } else {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        newErrors.password = "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*)"
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Prevent double-submits
    if (isChecking) return
    setIsChecking(true)
    setEmailStatus(null)

    try {
      const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (data.exists) {
        setEmailStatus(false)
        setErrors(prev => ({
          ...prev,
          email: "An account with this email already exists. Please login instead.",
        }))
        setIsChecking(false)
        return
      }

      setEmailStatus(true)
    } catch {
      // Network error — still let the user proceed; server will validate
      setEmailStatus(true)
    } finally {
      setIsChecking(false)
    }

    // Email is available — move to role selection
    if (onSignUpClick) {
      onSignUpClick({
        fullName: name.trim(),
        email: email.trim(),
        password: password,
      })
    }
  }

  // Real-time check when user leaves the email field
  const handleEmailBlur = useCallback(async () => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return
    try {
      const res = await fetch(`${API_BASE}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()
      if (data.exists) {
        setEmailStatus(false)
        setErrors(prev => ({
          ...prev,
          email: "An account with this email already exists. Please login instead.",
        }))
      } else {
        setEmailStatus(true)
        setErrors(prev => ({ ...prev, email: "" }))
      }
    } catch {
      // ignore network errors on blur check
    }
  }, [email])

  // ✅ Handle Google OAuth signup
  const handleGoogleSignup = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
    // Pass mode=signup to indicate this is a new account signup
    window.location.href = `${backendUrl}/auth/oauth/login?mode=signup`
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">Create Account</h1>
      <p className="text-slate-500 text-sm mb-3 text-center">Start your journey with us today</p>

      {/* Social Login - Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full mb-4 px-4 py-3 border border-slate-300 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-all duration-200 bg-white cursor-pointer"
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

      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-02 text-slate-400">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors(prev => ({ ...prev, name: "" }))
            }}
            className={`w-full pl-11 pr-4 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 ${
              errors.name ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailStatus(null)
              setErrors(prev => ({ ...prev, email: "" }))
            }}
            onBlur={handleEmailBlur}
            className={`w-full pl-11 pr-10 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 ${
              errors.email ? "ring-2 ring-red-500" : emailStatus === true ? "ring-2 ring-green-500" : ""
            }`}
            required
          />
          {/* Status icon */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {emailStatus === true && !errors.email && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {emailStatus === false && (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </span>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
          {emailStatus === true && !errors.email && (
            <p className="mt-1 text-xs text-green-600">Email is available</p>
          )}
        </div>

        <div>
          <div className="relative mb-2">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (Example@123)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors(prev => ({ ...prev, password: "" }))
              }}
              className={`w-full pl-11 pr-11 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 ${
                errors.password ? "ring-2 ring-red-500" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {password && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">Password Strength:</span>
                <span className={`text-xs font-semibold ${
                  passwordStrength.label === "Weak" ? "text-red-500" :
                  passwordStrength.label === "Medium" ? "text-yellow-500" :
                  "text-green-500"
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors(prev => ({ ...prev, confirmPassword: "" }))
            }}
            className={`w-full pl-11 pr-11 py-3 bg-slate-100 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 ${
              errors.confirmPassword ? "ring-2 ring-red-500" : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isChecking}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
          ) : (
            "Sign Up"
          )}
        </button>
        <p className="text-black/50 text-xs max-w-xs mx-auto leading-relaxed">
            By signing up, you agree to our <span className="underline cursor-pointer hover:text-blue-500">Terms</span> & <span className="underline cursor-pointer hover:text-blue-500">Privacy Policy</span>
        </p>
      </form>
    </div>
  )
}
