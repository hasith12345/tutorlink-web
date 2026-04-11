"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Monitor, MessageCircle, User } from "lucide-react"

interface ScheduledClass {
  id: string
  date: string
  time: string
  duration: number
  availableSeats: number
  totalSeats: number
  price: number
  mode: "online" | "physical" | "hybrid"
  topic?: string
}

interface BookingFormData {
  tutorId: number
  classId: string | null
  isCustomRequest: boolean
  preferredDates: string[]
  preferredTime: string
  notes: string
}

const tutorInfo: Record<number, { name: string; subject: string; mode: string; price: string }> = {
  1: {
    name: "Sarah Johnson",
    subject: "Mathematics",
    mode: "Online",
    price: "$35/hr",
  },
  2: {
    name: "Michael Chen",
    subject: "Physics",
    mode: "Hybrid",
    price: "$38/hr",
  },
  3: {
    name: "Emily Davis",
    subject: "Chemistry",
    mode: "Physical",
    price: "$40/hr",
  },
}

// Mock scheduled classes for each tutor
const scheduledClasses: Record<number, ScheduledClass[]> = {
  1: [
    { id: "1-1", date: "2026-01-28", time: "10:00 AM", duration: 60, availableSeats: 3, totalSeats: 5, price: 35, mode: "online", topic: "Calculus Fundamentals" },
    { id: "1-2", date: "2026-01-29", time: "2:00 PM", duration: 90, availableSeats: 2, totalSeats: 4, price: 50, mode: "online", topic: "Advanced Algebra" },
    { id: "1-3", date: "2026-01-30", time: "4:00 PM", duration: 60, availableSeats: 4, totalSeats: 6, price: 35, mode: "online", topic: "Trigonometry Basics" },
    { id: "1-4", date: "2026-02-01", time: "11:00 AM", duration: 60, availableSeats: 5, totalSeats: 5, price: 35, mode: "online", topic: "SAT Math Prep" },
  ],
  2: [
    { id: "2-1", date: "2026-01-28", time: "3:00 PM", duration: 60, availableSeats: 2, totalSeats: 3, price: 38, mode: "hybrid", topic: "Mechanics & Motion" },
    { id: "2-2", date: "2026-01-31", time: "10:00 AM", duration: 90, availableSeats: 1, totalSeats: 3, price: 55, mode: "physical", topic: "Lab Practice: Optics" },
  ],
  3: [
    { id: "3-1", date: "2026-01-29", time: "9:00 AM", duration: 60, availableSeats: 4, totalSeats: 4, price: 40, mode: "physical", topic: "Organic Chemistry Intro" },
    { id: "3-2", date: "2026-02-02", time: "1:00 PM", duration: 90, availableSeats: 3, totalSeats: 5, price: 58, mode: "physical", topic: "Lab Session: Titration" },
  ],
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const searchParams = useSearchParams()
  const tutorId = parseInt(resolvedParams.id)
  const tutor = tutorInfo[tutorId] || tutorInfo[1]
  const classes = scheduledClasses[tutorId] || []

  const [bookingMode, setBookingMode] = useState<"scheduled" | "custom">("scheduled")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookingFormData>({
    tutorId,
    classId: null,
    isCustomRequest: false,
    preferredDates: [],
    preferredTime: "",
    notes: "",
  })

  // Handle URL parameters for pre-selection
  useEffect(() => {
    const mode = searchParams.get('mode')
    const classId = searchParams.get('classId')
    
    if (mode === 'custom') {
      setBookingMode('custom')
    }
    
    if (classId && classes.some(c => c.id === classId)) {
      setSelectedClassId(classId)
      setFormData(prev => ({
        ...prev,
        classId,
        isCustomRequest: false,
      }))
    }
  }, [searchParams, classes])

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
    setFormData((prev) => ({
      ...prev,
      classId,
      isCustomRequest: false,
    }))
  }

  const handleNext = () => {
    if (bookingMode === "scheduled" && !selectedClassId) {
      alert("Please select a class to enroll")
      return
    }
    
    const finalFormData = {
      ...formData,
      isCustomRequest: bookingMode === "custom",
      classId: bookingMode === "scheduled" ? selectedClassId : null,
    }

    sessionStorage.setItem("bookingData", JSON.stringify(finalFormData))
    sessionStorage.setItem("selectedClass", JSON.stringify(selectedClass))
    router.push(`/payment/${tutorId}`)
  }

  const selectedClass = classes.find(c => c.id === selectedClassId)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Monitor className="w-4 h-4 text-blue-600" />
      case "physical":
        return <Users className="w-4 h-4 text-green-600" />
      case "hybrid":
        return <div className="flex items-center gap-1">
          <Monitor className="w-3 h-3 text-purple-600" />
          <Users className="w-3 h-3 text-purple-600" />
        </div>
      default:
        return null
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-12">
                {["Booking", "Payment", "Confirmation"].map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        idx === 0
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`ml-2 font-medium ${
                        idx === 0 ? "text-indigo-600" : "text-gray-500"
                      }`}
                    >
                      {step}
                    </p>
                    {idx < 2 && (
                      <div className="flex-1 h-1 mx-4 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>

              {/* Booking Mode Selection */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How would you like to book?</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setBookingMode("scheduled")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        bookingMode === "scheduled"
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <Calendar className={`w-8 h-8 mb-3 ${bookingMode === "scheduled" ? "text-indigo-600" : "text-gray-600"}`} />
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Join Scheduled Class</h3>
                      <p className="text-sm text-gray-600">Enroll in tutor's pre-scheduled group or individual classes</p>
                    </button>

                    <button
                      onClick={() => setBookingMode("custom")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        bookingMode === "custom"
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <MessageCircle className={`w-8 h-8 mb-3 ${bookingMode === "custom" ? "text-indigo-600" : "text-gray-600"}`} />
                      <h3 className="font-bold text-lg text-gray-900 mb-2">Request Custom Time</h3>
                      <p className="text-sm text-gray-600">Contact tutor directly to schedule a personalized session</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Classes */}
              {bookingMode === "scheduled" && (
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                      Available Scheduled Classes
                    </h2>

                    {classes.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No scheduled classes available at the moment</p>
                        <p className="text-sm text-gray-400">Try requesting a custom time instead</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {classes.map((classItem) => (
                          <button
                            key={classItem.id}
                            onClick={() => handleClassSelect(classItem.id)}
                            disabled={classItem.availableSeats === 0}
                            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                              selectedClassId === classItem.id
                                ? "border-indigo-600 bg-indigo-50"
                                : classItem.availableSeats === 0
                                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                : "border-gray-200 bg-white hover:border-indigo-300"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-bold text-lg text-gray-900">{classItem.topic || tutor.subject}</h3>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-indigo-600 font-medium">{formatDate(classItem.date)}</span>
                                  <Badge variant={classItem.availableSeats > 0 ? "default" : "secondary"}>
                                    {classItem.availableSeats > 0 ? `${classItem.availableSeats} seats left` : "Full"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {classItem.time} ({classItem.duration} min)
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {getModeIcon(classItem.mode)}
                                    <span className="capitalize">{classItem.mode}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <User className="w-4 h-4" />
                                    {classItem.totalSeats} total
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-600">${classItem.price}</div>
                                <div className="text-sm text-gray-500">per session</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Custom Request */}
              {bookingMode === "custom" && (
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-indigo-600" />
                      Request Custom Session
                    </h2>

                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Your request will be sent to the tutor. They'll review your preferences and confirm availability directly with you.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Message to Tutor
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Hi! I'd like to schedule a session about [topic]. My preferred times are [days/times]. Looking forward to hearing from you!"
                          className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-sans text-gray-700 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">Include your availability and any specific topics you'd like to cover</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes for Scheduled Classes */}
              {bookingMode === "scheduled" && selectedClassId && (
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Notes (Optional)</h2>

                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Any specific topics or questions you'd like to focus on during this session?"
                      className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-sans text-gray-700 resize-none"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-12 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={bookingMode === "scheduled" && !selectedClassId}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingMode === "custom" ? "Send Request" : "Continue to Payment"}
                </Button>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-2xl border-0 shadow-lg sticky top-24">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

                  <div className="space-y-4 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tutor</p>
                      <p className="font-bold text-gray-900">{tutor.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Subject</p>
                      <p className="font-bold text-gray-900">{tutor.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking Type</p>
                      <Badge variant="outline">
                        {bookingMode === "scheduled" ? "Scheduled Class" : "Custom Request"}
                      </Badge>
                    </div>

                    {bookingMode === "scheduled" && selectedClass && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                          <p className="font-bold text-gray-900">{formatDate(selectedClass.date)}</p>
                          <p className="text-sm text-gray-600">{selectedClass.time}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <p className="font-bold text-gray-900">{selectedClass.duration} minutes</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Mode</p>
                          <div className="flex items-center gap-2">
                            {getModeIcon(selectedClass.mode)}
                            <span className="font-bold text-gray-900 capitalize">{selectedClass.mode}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Available Seats</p>
                          <p className="font-bold text-gray-900">
                            {selectedClass.availableSeats} of {selectedClass.totalSeats}
                          </p>
                        </div>
                      </>
                    )}

                    {bookingMode === "custom" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                          Custom request - tutor will confirm pricing and availability
                        </p>
                      </div>
                    )}
                  </div>

                  {bookingMode === "scheduled" && selectedClass && (
                    <div className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Session Price</span>
                        <span className="font-bold text-gray-900">${selectedClass.price}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="font-bold text-gray-900">$2</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-indigo-600">${selectedClass.price + 2}</span>
                      </div>
                    </div>
                  )}

                  {bookingMode === "custom" && (
                    <div className="pt-6">
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-sm text-indigo-700 font-medium">
                          💡 Tip: The tutor will contact you to finalize details and confirm pricing before payment
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
