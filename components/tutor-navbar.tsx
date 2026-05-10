"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Menu,
  X,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  User,
  Star,
  CheckCheck,
  Users,
  Calendar,
  DollarSign,
  ArrowLeftRight,
} from "lucide-react"
import { authStorage } from "@/lib/api"

const navItems = [
  { label: "Dashboard", href: "/tutor/dashboard" },
  { label: "My Classes", href: "/tutor/classes" },
  { label: "Schedule", href: "/tutor/schedule" },
  { label: "Students", href: "/tutor/students" },
  { label: "Earnings", href: "/tutor/earnings" },
  { label: "Messages", href: "/tutor/messages" },
]

export function TutorNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: "1", title: "New Enrollment", message: "Alice Miller enrolled in your Calculus class", time: "5 min ago", read: false, icon: <Users className="w-4 h-4 text-blue-500" /> },
    { id: "2", title: "Session Reminder", message: "Physics session starts in 30 minutes", time: "25 min ago", read: false, icon: <Calendar className="w-4 h-4 text-green-500" /> },
    { id: "3", title: "Payment Received", message: "Rs.5,000 received for Math tutoring", time: "1 day ago", read: true, icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
    { id: "4", title: "New Review", message: "A student left you a 5-star review", time: "2 days ago", read: true, icon: <Star className="w-4 h-4 text-amber-500" /> },
  ])
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadUserData = () => {
      const token = authStorage.getToken()
      if (token) {
        const userData = authStorage.getUser()
        setUser(userData)
      }
    }
    loadUserData()
    const handleUserDataUpdate = () => loadUserData()
    window.addEventListener("userDataUpdated", handleUserDataUpdate)
    window.addEventListener("storage", handleUserDataUpdate)
    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate)
      window.removeEventListener("storage", handleUserDataUpdate)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  const handleLogout = () => {
    authStorage.clear()
    setUser(null)
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T"
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/tutor/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="TutorLink Logo" className="w-8 h-8" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              TutorLink
            </span>
          </Link>

          {/* Center Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileOpen(false)
                }}
                className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-indigo-50/40" : ""}`}>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                          <p className="text-xs text-gray-500 truncate">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  setIsNotificationsOpen(false)
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-100">
                    {getInitials(user?.fullName || "")}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1.5">
                    {user?.hasStudentProfile && user?.hasTutorProfile && (
                      <Link href="/select-role" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                        Switch Account
                      </Link>
                    )}
                    <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-400" />
                      View Profile
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full border-t border-gray-100 mt-1.5 pt-1.5">
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
