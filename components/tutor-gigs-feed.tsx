"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Monitor, Users, Shuffle, Loader2, BookOpen, Clock, Award } from "lucide-react"

interface TutorGig {
  id: number
  name: string
  subject: string
  location: string
  mode: "online" | "physical" | "hybrid"
  rating: number
  reviews: number
  hourlyRate: number
  avatar: string
  experience: string
  students: number
  verified: boolean
  gradient: string
}

const generateGigs = (start: number, count: number): TutorGig[] => {
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "English",
    "Biology",
    "History",
    "Computer Science",
    "Economics",
  ]
  const locations = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
  ]
  const modes: ("online" | "physical" | "hybrid")[] = ["online", "physical", "hybrid"]
  const names = [
    "Sarah Johnson",
    "Michael Chen",
    "Emily Davis",
    "James Wilson",
    "Emma Brown",
    "David Lee",
    "Olivia Martinez",
    "Daniel Taylor",
  ]

  // Array of gradient combinations for fallback
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-purple-500 to-fuchsia-600",
    "from-teal-500 to-blue-600",
    "from-amber-500 to-orange-600",
  ]

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length]
    const seed = `${name}-${start + i}`
    
    return {
      id: start + i,
      name,
      subject: subjects[i % subjects.length],
      location: locations[i % locations.length],
      mode: modes[i % modes.length],
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 200) + 10,
      hourlyRate: Math.floor(Math.random() * 50) + 20,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      experience: `${Math.floor(Math.random() * 8) + 2} years`,
      students: Math.floor(Math.random() * 150) + 20,
      verified: Math.random() > 0.3,
      gradient: gradients[i % gradients.length],
    }
  })
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

export function TutorGigsFeed() {
  const [gigs, setGigs] = useState<TutorGig[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    // Simulate initial load
    setTimeout(() => {
      setGigs(generateGigs(0, 8))
      setLoading(false)
    }, 1000)
  }, [])

  const loadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setGigs((prev) => [...prev, ...generateGigs(prev.length, 4)])
      setLoadingMore(false)
    }, 800)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-4xl fo text-gray-900 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>Available Tutors</h2>
          <p className="text-5xl md:text-2xl fo text-gray-400 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>Browse our community of qualified tutors ready to help you succeed</p>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <GigSkeleton key={i} />)
            : gigs.map((gig, index) => <GigCard key={gig.id} gig={gig} index={index} />)}
        </div>

        {/* Load More */}
        {!loading && (
          <div className="text-center mt-10">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="px-8 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 bg-transparent"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Tutors"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function GigCard({ gig, index }: { gig: TutorGig; index: number }) {
  const router = useRouter()
  const ModeIcon = modeIcons[gig.mode]

  const handleViewProfile = () => {
    router.push(`/gig-details/${gig.id}`)
  }

  return (
    <Card
      className="group bg-white rounded-2xl border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-0">
        {/* Profile Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-6 pb-8">
          {/* Verified Badge */}
          {gig.verified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white border-0 shadow-sm">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg ring-4 ring-white overflow-hidden">
              <img 
                src={gig.avatar} 
                alt={gig.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Subject */}
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{gig.name}</h3>
            <p className="text-indigo-600 font-semibold text-sm flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" />
              {gig.subject}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{gig.experience}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{gig.students} students</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{gig.location}</span>
          </div>

          {/* Mode Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${modeColors[gig.mode]} rounded-lg px-3 py-1`}>
              <ModeIcon className="w-3.5 h-3.5 mr-1.5" />
              {gig.mode.charAt(0).toUpperCase() + gig.mode.slice(1)}
            </Badge>
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">({gig.reviews})</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Starting at</div>
              <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ${gig.hourlyRate}/hr
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleViewProfile}
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
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 rounded animate-pulse mx-auto w-3/4" />
            <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-1/2" />
          </div>
        </div>
        {/* Body Skeleton */}
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
