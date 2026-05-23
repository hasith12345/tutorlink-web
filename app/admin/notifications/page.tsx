"use client"

import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { api, type Notification } from "@/lib/api"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const { notifications: list } = await api.getAdminNotifications()
      setNotifications(list)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAdminAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAdminAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {}
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAdminNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {}
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-500 text-sm">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72 max-w-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Platform events will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 transition-colors ${!n.read ? "bg-purple-50/40" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${!n.read ? "text-gray-900" : "text-gray-700"}`}>
                          {n.title}
                        </p>
                        <p className={`text-sm mt-0.5 ${!n.read ? "text-gray-700" : "text-gray-500"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {format(new Date(n.createdAt), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
