"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/api"
import { TutorNavbar } from "@/components/tutor-navbar"
import { MessagesView } from "@/components/messages-view"
import { ArrowLeft, MessageCircle } from "lucide-react"

export default function TutorMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login")
      return
    }
    const user = authStorage.getUser()
    if (!user?.hasTutorProfile) {
      router.push("/dashboard")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500">Chat with your enrolled students</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
          <MessagesView role="tutor" />
        </div>
      </main>
    </div>
  )
}
