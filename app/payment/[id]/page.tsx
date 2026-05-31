"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Lock, CalendarDays, Clock, Monitor, Users, Loader2, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ClassDetails {
  subject: string
  description?: string
  fees: number
  schedule: string[]
  time: string
  duration: string
  mode: string
  tutorName: string
  maxStudents: number
  enrolledCount: number
}

// Inner form that uses Stripe hooks — must be inside <Elements>
function CheckoutForm({
  classDetails,
  classId,
  tutorId,
  paymentIntentId,
}: {
  classDetails: ClassDetails
  classId: string
  tutorId: string
  paymentIntentId: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [elementsReady, setElementsReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const platformFee = Math.round(classDetails.fees * 0.08)
  const tutorAmount = classDetails.fees - platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Guard: must be an actual user click, not an auto-trigger
    if (!stripe || !elements || !elementsReady || processing) return

    setProcessing(true)
    setErrorMessage("")

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.")
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        await api.confirmPayment(paymentIntent.id, classId)
        router.push(`/enrollment-confirmation/${tutorId}?classId=${classId}&amount=${classDetails.fees}`)
      } catch (err: any) {
        setErrorMessage(err.message || "Payment recorded but enrollment failed. Please contact support.")
        setProcessing(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-500" />
          Secure Payment
        </h2>
        <PaymentElement onReady={() => setElementsReady(true)} />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elements || !elementsReady || processing}
        className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
        ) : (
          `Pay Rs.${classDetails.fees.toLocaleString()}`
        )}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Payments are processed securely by Stripe. Your card details are never stored on our servers.
      </p>
    </form>
  )
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resolvedParams = React.use(params)
  const tutorId = resolvedParams.id
  const classId = searchParams.get("classId")

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchIntent = useCallback(async () => {
    if (!classId) { setError("No class selected."); setLoading(false); return }
    try {
      const data = await api.createPaymentIntent(classId)
      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setClassDetails(data.classDetails)
    } catch (err: any) {
      setError(err.message || "Failed to load payment details.")
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => { fetchIntent() }, [fetchIntent])

  const ModeIcon = classDetails?.mode === "physical" ? Users : Monitor

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline text-sm">
          Go back
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Enrollment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment form — left 3 cols */}
          <div className="lg:col-span-3">
            {clientSecret && classDetails && paymentIntentId && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: { colorPrimary: "#6366f1", borderRadius: "12px" },
                  },
                }}
              >
                <CheckoutForm
                  classDetails={classDetails}
                  classId={classId!}
                  tutorId={tutorId}
                  paymentIntentId={paymentIntentId}
                />
              </Elements>
            )}
          </div>

          {/* Order summary — right 2 cols */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-2xl border-0 shadow-sm sticky top-6">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900 text-base">Order Summary</h3>

                {classDetails && (
                  <>
                    <div className="space-y-3 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Tutor</p>
                        <p className="font-semibold text-gray-900 text-sm">{classDetails.tutorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Class</p>
                        <p className="font-semibold text-gray-900 text-sm">{classDetails.subject}</p>
                        {classDetails.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{classDetails.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {classDetails.schedule.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{classDetails.schedule.join(", ")}</span>
                          </div>
                        )}
                        {classDetails.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{classDetails.time}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 w-fit">
                        <ModeIcon className="w-3 h-3 mr-1" />
                        {classDetails.mode.charAt(0).toUpperCase() + classDetails.mode.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Monthly fee</span>
                        <span>Rs.{classDetails.fees.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-400">Includes 8% service fee</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700 text-sm">Total due</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Rs.{classDetails.fees.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">per month</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg p-3">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Secured by Stripe — your card details are encrypted
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
