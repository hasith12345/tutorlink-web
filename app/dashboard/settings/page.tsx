"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Bell, Lock } from "lucide-react"
import { api, authStorage } from "@/lib/api"

export default function SettingsPage() {
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isOAuthUser, setIsOAuthUser] = useState(authStorage.getUser()?.isOAuthUser ?? false)

  // Fetch fresh profile from server so isOAuthUser is always accurate
  useEffect(() => {
    api.getProfile().then((profile: any) => {
      setIsOAuthUser(profile.isOAuthUser ?? false)
      // Keep localStorage in sync
      const stored = authStorage.getUser()
      if (stored) authStorage.setUser({ ...stored, isOAuthUser: profile.isOAuthUser ?? false })
    }).catch(() => {/* silently ignore */})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="font-medium text-slate-800">Email Notifications</p>
                <p className="text-sm text-slate-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-800">Push Notifications</p>
                <p className="text-sm text-slate-500">Receive push notifications</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotifications ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pushNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Security</h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard/settings/change-password')}
              className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
              <p className="font-medium text-slate-800">{isOAuthUser ? "Set Password" : "Change Password"}</p>
              <p className="text-sm text-slate-500 mt-1">
                {isOAuthUser
                  ? "Create a password so you can also log in with email"
                  : "Update your account password"}
              </p>
            </button>

            <button className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
              <p className="font-medium text-slate-800">Two-Factor Authentication</p>
              <p className="text-sm text-slate-500 mt-1">Add an extra layer of security</p>
            </button>

            <button className="w-full text-left p-4 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all">
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-slate-500 mt-1">Permanently delete your account</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
