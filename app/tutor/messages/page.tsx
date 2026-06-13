"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authStorage } from "@/lib/api"
import { TutorShell } from "@/components/tutor/tutor-shell"
import { TutorPageHeader } from "@/components/tutor/tutor-page-header"
import { MessagesView } from "@/components/messages-view"
import { MessageCircle } from "lucide-react"

function TutorMessagesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get("student")

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login")
      return
    }
    const user = authStorage.getUser()
    if (!user?.hasTutorProfile) {
      router.push("/dashboard")
    }
  }, [])

  return (
    <TutorShell maxWidth="max-w-6xl" hideFooter>
      <TutorPageHeader
        icon={MessageCircle}
        title="Messages"
        subtitle="Chat with your enrolled students"
      />

      <div className="h-[calc(100vh-260px)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <MessagesView role="tutor" initialTutorId={studentId} />
      </div>
    </TutorShell>
  )
}

export default function TutorMessagesPage() {
  return (
    <Suspense>
      <TutorMessagesInner />
    </Suspense>
  )
}
