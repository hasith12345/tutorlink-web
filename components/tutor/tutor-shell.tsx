import { TutorNavbar } from "@/components/tutor-navbar"
import { TutorFooter } from "@/components/tutor/tutor-footer"
import { cn } from "@/lib/utils"

interface TutorShellProps {
  children: React.ReactNode
  /** Tailwind max-width class for the content container. Defaults to max-w-7xl. */
  maxWidth?: string
  /** Extra classes for the <main> wrapper. */
  className?: string
  /** Hide the footer (e.g. full-height chat pages). */
  hideFooter?: boolean
}

/**
 * Shared layout shell for the tutor portal. Provides a consistent ambient
 * gradient background, decorative blurred accents, the sticky TutorNavbar and
 * a footer. Keeps every /tutor page visually cohesive.
 */
export function TutorShell({
  children,
  maxWidth = "max-w-7xl",
  className,
  hideFooter = false,
}: TutorShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-slate-50">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50" />
        <div className="absolute -top-24 -right-20 h-[26rem] w-[26rem] rounded-full bg-indigo-300/25 blur-3xl" />
        <div className="absolute top-1/3 -left-28 h-[24rem] w-[24rem] rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[20rem] w-[20rem] rounded-full bg-blue-200/15 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        <TutorNavbar />
        <main className={cn("flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8", maxWidth, className)}>
          {children}
        </main>
        {!hideFooter && <TutorFooter />}
      </div>
    </div>
  )
}
