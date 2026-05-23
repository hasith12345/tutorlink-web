"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { api, type ConversationSummary, type ChatMessage } from "@/lib/api"
import { useMessages } from "@/hooks/use-messages"
import { MessageCircle, Send, ArrowLeft, Loader2 } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"

function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
  if (avatar) return <img src={avatar} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0`} />
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

function formatMessageTime(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, "h:mm a")
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`
  return format(d, "MMM d, h:mm a")
}

function formatConvTime(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, "h:mm a")
  if (isYesterday(d)) return "Yesterday"
  return format(d, "MMM d")
}

interface Props {
  initialTutorId?: string | null
  role?: "student" | "tutor"
}

export function MessagesView({ initialTutorId, role = "student" }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [otherParty, setOtherParty] = useState<ConversationSummary["otherParty"] | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [initError, setInitError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { conversations, setConversations, incomingMessage, clearIncoming } = useMessages(selectedId, role)

  // Load conversations on mount
  useEffect(() => {
    api.getConversations(role)
      .then(({ conversations: list }) => setConversations(list))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [])

  // Auto-open conversation when initialTutorId is provided (student entry from class detail)
  useEffect(() => {
    if (!initialTutorId || loadingConvs) return
    setInitError(null)
    const existing = conversations.find((c) => c.otherParty.id === initialTutorId)
    if (existing) {
      openConversation(existing.id, existing.otherParty)
    } else {
      api.createOrGetConversation(initialTutorId)
        .then(({ conversation }) => {
          setConversations((prev) => {
            if (prev.find((c) => c.id === conversation.id)) return prev
            return [{ ...conversation, lastMessage: null, unreadCount: 0 }, ...prev]
          })
          openConversation(conversation.id, conversation.otherParty)
        })
        .catch((err: Error) => setInitError(err.message))
    }
  }, [initialTutorId, loadingConvs])

  // Append incoming Socket.io messages to active chat
  useEffect(() => {
    if (!incomingMessage) return
    if (incomingMessage.conversationId === selectedId) {
      setMessages((prev) => [...prev, incomingMessage])
      api.markConversationRead(selectedId).catch(() => {})
    }
    clearIncoming()
  }, [incomingMessage])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const openConversation = useCallback(async (id: string, party: ConversationSummary["otherParty"]) => {
    setSelectedId(id)
    setOtherParty(party)
    setMobileView("chat")
    setLoadingMsgs(true)
    setMessages([])
    try {
      const { conversation } = await api.getConversationMessages(id)
      setMessages(conversation.messages)
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unreadCount: 0 } : c))
    } catch {}
    setLoadingMsgs(false)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return
    const text = input.trim()
    setInput("")
    setSending(true)
    try {
      const { message } = await api.sendMessage(selectedId, text)
      setMessages((prev) => [...prev, message])
      setConversations((prev) =>
        prev.map((c) => c.id === selectedId ? { ...c, lastMessage: message, updatedAt: message.createdAt } : c)
      )
    } catch {}
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="flex h-full bg-white rounded-2xl overflow-hidden">
      {/* Conversation List */}
      <div className={`${mobileView === "chat" ? "hidden md:flex" : "flex"} flex-col w-full md:w-72 lg:w-80 bg-white border-r border-gray-100 flex-shrink-0`}>
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-700">Conversations</p>
          {totalUnread > 0 && (
            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        {loadingConvs ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            {initError ? (
              <>
                <p className="font-medium text-red-600 text-sm">Could not start conversation</p>
                <p className="text-xs text-gray-400 mt-1">{initError}</p>
                {role === "student" && (
                  <a href="/dashboard/my-classes" className="mt-3 text-xs text-indigo-600 hover:underline font-medium">
                    Go to My Classes →
                  </a>
                )}
              </>
            ) : role === "tutor" ? (
              <>
                <p className="font-medium text-gray-700">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">When a student messages you, the conversation will appear here.</p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-700">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">Open a class in My Classes and tap <strong>Message Tutor</strong> to start chatting.</p>
                <a href="/dashboard/my-classes" className="mt-3 text-xs text-indigo-600 hover:underline font-medium">
                  Go to My Classes →
                </a>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id, conv.otherParty)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${selectedId === conv.id ? "bg-indigo-50/60" : ""}`}
              >
                <div className="relative">
                  <Avatar name={conv.otherParty.name} avatar={conv.otherParty.avatar} />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>
                      {conv.otherParty.name}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                      {conv.lastMessage ? formatConvTime(conv.lastMessage.createdAt) : formatConvTime(conv.updatedAt)}
                    </span>
                  </div>
                  {conv.lastMessage && (
                    <p className={`text-xs mt-0.5 truncate ${conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {conv.lastMessage.isMine ? "You: " : ""}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <div className={`${mobileView === "list" ? "hidden md:flex" : "flex"} flex-col flex-1 min-w-0`}>
        {!selectedId ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="font-semibold text-gray-700 text-lg">Select a conversation</p>
            <p className="text-sm text-gray-400 mt-1">Choose a conversation from the list to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-100 shadow-sm">
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {otherParty && <Avatar name={otherParty.name} avatar={otherParty.avatar} />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{otherParty?.name}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${
                  otherParty?.role === "tutor"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${otherParty?.role === "tutor" ? "bg-green-500" : "bg-blue-500"}`}></span>
                  {otherParty?.role === "tutor" ? "Tutor" : "Student"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 bg-gradient-to-b from-gray-50/50 to-gray-50">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle className="w-7 h-7 text-indigo-400" />
                  </div>
                  <p className="font-medium text-gray-700">Start the conversation</p>
                  <p className="text-sm text-gray-400 mt-1">Send a message to {otherParty?.name?.split(" ")[0]} to get started</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const prev = messages[idx - 1]
                  const next = messages[idx + 1]
                  const isFirstInGroup = !prev || prev.senderId !== msg.senderId
                  const isLastInGroup = !next || next.senderId !== msg.senderId
                  const showDateDivider = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString()
                  return (
                    <div key={msg.id}>
                      {showDateDivider && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            {formatMessageTime(msg.createdAt).includes("Yesterday") ? "Yesterday" :
                              new Date(msg.createdAt).toDateString() === new Date().toDateString() ? "Today" :
                              format(new Date(msg.createdAt), "MMMM d, yyyy")}
                          </span>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                      )}
                      <div className={`flex ${msg.isMine ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : "mb-0.5"}`}>
                        <div className={`max-w-[75%] flex flex-col ${msg.isMine ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                              msg.isMine
                                ? `bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-200 ${
                                    isFirstInGroup && isLastInGroup ? "rounded-2xl"
                                    : isFirstInGroup ? "rounded-2xl rounded-br-md"
                                    : isLastInGroup ? "rounded-2xl rounded-tr-md"
                                    : "rounded-2xl rounded-r-md"
                                  }`
                                : `bg-white text-gray-900 border border-gray-100 shadow-sm ${
                                    isFirstInGroup && isLastInGroup ? "rounded-2xl"
                                    : isFirstInGroup ? "rounded-2xl rounded-bl-md"
                                    : isLastInGroup ? "rounded-2xl rounded-tl-md"
                                    : "rounded-2xl rounded-l-md"
                                  }`
                            }`}
                          >
                            {msg.content}
                          </div>
                          {isLastInGroup && (
                            <p className={`text-[10px] mt-1 px-1 text-gray-400`}>
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-end gap-2 bg-gray-50 hover:bg-gray-100/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-300 border border-gray-200 rounded-2xl px-3 py-2 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${otherParty?.name?.split(" ")[0] || ""}…`}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm focus:outline-none max-h-32 leading-relaxed py-1.5 placeholder:text-gray-400"
                  style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    input.trim() && !sending
                      ? "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm shadow-indigo-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 px-2">Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
