'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { api, authStorage, type Notification } from '@/lib/api'

const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')

function isPushEnabled() {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem('pushNotificationsEnabled')
  return stored === null ? true : stored === 'true'
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(isPushEnabled)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    const handleChange = () => setPushEnabled(isPushEnabled())
    window.addEventListener('pushNotificationsChanged', handleChange)
    return () => window.removeEventListener('pushNotificationsChanged', handleChange)
  }, [])

  useEffect(() => {
    const token = authStorage.getToken()
    if (!token || !pushEnabled) {
      setLoading(false)
      if (!pushEnabled) {
        setNotifications([])
        setUnreadCount(0)
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
        }
      }
      return
    }

    api
      .getNotifications()
      .then(({ notifications: list }) => {
        setNotifications(list)
        setUnreadCount(list.filter((n) => !n.read).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      socket.on('notification', (notif: Notification) => {
        setNotifications((prev) => [notif, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      socketRef.current = socket
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [pushEnabled])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.deleteNotification(id)
      setNotifications((prev) => {
        const notif = prev.find((n) => n.id === id)
        if (notif && !notif.read) setUnreadCount((c) => Math.max(0, c - 1))
        return prev.filter((n) => n.id !== id)
      })
    } catch {}
  }, [])

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification }
}
