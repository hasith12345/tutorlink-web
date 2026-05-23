"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Bell, CheckCheck, Trash2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { format } from "date-fns"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-slate-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-400 text-sm">Loading…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  notification.read
                    ? "border-slate-200 hover:border-slate-300"
                    : "border-indigo-200 hover:border-indigo-300 bg-indigo-50/30"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className={`text-base font-semibold ${notification.read ? "text-slate-700" : "text-slate-900"}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${notification.read ? "text-slate-500" : "text-slate-700"}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {format(new Date(notification.createdAt), 'MMM d, yyyy · h:mm a')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
