import Link from "next/link"

const links = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "Safety Tips", href: "/safety-tips" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
]

export function TutorFooter() {
  return (
    <footer className="relative mt-12 border-t border-slate-200/70 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="TutorLink" className="w-5 h-5" />
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TutorLink. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
