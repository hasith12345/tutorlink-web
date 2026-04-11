"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, Bell, MessageSquare, Calendar, DollarSign, Star, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "booking" | "payment" | "review"
  title: string
  message: string
  time: string
  read: boolean
  icon: React.ReactNode
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "message",
      title: "New Message",
      message: "Sarah Johnson sent you a message about Math tutoring",
      time: "5 minutes ago",
      read: false,
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />
    },
    {
      id: "2",
      type: "booking",
      title: "Session Booked",
      message: "New tutoring session scheduled for tomorrow at 3:00 PM",
      time: "2 hours ago",
      read: false,
      icon: <Calendar className="w-5 h-5 text-green-500" />
    },
    {
      id: "3",
      type: "payment",
      title: "Payment Received",
      message: "You received $50 for Physics tutoring session",
      time: "1 day ago",
      read: true,
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />
    },
    {
      id: "4",
      type: "review",
      title: "New Review",
      message: "Alex Smith left you a 5-star review",
      time: "2 days ago",
      read: true,
      icon: <Star className="w-5 h-5 text-amber-500" />
    }
  ])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

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
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
                  notification.read
                    ? "border-slate-200 hover:border-slate-300"
                    : "border-indigo-200 hover:border-indigo-300 bg-indigo-50/30"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-base font-semibold ${
                            notification.read ? "text-slate-700" : "text-slate-900"
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            notification.read ? "text-slate-500" : "text-slate-700"
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full ml-4 flex-shrink-0 mt-2" />
                        )}
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
