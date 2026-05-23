"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  DollarSign,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { api } from "@/lib/api"

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Tutor Approvals", href: "/admin/tutor-approvals", icon: ShieldCheck },
  { label: "Accounts", href: "/admin/accounts", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: DollarSign },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminUnreadCount, setAdminUnreadCount] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (pathname === "/admin/login") { setChecking(false); return }
    const auth = localStorage.getItem("adminAuth")
    if (!auth) { router.replace("/admin/login") } else { setChecking(false) }
  }, [pathname, router])

  useEffect(() => {
    if (pathname === "/admin/login") return

    const fetchCount = async () => {
      try {
        const { count } = await api.getAdminUnreadCount()
        setAdminUnreadCount(count)
      } catch {}
    }

    fetchCount()
    pollRef.current = setInterval(fetchCount, 15000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  if (pathname === "/admin/login") return <>{children}</>

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300
          bg-gradient-to-b from-purple-600 via-indigo-600 to-blue-600
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}
      >
        {/* Logo — same height as topbar (h-16) */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/15 flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="TutorLink" className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-white text-base leading-tight block">TutorLink</span>
          </div>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/15 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar — h-16 to match sidebar logo area */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center flex-shrink-0">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-700 text-sm">Admin Portal</span>
          <div className="ml-auto">
            <Link href="/admin/notifications" className="relative p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors inline-flex">
              <Bell className="w-5 h-5" />
              {adminUnreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                  {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
