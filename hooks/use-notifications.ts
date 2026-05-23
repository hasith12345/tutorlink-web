'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { api, authStorage, type Notification } from '@/lib/api'

const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<any>(null)

  useEffect(() => {
    const token = authStorage.getToken()
    if (!token) {
      setLoading(false)
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
  }, [])

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
