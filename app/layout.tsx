import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Delicious_Handrawn, Bitcount_Grid_Double } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Configure fonts with display: swap to prevent FOUT/FOIT flash
const geist = Geist({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-mono",
})
const deliciousHandrawn = Delicious_Handrawn({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-delicious-handrawn",
})
const bitcountGridDouble = Bitcount_Grid_Double({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bitcount-grid-double",
})

export const metadata: Metadata = {
  title: "TutorLink | Smart Student Tutor Connect Platform",
  description: "Connect with the best tutors and enhance your learning experience.",
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${deliciousHandrawn.variable} ${bitcountGridDouble.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
