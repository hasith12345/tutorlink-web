"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface TutorPageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  /** Right-aligned content (e.g. a primary action button or stat chips). */
  action?: React.ReactNode
  /** Show the "Back" link above the title. Defaults to true. */
  showBack?: boolean
}

/**
 * Consistent premium page header for the tutor portal: a gradient icon tile,
 * a bold tracking-tight title with optional subtitle, an optional back link
 * and a slot for right-aligned actions.
 */
export function TutorPageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  showBack = true,
}: TutorPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="group mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Icon className="h-6 w-6 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] sm:leading-tight">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
