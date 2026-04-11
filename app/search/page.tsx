"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Locate, Monitor, Users, Shuffle, Star, BookOpen, Clock, Award, Loader2, ArrowLeft, User } from "lucide-react"
import { api } from "@/lib/api"
import { TutorGigsFeed } from "@/components/tutor-gigs-feed"

interface TutorResult {
  id: string
  name: string
  subject: string
  subjects: string[]
  location: string
  learningMode: "online" | "physical" | "hybrid"
  rating: number
  totalReviews: number
  hourlyRate: number
  avatar: string
  experience: string
  totalStudents: number
  isVerified: boolean
  bio: string
}

interface Suggestion {
  id: string
  name: string
  subject: string
  displayText: string
  avatar: string
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

export default function SearchPage() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [location, setLocation] = useState("")
  const [learningMode, setLearningMode] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<TutorResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const suggestionDebounceRef = useRef<number | null>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (suggestionDebounceRef.current) {
        window.clearTimeout(suggestionDebounceRef.current)
        suggestionDebounceRef.current = null
      }
    }
  }, [])

  // Fetch suggestions as user types (debounced + defensive parsing)
  const handleSubjectChange = (value: string) => {
    setSubject(value)

    // Clear any pending debounce
    if (suggestionDebounceRef.current) {
      window.clearTimeout(suggestionDebounceRef.current)
      suggestionDebounceRef.current = null
    }

    if (value.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setIsLoadingSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    setShowSuggestions(true)

    suggestionDebounceRef.current = window.setTimeout(async () => {
      try {
        const response = await api.getTutorSuggestions(value, 6)

        // Support multiple response shapes
        let suggestionsList: any[] = []
        if (!response) {
          suggestionsList = []
        } else if (Array.isArray(response)) {
          suggestionsList = response
        } else if (Array.isArray(response.suggestions)) {
          suggestionsList = response.suggestions
        } else if (Array.isArray(response.data)) {
          suggestionsList = response.data
        } else if (Array.isArray(response.results)) {
          suggestionsList = response.results
        }

        const normalized = suggestionsList.map((s: any) => ({
          id: s.id ?? s._id ?? `${s.name || ''}-${s.subject || ''}`,
          name: s.name ?? s.displayName ?? '',
          subject: s.subject ?? (Array.isArray(s.subjects) ? s.subjects[0] : '') ?? '',
          displayText:
            s.displayText ?? (s.name ? (s.subject ? `${s.name} — ${s.subject}` : s.name) : s.subject ?? ''),
          avatar: s.avatar ?? s.image ?? '',
        }))

        setSuggestions(normalized)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSubject(suggestion.displayText)
    setShowSuggestions(false)
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocation("Unable to get location")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await api.searchTutors({
        subject: subject || undefined,
        location: location || undefined,
        learningMode: learningMode || undefined,
        limit: 50,
      })

      if (response.success) {
        setSearchResults(response.tutors.map((tutor: any) => ({
          id: tutor.id,
          name: tutor.name,
          subject: tutor.subject,
          subjects: tutor.subjects || [],
          location: tutor.location,
          learningMode: tutor.learningMode,
          rating: tutor.rating,
          totalReviews: tutor.totalReviews,
          hourlyRate: tutor.hourlyRate,
          avatar: tutor.avatar,
          experience: tutor.experience,
          totalStudents: tutor.totalStudents,
          isVerified: tutor.isVerified,
          bio: tutor.bio,
        })))
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const modes = [
    { id: "online", label: "Online", icon: Monitor },
    { id: "physical", label: "Physical", icon: Users },
    { id: "hybrid", label: "Hybrid", icon: Shuffle },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Airbnb-Style Search Bar */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl fo text-gray-900 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>
            Find Your Perfect Tutor
          </h1>
          <p className="text-5xl md:text-2xl fo text-gray-400 mb-2 text-center" style={{ fontFamily: 'var(--font-delicious-handrawn)' }}>
            Search by subject, tutor name, or location
          </p>

          {/* Pill-shaped Search Container */}
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow overflow-visible">
              <div className="flex flex-col md:flex-row items-stretch relative">
                {/* Subject/What Section */}
                <div className="relative flex-1 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="px-6 py-3.5 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors">
                    <label className="block text-xs font-semibold text-gray-900 mb-0.5">What</label>
                    <Input
                      ref={searchInputRef}
                      placeholder="Search subject or tutor"
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      onFocus={() => subject.trim().length > 0 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
                      autoComplete="off"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto"
                    >
                      {isLoadingSuggestions ? (
                        <div className="px-4 py-6 text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Loading suggestions...</p>
                        </div>
                      ) : (
                        suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 group"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                              {suggestion.avatar ? (
                                <img src={suggestion.avatar} alt={suggestion.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-indigo-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{suggestion.displayText}</p>
                            </div>
                            <Search className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Location/Where Section */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <label className="block text-xs font-semibold text-gray-900 mb-0.5">Where</label>
                    <Input
                      placeholder="Add location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
                    />
                  </div>
                </div>

                {/* Learning Mode/Who Section */}
                <div className="flex-1">
                  <div className="px-6 py-3.5 hover:bg-gray-50 transition-colors rounded-r-full">
                    <label className="block text-xs font-semibold text-gray-900 mb-0.5">Mode</label>
                    <select
                      value={learningMode || ""}
                      onChange={(e) => setLearningMode(e.target.value || null)}
                      className="border-0 p-0 text-sm text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent cursor-pointer w-full outline-none shadow-none"
                    >
                      <option value="" className="text-gray-500">Any mode</option>
                      <option value="online" className="text-gray-900">Online</option>
                      <option value="physical" className="text-gray-900">Physical</option>
                      <option value="hybrid" className="text-gray-900">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Mobile Search Button */}
                <div className="md:hidden p-3">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions Below Search Bar */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Locate className="w-3.5 h-3.5 mr-1.5" />
                Use my location
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="relative z-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchResults.length > 0 ? `Found ${searchResults.length} tutor${searchResults.length !== 1 ? 's' : ''}` : 'No tutors found'}
              </h2>
              {searchResults.length > 0 && (
                <p className="text-gray-600 mt-1">
                  {subject && `for "${subject}" `}
                  {location && `in ${location}`}
                </p>
              )}
            </div>

            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TutorSkeleton key={i} />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-600">Try adjusting your search filters or location</p>
                </div>
              </Card>
            )}
          </div>
        )}
        <TutorGigsFeed />
      </main>
    </div>
  )
}

function TutorCard({ tutor }: { tutor: TutorResult }) {
  const ModeIcon = modeIcons[tutor.learningMode]
  const formattedPrice = tutor.hourlyRate ? `$${(tutor.hourlyRate / 100).toFixed(2)}/hr` : 'Contact for pricing'

  return (
    <Card className="group bg-white rounded-2xl border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Profile Header with Gradient Background */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50/50 to-blue-50 p-6 pb-8">
          {/* Verified Badge */}
          {tutor.isVerified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white border-0 shadow-sm text-xs">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg ring-4 ring-white overflow-hidden">
              <img 
                src={tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.name)}`}
                alt={tutor.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Subject */}
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-1">{tutor.name}</h3>
            <p className="text-indigo-600 font-semibold text-sm flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" />
              {tutor.subject}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Bio */}
          {tutor.bio && (
            <p className="text-xs text-gray-600 line-clamp-2">{tutor.bio}</p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{tutor.experience}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{tutor.totalStudents} students</span>
            </div>
          </div>

          {/* Location */}
          {tutor.location && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{tutor.location}</span>
            </div>
          )}

          {/* Mode Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${modeColors[tutor.learningMode]} rounded-lg px-3 py-1 text-xs`}>
              <ModeIcon className="w-3.5 h-3.5 mr-1.5" />
              {tutor.learningMode.charAt(0).toUpperCase() + tutor.learningMode.slice(1)}
            </Badge>
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{tutor.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">({tutor.totalReviews})</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Starting at</div>
              <div className="text-base font-bold text-indigo-600">{formattedPrice}</div>
            </div>
          </div>

          {/* Action Button */}
          <Button className="w-full mt-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm">
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TutorSkeleton() {
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
