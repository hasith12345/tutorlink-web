"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Monitor, Users, Shuffle, BookOpen, Clock, Award, CalendarDays } from "lucide-react"
import { api } from "@/lib/api"

const modeIcons = { online: Monitor, physical: Users, hybrid: Shuffle }
const modeColors = {
  online: "bg-blue-100 text-blue-700",
  physical: "bg-green-100 text-green-700",
  hybrid: "bg-purple-100 text-purple-700",
}

export function TutorGigsFeed() {
  const [tutors, setTutors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.searchTutors({ limit: 8 })
      .then(res => setTutors(res.tutors || []))
      .catch(() => setTutors([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-5xl md:text-4xl fo text-gray-900 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>Available Tutors</h2>
          <p className="text-5xl md:text-2xl fo text-gray-400 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>Browse our community of qualified tutors ready to help you succeed</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <GigSkeleton key={i} />)}
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium">No tutors available yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutors.map((tutor, index) => (
              <div key={tutor.id} data-aos="fade-up" data-aos-delay={Math.min(index * 60, 300)}>
                <TutorCard tutor={tutor} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TutorCard({ tutor }: { tutor: any }) {
  const router = useRouter()
  const mode = tutor.classes?.[0]?.mode || tutor.learningMode || "online"
  const ModeIcon = modeIcons[mode as keyof typeof modeIcons] || Monitor
  const initials = tutor.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "T"
  const primarySubject = tutor.subjects?.[0] || tutor.subject || "General"
  const classCount = tutor.classes?.length || 0
  const schedule = tutor.classes?.[0]?.schedule || []

  return (
    <Card
      className="group bg-white rounded-2xl border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      onClick={() => router.push(`/tutor/${tutor.id}`)}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-6 pb-8">
          {tutor.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white border-0 shadow-sm text-xs">
                <Award className="w-3 h-3 mr-1" />Verified
              </Badge>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg ring-4 ring-white overflow-hidden flex items-center justify-center">
              {tutor.avatar ? (
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{tutor.name}</h3>
            <p className="text-indigo-600 font-semibold text-sm flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" />{primarySubject}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            {tutor.experience && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{tutor.experience}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{tutor.totalStudents || 0} students</span>
            </div>
          </div>

          {tutor.location && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{tutor.location}</span>
            </div>
          )}

          {/* Classes count & schedule */}
          {classCount > 0 && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {classCount} class{classCount > 1 ? "es" : ""}
                {schedule.length > 0 && <span className="text-gray-400 ml-1">· {schedule.join(", ")}</span>}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${modeColors[mode as keyof typeof modeColors] || modeColors.online} rounded-lg px-3 py-1`}>
              <ModeIcon className="w-3.5 h-3.5 mr-1.5" />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Badge>
          </div>

          {/* Rating and Fee */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{tutor.rating?.toFixed(1) || "New"}</span>
              {tutor.totalReviews > 0 && <span className="text-gray-500 text-xs">({tutor.totalReviews})</span>}
            </div>
            {tutor.lowestFee != null && (
              <div className="text-right">
                <div className="text-xs text-gray-500">From</div>
                <div className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Rs.{tutor.lowestFee.toLocaleString()}/mo
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={(e) => { e.stopPropagation(); router.push(`/tutor/${tutor.id}`) }}
            className="w-full mt-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function GigSkeleton() {
  return (
    <Card className="bg-white rounded-2xl border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 rounded animate-pulse mx-auto w-3/4" />
            <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-1/2" />
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse mt-4" />
        </div>
      </CardContent>
    </Card>
  )
}
