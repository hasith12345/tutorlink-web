'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { api, authStorage, type ConversationSummary, type ChatMessage } from '@/lib/api'

const SOCKET_URL =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')

export function useMessages(activeConversationId: string | null = null, role?: 'student' | 'tutor') {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [incomingMessage, setIncomingMessage] = useState<ChatMessage | null>(null)
  const socketRef = useRef<any>(null)
  const activeIdRef = useRef<string | null>(activeConversationId)

  useEffect(() => {
    activeIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    const token = authStorage.getToken()
    if (!token) return

    import('socket.io-client').then(({ io }) => {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      socket.on('message:new', (msg: ChatMessage) => {
        // Bubble the message up for the chat view to handle
        setIncomingMessage(msg)

        // Try to update existing conversation, or refetch if it's new
        setConversations((prev) => {
          const existing = prev.find((c) => c.id === msg.conversationId)
          if (!existing) {
            // New conversation — refetch full list to pick it up
            api.getConversations(role)
              .then(({ conversations: list }) => setConversations(list))
              .catch(() => {})
            return prev
          }
          return prev.map((c) => {
            if (c.id !== msg.conversationId) return c
            return {
              ...c,
              lastMessage: msg,
              unreadCount: c.id === activeIdRef.current ? 0 : c.unreadCount + 1,
              updatedAt: msg.createdAt,
            }
          })
        })
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

  // When the active conversation changes, reset unread count for it
  useEffect(() => {
    if (!activeConversationId) return
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
    )
  }, [activeConversationId])

  const clearIncoming = useCallback(() => setIncomingMessage(null), [])

  return { conversations, setConversations, incomingMessage, clearIncoming }
}
