"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  MapPin,
  Monitor,
  Users,
  Shuffle,
  Clock,
  BookOpen,
  Award,
  MessageCircle,
  ArrowLeft,
  Heart,
} from "lucide-react"

interface TutorGig {
  id: number
  name: string
  subject: string
  location: string
  mode: "online" | "physical" | "hybrid"
  rating: number
  reviews: number
  price: string
  avatar: string
  bio: string
  experience: number
  qualifications: string[]
  availability: string[]
}

const gigData: Record<number, TutorGig> = {
  1: {
    id: 1,
    name: "Sarah Johnson",
    subject: "Mathematics",
    location: "New York",
    mode: "online",
    rating: 4.9,
    reviews: 156,
    price: "$35/hr",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah%20Johnson-1&backgroundColor=b6e3f4,c0aede,d1d4f9",
    bio: "Experienced mathematics tutor with 8+ years helping students master calculus, algebra, and advanced topics.",
    experience: 8,
    qualifications: ["M.S. Mathematics", "Certified Math Educator", "Test Prep Specialist"],
    availability: ["Mon 5-8PM", "Wed 5-8PM", "Fri 6-9PM", "Sat 10AM-2PM", "Sun 2-6PM"],
  },
  2: {
    id: 2,
    name: "Michael Chen",
    subject: "Physics",
    location: "Los Angeles",
    mode: "hybrid",
    rating: 4.7,
    reviews: 98,
    price: "$38/hr",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael%20Chen-2&backgroundColor=b6e3f4,c0aede,d1d4f9",
    bio: "Physics specialist with a passion for making complex concepts simple and engaging for all learners.",
    experience: 6,
    qualifications: ["B.S. Physics", "Lab Instructor", "STEM Educator"],
    availability: ["Tue 4-7PM", "Thu 4-7PM", "Sat 1-5PM"],
  },
  3: {
    id: 3,
    name: "Emily Davis",
    subject: "Chemistry",
    location: "Chicago",
    mode: "physical",
    rating: 4.8,
    reviews: 112,
    price: "$40/hr",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily%20Davis-3&backgroundColor=b6e3f4,c0aede,d1d4f9",
    bio: "Chemistry tutor specializing in lab techniques and making organic chemistry concepts accessible.",
    experience: 7,
    qualifications: ["Ph.D. Chemistry", "Lab Safety Certified", "Research Experience"],
    availability: ["Mon 3-6PM", "Wed 3-6PM", "Fri 2-5PM", "Sat 11AM-3PM"],
  },
}

const modeIcons = {
  online: Monitor,
  physical: Users,
  hybrid: Shuffle,
}

const modeColors = {
  online: "bg-blue-100 text-blue-700",
  physical: "bg-green-100 text-green-700",
  hybrid: "bg-purple-100 text-purple-700",
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

export default function GigDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const [isFavorite, setIsFavorite] = useState(false)
  const gig = gigData[parseInt(resolvedParams.id)] || gigData[1]
  const classes = scheduledClasses[parseInt(resolvedParams.id)] || []
  const ModeIcon = modeIcons[gig.mode]

  const handleEnroll = () => {
    router.push(`/booking/${gig.id}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
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
              {/* Tutor Header Card */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-8">
                    <img
                      src={gig.avatar}
                      alt={gig.name}
                      className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">{gig.name}</h1>
                          <p className="text-lg text-indigo-600 font-semibold">{gig.subject} Tutor</p>
                        </div>
                        <button
                          onClick={() => setIsFavorite(!isFavorite)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Heart
                            className={`w-6 h-6 ${
                              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-lg">{gig.rating}</span>
                          <span className="text-gray-500 text-sm">({gig.reviews} reviews)</span>
                        </div>
                        <Badge className={`${modeColors[gig.mode]} rounded-lg`}>
                          <ModeIcon className="w-4 h-4 mr-1" />
                          {gig.mode.charAt(0).toUpperCase() + gig.mode.slice(1)}
                        </Badge>
                        {gig.mode !== "online" && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {gig.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 leading-relaxed text-lg">{gig.bio}</p>
                </CardContent>
              </Card>

              {/* Experience & Qualifications */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Award className="w-6 h-6 text-indigo-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Experience & Qualifications</h3>
                        <p className="text-gray-600 mb-4">
                          {gig.experience} years of tutoring experience
                        </p>
                        <div className="space-y-2">
                          {gig.qualifications.map((qual, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                              <span className="text-gray-700 font-medium">{qual}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Classes */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900">Upcoming Scheduled Classes</h3>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">{classes.length} Available</Badge>
                  </div>

                  {classes.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No scheduled classes at the moment</p>
                      <p className="text-sm text-gray-400 mt-1">Contact the tutor to request a custom session</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {classes.slice(0, 3).map((classItem) => (
                        <div
                          key={classItem.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer"
                          onClick={handleEnroll}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900">{classItem.topic || gig.subject}</p>
                              <Badge variant="outline" className="text-xs">
                                {classItem.availableSeats} seats left
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(classItem.date)} at {classItem.time}
                              </span>
                              <span>{classItem.duration} min</span>
                              <span className="capitalize">{classItem.mode}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-indigo-600">${classItem.price}</p>
                          </div>
                        </div>
                      ))}

                      {classes.length > 3 && (
                        <button
                          onClick={handleEnroll}
                          className="w-full text-center text-indigo-600 hover:text-indigo-700 font-medium py-2 text-sm"
                        >
                          View all {classes.length} scheduled classes →
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* General Availability */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <Clock className="w-6 h-6 text-indigo-600 mt-1" />
                    <h3 className="text-xl font-bold text-gray-900">General Availability</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">For custom individual sessions, the tutor is typically available during:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gig.availability.map((time, idx) => (
                      <div key={idx} className="bg-indigo-50 rounded-lg p-3 text-center">
                        <p className="text-indigo-700 font-medium text-sm">{time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card className="bg-white rounded-2xl border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <MessageCircle className="w-6 h-6 text-indigo-600 mt-1" />
                    <h3 className="text-xl font-bold text-gray-900">Student Reviews</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        author: "John Smith",
                        rating: 5,
                        text: "Sarah is an amazing tutor! She explains concepts clearly and patiently.",
                      },
                      {
                        author: "Emma Wilson",
                        rating: 5,
                        text: "Very knowledgeable and helped me improve my grades significantly!",
                      },
                      {
                        author: "Alex Johnson",
                        rating: 4,
                        text: "Great tutor with good teaching methods. Highly recommended!",
                      },
                    ].map((review, idx) => (
                      <div key={idx} className="pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{review.author}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-500 fill-yellow-500"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white rounded-2xl border-0 shadow-lg sticky top-24">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Hourly Rate</p>
                      <p className="text-4xl font-bold text-indigo-600">{gig.price}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Scheduled Classes</span>
                        <span className="font-semibold text-indigo-600">{classes.length} available</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Response time</span>
                        <span className="font-semibold text-gray-900">{'< 1 hour'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Class size</span>
                        <span className="font-semibold text-gray-900">1-6 students</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Total students</span>
                        <span className="font-semibold text-gray-900">{gig.reviews}+</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleEnroll}
                      className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl text-base"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Enroll Classes
                    </Button>

                    <Button
                      onClick={() => router.push(`/booking/${gig.id}?mode=custom`)}
                      variant="outline"
                      className="w-full h-12 bg-transparent border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold text-base"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Custom Session
                    </Button>

                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-xs text-indigo-700">
                        ✓ Professional background verified
                        <br />✓ All lessons are recorded for your safety
                      </p>
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
