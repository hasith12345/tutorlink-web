"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/api"
import { Users, BookOpen, DollarSign, Calendar, Star, TrendingUp } from "lucide-react"

/**
 * Tutor Dashboard
 * 
 * This page is shown when:
 * - User logs in with ONLY Tutor profile
 * - User with both profiles selects Tutor role
 */
export default function TutorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!authStorage.isAuthenticated()) {
      router.push('/login')
      return
    }

    // Get user info
    const userData = authStorage.getUser()
    
    if (!userData) {
      router.push('/login')
      return
    }

    // Verify user has tutor profile
    if (!userData.hasTutorProfile) {
      router.push('/unauthorized')
      return
    }

    setUser(userData)
  }, [router])

  const handleLogout = () => {
    authStorage.clear()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Tutor Dashboard</h1>
                <p className="text-sm text-slate-500">Welcome back, {user.fullName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user.hasStudentProfile && (
                <button
                  onClick={() => {
                    authStorage.setActiveRole('student')
                    router.push('/dashboard/student')
                  }}
                  className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  Switch to Student
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total Students</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">12</p>
            <p className="text-xs text-green-600 mt-1">+3 this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Sessions This Week</h3>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">8</p>
            <p className="text-xs text-slate-500 mt-1">4 completed, 4 upcoming</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Earnings (MTD)</h3>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">$850</p>
            <p className="text-xs text-green-600 mt-1">+15% vs last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Avg Rating</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">4.8</p>
            <p className="text-xs text-slate-500 mt-1">Based on 24 reviews</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
              <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Post New Gig</p>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Manage Schedule</p>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">View Earnings</p>
            </button>
            <button className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
              <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Analytics</p>
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-purple-700">AM</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Alice Miller - Mathematics</p>
                <p className="text-xs text-slate-600">Today at 4:00 PM • 1 hour session</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                Start Session
              </button>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-slate-700">BJ</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Bob Johnson - Physics</p>
                <p className="text-xs text-slate-600">Tomorrow at 2:00 PM • 1.5 hour session</p>
              </div>
              <button className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-800">Sarah Thompson</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600">
                "Excellent tutor! Very patient and explains concepts clearly. Highly recommend!"
              </p>
              <p className="text-xs text-slate-400 mt-2">2 days ago</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-800">Mike Chen</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600">
                "Great session! Helped me understand difficult concepts in no time."
              </p>
              <p className="text-xs text-slate-400 mt-2">1 week ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
