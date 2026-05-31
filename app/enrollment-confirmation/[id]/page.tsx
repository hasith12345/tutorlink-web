"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  CheckCircle, CalendarDays, Clock, ArrowRight,
  MessageCircle, Mail, Monitor, Building,
} from "lucide-react"
import { api } from "@/lib/api"

export default function EnrollmentConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  return (
    <Suspense>
      <EnrollmentConfirmationContent tutorId={resolvedParams.id} />
    </Suspense>
  )
}

function EnrollmentConfirmationContent({ tutorId }: { tutorId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const classId = searchParams.get("classId")
  const amount = searchParams.get("amount")

  const [classDetails, setClassDetails] = useState<any>(null)
  const [loading, setLoading] = useState(!!classId)

  useEffect(() => {
    if (!classId) return
    api.getTutorById(tutorId)
      .then((res) => {
        const cls = res.tutor?.classes?.find((c: any) => c.id === classId)
        setClassDetails({ tutor: res.tutor, cls })
      })
      .catch(() => setClassDetails(null))
      .finally(() => setLoading(false))
  }, [tutorId, classId])

  const ModeIcon = classDetails?.cls?.mode === "physical" ? Building : Monitor
  const amountPaid = amount ? parseInt(amount) : classDetails?.cls?.fees
  const platformFee = amountPaid ? Math.round(amountPaid * 0.08) : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Success Header */}
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">Enrollment Successful!</h1>
                  <p className="text-lg text-gray-600 mb-2">
                    You are now enrolled in{" "}
                    <span className="font-semibold text-indigo-600">
                      {classDetails?.cls?.subject || "the class"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    A confirmation has been recorded on your account.
                  </p>
                </div>

                {/* Class Details */}
                {classDetails?.cls && (
                  <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Class Details</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Subject</p>
                            <p className="font-bold text-gray-900">{classDetails.cls.subject}</p>
                            {classDetails.cls.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{classDetails.cls.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg">
                            <ModeIcon className="w-4 h-4" />
                            {classDetails.cls.mode?.charAt(0).toUpperCase() + classDetails.cls.mode?.slice(1)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {classDetails.cls.schedule?.length > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <CalendarDays className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400">Schedule</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {classDetails.cls.schedule.join(", ")}
                                </p>
                              </div>
                            </div>
                          )}
                          {classDetails.cls.time && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                              <Clock className="w-5 h-5 text-purple-500 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400">Time</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {classDetails.cls.time} · {classDetails.cls.duration}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* What's Next */}
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">What's Next?</h2>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: "Prepare Materials", desc: "Your tutor will share learning materials before the first session." },
                        { step: 2, title: "Join Your First Session", desc: "Log in 10 minutes early and test your audio/video connection." },
                        { step: 3, title: "Provide Feedback", desc: "After each session, rate and review your learning experience." },
                        { step: 4, title: "Manage Your Learning", desc: "Track progress and manage your enrollment from your dashboard." },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            {item.step}
                          </div>
                          <div className="pt-0.5">
                            <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                            <p className="text-gray-500 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => router.push("/dashboard/my-classes")}
                    className="flex-1 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    My Classes <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/search")}
                    className="flex-1 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold"
                  >
                    Browse More Classes
                  </Button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Payment Summary */}
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
                    <div className="space-y-3 text-sm">
                      {amountPaid && (
                        <>
                          <div className="flex justify-between text-gray-600">
                            <span>Monthly fee</span>
                            <span className="font-semibold text-gray-900">Rs.{amountPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400 text-xs">
                            <span>Incl. 8% service fee</span>
                            <span>Rs.{platformFee.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 mt-4 border border-green-100">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Payment Confirmed
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tutor card */}
                {classDetails?.tutor && (
                  <Card className="bg-white rounded-2xl border-0 shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Your Tutor</h3>
                      <div className="flex items-center gap-3">
                        {classDetails.tutor.avatar ? (
                          <img src={classDetails.tutor.avatar} alt={classDetails.tutor.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {classDetails.tutor.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{classDetails.tutor.name}</p>
                          <p className="text-xs text-indigo-600">{classDetails.tutor.subjects?.[0] || classDetails.tutor.subject}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Need Help */}
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
                    <Button
                      onClick={() => router.push(`/dashboard/messages?tutorId=${tutorId}`)}
                      className="w-full h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-semibold flex items-center justify-center gap-2 mb-2 shadow-none"
                    >
                      <MessageCircle className="w-4 h-4" />Message Tutor
                    </Button>
                    <Button
                      onClick={() => router.push("/contact-us")}
                      variant="outline"
                      className="w-full h-10 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
