"use client"

import { useState, useEffect, useRef, Profiler } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell, Settings, ChevronDown, LogOut, Search, GraduationCap, UserSearch, MessageSquare, Calendar, DollarSign, Star, CheckCheck, User } from "lucide-react"
import { authStorage } from "@/lib/api"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<'student' | 'tutor' | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'message', title: 'New Message', message: 'Sarah Johnson sent you a message about Math tutoring', time: '5 minutes ago', read: false, icon: <MessageSquare className="w-4 h-4 text-blue-500" /> },
    { id: '2', type: 'booking', title: 'Session Booked', message: 'New tutoring session scheduled for tomorrow at 3:00 PM', time: '2 hours ago', read: false, icon: <Calendar className="w-4 h-4 text-green-500" /> },
    { id: '3', type: 'payment', title: 'Payment Received', message: 'You received $50 for Physics tutoring session', time: '1 day ago', read: true, icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
    { id: '4', type: 'review', title: 'New Review', message: 'Alex Smith left you a 5-star review', time: '2 days ago', read: true, icon: <Star className="w-4 h-4 text-amber-500" /> },
  ])
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Hide search bar on search page
  const isSearchPage = pathname === '/search'
  const isHomePage = pathname === '/'

  useEffect(() => {
    const loadUserData = () => {
      const token = authStorage.getToken()
      if (token) {
        const userData = authStorage.getUser()
        const role = authStorage.getActiveRole()
        setUser(userData)
        setActiveRole(role)
      }
    }

    loadUserData()

    // Re-read user data when avatar or profile is updated
    const handleUserDataUpdate = () => loadUserData()
    window.addEventListener('userDataUpdated', handleUserDataUpdate)
    window.addEventListener('storage', handleUserDataUpdate)

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate)
      window.removeEventListener('storage', handleUserDataUpdate)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const handleLogout = () => {
    authStorage.clear()
    setUser(null)
    router.push('/login')
  }

  const isLoggedIn = !!user

  const handleSearchBarClick = () => {
    router.push('/search')
  }

  const isTransparent = isHomePage && !scrolled

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isTransparent
        ? 'bg-transparent'
        : 'bg-white backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="TutorLink Logo" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isTransparent
                ? 'text-white'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
            }`}>
              TutorLink
            </span>
          </Link>

          {/* Airbnb-style Compact Search Bar (Desktop) - Hidden on search page */}
          {!isSearchPage && (
            <div
              ref={searchBarRef}
              onClick={handleSearchBarClick}
              className="hidden lg:flex items-center flex-1 max-w-sm ml-60 mr-auto"
            >
              <div className={`w-full rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer ${
                isTransparent
                  ? 'bg-transparent border border-white hover:bg-white/10'
                  : 'bg-white border border-gray-300'
              }`}>
                <div className={`flex items-center divide-x ${isTransparent ? 'divide-white/40' : 'divide-gray-300'}`}>
                  {/* What */}
                  <div className="flex-1 px-3 py-1.5">
                    <div className={`text-[10px] font-semibold ${isTransparent ? 'text-white' : 'text-gray-900'}`}>Subject or tutor</div>
                    {/* <div className={`text-[10px] truncate ${isTransparent ? 'text-white/70' : 'text-gray-500'}`}>Subject or tutor</div> */}
                  </div>
                  {/* Where */}
                  <div className="flex-1 px-3 py-1.5">
                    <div className={`text-[10px] font-semibold ${isTransparent ? 'text-white' : 'text-gray-900'}`}>Location</div>
                  </div>
                  {/* Mode */}
                  <div className="flex-1 px-3 py-1.5 flex items-center justify-between">
                    <div className="flex-1">
                      <div className={`text-[10px] font-semibold ${isTransparent ? 'text-white' : 'text-gray-900'}`}>Mode</div>
                    </div>
                    <button className={`ml-1.5 rounded-full p-1.5 transition-colors ${
                      isTransparent
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}>
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">{isLoggedIn ? (
              <>
                {/* Find a Tutor Button */}
                <Button
                  onClick={() => router.push('/search')}
                  variant="ghost"
                  className={`text-1xl md:text-1xl fo text-center transition-colors duration-300 ${
                    isTransparent ? 'text-white hover:bg-white/20 hover:text-white' : 'text-gray-800'
                  }`} style={{ fontFamily: 'var(--font-delicious-handrawn)' }}
                >
                  <UserSearch className="w-4 h-4 mr-2" />
                  Find a Tutor
                </Button>

                {/* Become a Tutor Button */}
                {activeRole !== 'tutor' && (
                  <Button
                    onClick={() => router.push('/become-tutor')}
                    variant="ghost"
                    className={`text-1xl md:text-1xl fo text-center transition-colors duration-300 ${
                      isTransparent ? 'text-white hover:bg-white/20 hover:text-white' : 'text-gray-800'
                    }`} style={{ fontFamily: 'var(--font-delicious-handrawn)' }}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Become a Tutor
                  </Button>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false) }}
                    className={`relative p-2 rounded-lg transition-colors ${
                      isTransparent
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <div className={`absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 transition-all duration-200 origin-top ${
                    isNotificationsOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => { setIsNotificationsOpen(false); router.push('/dashboard/notifications') }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            !notif.read ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {notif.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-800 truncate">{notif.title}</p>
                              {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100">
                      <button
                        onClick={() => { setIsNotificationsOpen(false); router.push('/dashboard/notifications') }}
                        className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      {activeRole === 'tutor' && (
                        <button
                          onClick={() => {
                            setIsProfileOpen(false)
                            router.push('/dashboard')
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          router.push('/dashboard/profile')
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          router.push('/dashboard/settings')
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          handleLogout()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Find a Tutor Button */}
                <Button
                  onClick={() => router.push('/search')}
                  variant="ghost"
                  className={`text-1xl md:text-1xl fo text-center transition-colors duration-300 ${
                    isTransparent ? 'text-white hover:bg-white/20 hover:text-white' : 'text-gray-700 hover:text-indigo-600'
                  }`} style={{ fontFamily: 'var(--font-delicious-handrawn)' }}
                >
                  <UserSearch className="w-4 h-4 mr-2" />
                  Find a Tutor
                </Button>

                {/* Become a Tutor Button */}
                <Button
                  onClick={() => router.push('/become-tutor')}
                  variant="ghost"
                  className={`text-1xl md:text-1xl fo text-center transition-colors duration-300 ${
                    isTransparent ? 'text-white hover:bg-white/20 hover:text-white' : 'text-gray-700 hover:text-indigo-600'
                  }`} style={{ fontFamily: 'var(--font-delicious-handrawn)' }}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Become a Tutor
                </Button>

                <Button variant="ghost" className={`transition-colors duration-300 ${
                  isTransparent ? 'text-white hover:bg-white/20 hover:text-white' : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                }`}>
                  <a href="/login">Login</a>
                </Button>
                <Button className={`transition-all duration-300 ${
                  isTransparent
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white shadow-md hover:shadow-lg'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg'
                }`}>
                  <a href="/register">Register</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Search Bar (Tablet/Mobile) - Hidden on search page */}
        {!isSearchPage && (
          <div className="lg:hidden pb-4">
            <div
              onClick={handleSearchBarClick}
              className="w-full bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center divide-x divide-gray-300">
                {/* What */}
                <div className="flex-1 px-4 py-2">
                  <div className="text-xs font-semibold text-gray-900">What</div>
                  <div className="text-xs text-gray-500 truncate">Search subject</div>
                </div>
                {/* Where */}
                <div className="flex-1 px-4 py-2">
                  <div className="text-xs font-semibold text-gray-900">Where</div>
                  <div className="text-xs text-gray-500 truncate">Location</div>
                </div>
                {/* Search Button */}
                <div className="px-3">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible max-h-[500px]" : "opacity-0 invisible max-h-0 pointer-events-none"
        } overflow-hidden bg-white border-t border-gray-100`}
      >
        <div className="px-4 py-4 space-y-3">
          {/* Find a Tutor Button */}
          <Button
            onClick={() => {
              router.push('/search')
              setIsOpen(false)
            }}
            className="w-full justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <UserSearch className="w-4 h-4 mr-2" />
            Find a Tutor
          </Button>

          {/* Become a Tutor Button */}
          {(!isLoggedIn || activeRole !== 'tutor') && (
            <Button
              onClick={() => {
                router.push('/become-tutor')
                setIsOpen(false)
              }}
              variant="outline"
              className="w-full justify-center border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Become a Tutor
            </Button>
          )}
          
          {isLoggedIn ? (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {activeRole === 'tutor' && (
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  router.push('/dashboard/notifications')
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
              <button
                onClick={() => {
                  router.push('/dashboard/settings')
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  router.push('/dashboard/profile')
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Button variant="outline" className="w-full justify-center bg-transparent">
                <a href="/login">Login</a>
              </Button>
              <Button className="w-full justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white">
                <a href="/register">Register</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
