"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactUs() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.")
        setStatus("error")
        return
      }

      setStatus("success")
      setName("")
      setEmail("")
      setMessage("")
    } catch {
      setErrorMsg("Failed to send message. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div className="bg-white min-h-screen">

      <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 flex items-center justify-center">
              <img src="/logo.png" alt="TutorLink Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              TutorLink
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Our Team
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about TutorLink? Need help getting started?
            Our team is here to support you.
          </p>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Get in touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Mail className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">support@tutorlink.lk</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Phone className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-gray-600">+94 77 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <MapPin className="text-purple-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">
                    Colombo, Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl  bg-purple-50 p-6 text-purple-900">
              <p className="font-medium mb-1">
                We usually respond within 24 hours.
              </p>
              <p className="text-sm">
                Our support team is available Monday to Friday.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Send us a message
            </h2>

            {/* Success Message */}
            {status === "success" && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-5">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Message sent! We'll get back to you soon.</p>
              </div>
            )}

            {/* Error Message */}
            {status === "error" && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-5">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
      </section>
    </div>
  )
}
