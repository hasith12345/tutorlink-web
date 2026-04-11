"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { api, authStorage } from "@/lib/api"

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600" : "text-slate-400"}`}>
      {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </li>
  )
}

export default function ChangePasswordPage() {
  const router = useRouter()
  // Capture at mount — stays true even after we flip isOAuthUser to false on success
  const wasOAuthUser = useRef(authStorage.getUser()?.isOAuthUser ?? false)
  const isOAuthUser = wasOAuthUser.current
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const rules = {
    length: newPassword.length >= 8 && newPassword.length <= 12,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
  }
  const allRulesMet = Object.values(rules).every(Boolean)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!authStorage.isAuthenticated()) {
      router.push("/login")
      return
    }
    if (!isOAuthUser && !currentPassword) {
      setError("Current password is required.")
      return
    }
    if (!allRulesMet) {
      setError("New password does not meet the requirements.")
      return
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      if (isOAuthUser) {
        await api.setPassword(newPassword)
        // After setting, they're no longer OAuth-only — update stored user
        const user = authStorage.getUser()
        if (user) authStorage.setUser({ ...user, isOAuthUser: false })
      } else {
        await api.changePassword(currentPassword, newPassword)
      }
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{isOAuthUser ? "Set Password" : "Change Password"}</h1>
              <p className="text-sm text-slate-500">
                {isOAuthUser
                  ? "Create a password to also log in with your email"
                  : "Update your account password securely"}
              </p>
            </div>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {isOAuthUser ? "Password set successfully!" : "Password changed successfully!"}
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {isOAuthUser
                    ? "You can now log in with your email and new password."
                    : "Your new password is now active."}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isOAuthUser && (
              <PasswordInput
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter your current password"
              />
            )}

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter your new password"
            />

            {/* Password rules */}
            {newPassword.length > 0 && (
              <ul className="space-y-1 pl-1">
                <Rule met={rules.length} label="8–12 characters" />
                <Rule met={rules.upper} label="At least 1 uppercase letter" />
                <Rule met={rules.lower} label="At least 1 lowercase letter" />
                <Rule met={rules.number} label="At least 1 number" />
                <Rule met={rules.special} label="At least 1 special character (!@#$%^&*)" />
              </ul>
            )}

            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter your new password"
            />

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <p className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                {passwordsMatch ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                ) : (
                  <><XCircle className="w-3.5 h-3.5" /> Passwords do not match</>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (!isOAuthUser && !currentPassword) || !allRulesMet || !passwordsMatch}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isOAuthUser ? "Setting password..." : "Updating password..."}</>
              ) : (
                isOAuthUser ? "Set Password" : "Update Password"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
