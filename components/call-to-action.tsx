"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CallToAction() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated by checking for auth token or user data
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    const user = localStorage.getItem("user") || sessionStorage.getItem("user")
    setIsAuthenticated(!!(token || user))
  }, [])

  // Don't render if user is authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-white lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 p-10 md:p-16 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
              Start Learning or Teaching with TutorLink
            </h2>
            <p className="text-3xl md:text-1xl font-light text-white mb-8 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>
              Join our growing community of students and tutors today. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 rounded-xl"
              >
                <a href="/register">Register</a>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300 text-lg px-8 py-6 rounded-xl"
              >
                <a href="/login">Login / Register</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
