"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TutorApplicationsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/admin/tutor-approvals") }, [router])
  return null
}
