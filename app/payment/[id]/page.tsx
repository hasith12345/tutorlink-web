"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CreditCard, Lock, DollarSign } from "lucide-react"

interface BookingData {
  tutorId: number
  classId?: string | null
  isCustomRequest: boolean
  preferredDates?: string[]
  preferredTime?: string
  dates?: string[]
  time?: string
  notes: string
}

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

const tutorInfo: Record<number, { name: string; subject: string; price: number }> = {
  1: { name: "Sarah Johnson", subject: "Mathematics", price: 35 },
  2: { name: "Michael Chen", subject: "Physics", price: 38 },
  3: { name: "Emily Davis", subject: "Chemistry", price: 40 },
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const tutorId = parseInt(resolvedParams.id)
  const tutor = tutorInfo[tutorId] || tutorInfo[1]

  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "bank">("card")
  const [processing, setProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    const storedBooking = sessionStorage.getItem("bookingData")
    const storedClass = sessionStorage.getItem("selectedClass")
    
    if (storedBooking) {
      setBookingData(JSON.parse(storedBooking))
    }
    if (storedClass) {
      setSelectedClass(JSON.parse(storedClass))
    }
  }, [])

  const platformFee = 2
  const sessionPrice = selectedClass 
    ? selectedClass.price 
    : bookingData?.isCustomRequest 
    ? 0 
    : (bookingData?.preferredDates?.length || 1) * tutor.price
  const totalAmount = sessionPrice + (bookingData?.isCustomRequest ? 0 : platformFee)

  const handlePayment = async () => {
    // For custom requests, skip payment and just send request to tutor
    if (bookingData?.isCustomRequest) {
      sessionStorage.setItem(
        "enrollmentData",
        JSON.stringify({
          ...bookingData,
          transactionId: `REQ-${Date.now()}`,
          paymentMethod: "pending",
          amount: 0,
          status: "pending_confirmation",
        }),
      )
      router.push(`/enrollment-confirmation/${tutorId}`)
      return
    }

    if (!cardData.cardName || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      alert("Please fill in all card details")
      return
    }

    setProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    sessionStorage.setItem(
      "enrollmentData",
      JSON.stringify({
        ...bookingData,
        selectedClass,
        transactionId: `TXN-${Date.now()}`,
        paymentMethod,
        amount: totalAmount,
        status: "confirmed",
      }),
    )

    router.push(`/enrollment-confirmation/${tutorId}`)
  }

  if (!bookingData) {
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
                {["Booking", bookingData?.isCustomRequest ? "Request" : "Payment", "Confirmation"].map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        idx <= 1
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`ml-2 font-medium ${
                        idx <= 1 ? "text-indigo-600" : "text-gray-500"
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

              {/* Custom Request Notice */}
              {bookingData?.isCustomRequest && (
                <Card className="bg-blue-50 border-blue-200 rounded-2xl border shadow-lg mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Session Request</h2>
                    <p className="text-gray-700 mb-3">
                      Your custom session request will be sent to <strong>{tutor.name}</strong>.
                    </p>
                    <p className="text-gray-600 text-sm">
                      The tutor will review your request and contact you to confirm availability and finalize pricing. 
                      Payment will be processed after the tutor confirms your booking.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods - Only show for scheduled classes */}
              {!bookingData?.isCustomRequest && (
                <Card className="bg-white rounded-2xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

                  <div className="space-y-4 mb-8">
                    {[
                      { id: "card", label: "Credit or Debit Card", icon: "💳" },
                      { id: "paypal", label: "PayPal", icon: "🅿️" },
                      { id: "bank", label: "Bank Transfer", icon: "🏦" },
                    ].map((method) => (
                      <label key={method.id} className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                        style={{
                          borderColor: paymentMethod === method.id ? "#4f46e5" : "#e5e7eb",
                          backgroundColor: paymentMethod === method.id ? "#f0f4ff" : "white",
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as "card" | "paypal" | "bank")
                          }
                          className="w-5 h-5 cursor-pointer"
                        />
                        <span className="ml-4 text-lg mr-2">{method.icon}</span>
                        <span className="font-semibold text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {paymentMethod === "card" && (
                    <div className="space-y-6 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Card Details</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <Input
                          value={cardData.cardName}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              cardName: e.target.value,
                            }))
                          }
                          placeholder="John Doe"
                          className="rounded-xl h-12 border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <Input
                          value={cardData.cardNumber}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              cardNumber: e.target.value.replace(/\s/g, "").slice(0, 16),
                            }))
                          }
                          placeholder="1234 5678 9012 3456"
                          className="rounded-xl h-12 border-gray-200 font-mono"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <Input
                            value={cardData.expiryDate}
                            onChange={(e) =>
                              setCardData((prev) => ({
                                ...prev,
                                expiryDate: e.target.value,
                              }))
                            }
                            placeholder="MM/YY"
                            className="rounded-xl h-12 border-gray-200 font-mono"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <Input
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData((prev) => ({
                                ...prev,
                                cvv: e.target.value.slice(0, 4),
                              }))
                            }
                            placeholder="123"
                            className="rounded-xl h-12 border-gray-200 font-mono"
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                        <Lock className="w-4 h-4 text-green-600" />
                        Your payment information is secure and encrypted
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="bg-blue-50 rounded-xl p-6 text-center">
                      <p className="text-blue-700 font-medium">
                        You will be redirected to PayPal to complete the payment
                      </p>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="bg-green-50 rounded-xl p-6 text-sm text-green-700 space-y-2">
                      <p className="font-medium">Bank Transfer Details:</p>
                      <p>Bank Name: Global Bank</p>
                      <p>Account: 1234567890</p>
                      <p>SWIFT: GLBNCODE</p>
                      <p className="text-xs mt-4">
                        Please send us a confirmation email after transfer
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <input type="checkbox" className="w-4 h-4 mt-1 rounded" />
                <label className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-indigo-600 hover:underline font-medium">
                    terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:underline font-medium">
                    privacy policy
                  </a>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-12 font-semibold"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {processing 
                    ? "Processing..." 
                    : bookingData?.isCustomRequest 
                    ? "Send Request" 
                    : "Complete Payment"}
                </Button>
              </div>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-2xl border-0 shadow-lg sticky top-24">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                  <div className="space-y-4 pb-6 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tutor</p>
                      <p className="font-bold text-gray-900">{tutor.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Subject</p>
                      <p className="font-bold text-gray-900">{tutor.subject}</p>
                    </div>

                    {selectedClass ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Class</p>
                          <p className="font-bold text-gray-900">{selectedClass.topic || tutor.subject}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                          <p className="font-bold text-gray-900">
                            {new Date(selectedClass.date).toLocaleDateString("en-US", { 
                              weekday: "short", 
                              month: "short", 
                              day: "numeric" 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{selectedClass.time}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <p className="font-bold text-gray-900">{selectedClass.duration} minutes</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Mode</p>
                          <p className="font-bold text-gray-900 capitalize">{selectedClass.mode}</p>
                        </div>
                      </>
                    ) : bookingData.isCustomRequest ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Booking Type</p>
                        <p className="font-bold text-gray-900">Custom Session Request</p>
                        <p className="text-xs text-amber-600 mt-1">Pending tutor confirmation</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Sessions</p>
                          <p className="font-bold text-gray-900">{bookingData.preferredDates?.length || bookingData.dates?.length || 0}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Time</p>
                          <p className="font-bold text-gray-900">{bookingData.preferredTime || bookingData.time || "To be confirmed"}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="py-6 space-y-3">
                    {selectedClass ? (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Session Price
                          </span>
                          <span className="font-semibold">${selectedClass.price}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Platform Fee</span>
                          <span className="font-semibold">${platformFee}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-gray-600">
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Rate
                          </span>
                          <span className="font-semibold">${tutor.price}/hr</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Sessions</span>
                          <span className="font-semibold">×{bookingData.preferredDates?.length || bookingData.dates?.length || 1}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Platform Fee</span>
                          <span className="font-semibold">${platformFee}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        ${totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                      <CreditCard className="w-4 h-4" />
                      Secure Payment
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
