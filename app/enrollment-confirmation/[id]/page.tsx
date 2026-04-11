"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  DollarSign,
  Mail,
  Download,
  MessageCircle,
  ArrowRight,
} from "lucide-react"

interface EnrollmentData {
  tutorId: number
  classId?: string | null
  isCustomRequest: boolean
  preferredDates?: string[]
  preferredTime?: string
  dates?: string[]
  time?: string
  notes: string
  selectedClass?: {
    id: string
    date: string
    time: string
    duration: number
    price: number
    mode: string
    topic?: string
  }
  transactionId: string
  paymentMethod: string
  amount: number
  status: string
}

const tutorInfo: Record<number, { name: string; subject: string; avatar: string }> = {
  1: { name: "Sarah Johnson", subject: "Mathematics", avatar: "/female-tutor.jpg" },
  2: { name: "Michael Chen", subject: "Physics", avatar: "/male-tutor.jpg" },
  3: { name: "Emily Davis", subject: "Chemistry", avatar: "/female-chemistry-tutor.jpg" },
}

export default function EnrollmentConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const tutorId = parseInt(resolvedParams.id)
  const tutor = tutorInfo[tutorId] || tutorInfo[1]

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("enrollmentData")
    if (stored) {
      setEnrollmentData(JSON.parse(stored))
    }
  }, [])

  if (!enrollmentData) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Success Header */}
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {enrollmentData.isCustomRequest ? "Request Sent Successfully!" : "Enrollment Successful!"}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {enrollmentData.isCustomRequest 
                    ? `Your request has been sent to ${tutor.name}`
                    : `You are now enrolled in ${tutor.name}'s class`
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Confirmation email sent to your registered email address
                </p>
              </div>

              {/* Enrollment Details Card */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Enrollment Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tutor Info */}
                    <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-xl">
                      <img
                        src={tutor.avatar || "/placeholder.svg"}
                        alt={tutor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm text-gray-600">Your Tutor</p>
                        <p className="font-bold text-lg text-gray-900">
                          {tutor.name}
                        </p>
                        <p className="text-sm text-indigo-600 font-medium">
                          {tutor.subject}
                        </p>
                      </div>
                    </div>

                    {/* Transaction ID */}
                    <div className="p-6 bg-purple-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Transaction ID</p>
                      <p className="font-mono font-bold text-lg text-gray-900 break-all">
                        {enrollmentData.transactionId}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-8 pt-8">
                    <h3 className="font-bold text-gray-900 mb-6">
                      {enrollmentData.isCustomRequest ? "Request Details" : "Session Schedule"}
                    </h3>

                    {enrollmentData.selectedClass ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-gray-900">
                              {new Date(enrollmentData.selectedClass.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">
                              {enrollmentData.selectedClass.time}
                            </span>
                          </div>
                        </div>
                        {enrollmentData.selectedClass.topic && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Topic:</strong> {enrollmentData.selectedClass.topic}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Duration:</strong> {enrollmentData.selectedClass.duration} minutes
                        </p>
                      </div>
                    ) : enrollmentData.isCustomRequest ? (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 mb-2">
                          <strong>Status:</strong> Pending tutor confirmation
                        </p>
                        {(enrollmentData.preferredDates || enrollmentData.dates) && (
                          <p className="text-sm text-blue-700 mb-2">
                            <strong>Preferred Dates:</strong> {(enrollmentData.preferredDates || enrollmentData.dates)?.join(", ")}
                          </p>
                        )}
                        {(enrollmentData.preferredTime || enrollmentData.time) && (
                          <p className="text-sm text-blue-700">
                            <strong>Preferred Time:</strong> {enrollmentData.preferredTime || enrollmentData.time}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(enrollmentData.preferredDates || enrollmentData.dates || []).map((date: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-indigo-600" />
                              <span className="font-medium text-gray-900">
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-purple-600" />
                              <span className="font-medium text-gray-900">
                                {enrollmentData.preferredTime || enrollmentData.time || "To be confirmed"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {enrollmentData.notes && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium mb-2">
                          Special Requests
                        </p>
                        <p className="text-blue-700">{enrollmentData.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* What's Next */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>

                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Prepare Materials",
                        desc: "Your tutor will share learning materials and resources before the first session.",
                      },
                      {
                        step: 2,
                        title: "Join Your First Session",
                        desc: "Log in 10 minutes early and test your audio/video connection.",
                      },
                      {
                        step: 3,
                        title: "Provide Feedback",
                        desc: "After each session, you can rate and review your learning experience.",
                      },
                      {
                        step: 4,
                        title: "Manage Your Learning",
                        desc: "Track progress, reschedule sessions, or upgrade your plan anytime.",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-200">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">
                            {item.step}
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h3 className="font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/student-dashboard")}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-12 font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Summary */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {enrollmentData.isCustomRequest ? "Request Summary" : "Payment Summary"}
                  </h3>

                  <div className="space-y-4">
                    {!enrollmentData.isCustomRequest ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                          <p className="text-3xl font-bold text-indigo-600">
                            ${enrollmentData.amount}
                          </p>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Payment Method
                          </p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {enrollmentData.paymentMethod}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="text-lg font-semibold text-blue-600">
                          Awaiting Confirmation
                        </p>
                      </div>
                    )}

                    {enrollmentData.selectedClass && (
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-1">Class Topic</p>
                        <p className="font-semibold text-gray-900">
                          {enrollmentData.selectedClass.topic || "General Session"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`${enrollmentData.isCustomRequest ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"} rounded-lg p-3 mt-6 border`}>
                    <p className={`text-sm font-medium ${enrollmentData.isCustomRequest ? "text-blue-700" : "text-green-700"}`}>
                      {enrollmentData.isCustomRequest ? "⏳ Request Pending" : "✓ Payment Confirmed"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Tutor */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Need Help?
                  </h3>

                  <Button className="w-full h-11 bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5" />
                    Message Tutor
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              {/* Insurance Badge */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <p className="text-center">
                  <span className="text-lg">🛡️</span>
                </p>
                <p className="text-xs text-center text-indigo-700 mt-2 font-medium">
                  Your enrollment is protected. You can cancel or reschedule anytime
                  before your first lesson.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
