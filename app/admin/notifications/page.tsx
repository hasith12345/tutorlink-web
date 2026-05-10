"use client"

import { Bell, Send, Users, Megaphone } from "lucide-react"
import { useState } from "react"

export default function NotificationsPage() {
  const [message, setMessage] = useState("")
  const [target, setTarget] = useState("all")

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm">Send platform-wide announcements and notifications</p>
          </div>
        </div>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Megaphone className="w-4 h-4 text-purple-500" />
          <h2 className="font-semibold text-gray-800">Send Announcement</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <div className="flex gap-3">
              {[
                { value: "all", label: "All Users", icon: Users },
                { value: "students", label: "Students", icon: Users },
                { value: "tutors", label: "Tutors", icon: Users },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTarget(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    target === value
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your announcement here..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          <button
            disabled={!message.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Notification History</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">No notifications sent yet</p>
          <p className="text-sm text-gray-400 mt-1">Sent announcements will appear here</p>
        </div>
      </div>
    </div>
  )
}
