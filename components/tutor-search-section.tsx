"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Locate, Monitor, Users, Shuffle, User } from "lucide-react"

export function TutorSearchSection() {
  const [subject, setSubject] = useState("")
  const [location, setLocation] = useState("")
  const [learningMode, setLearningMode] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

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

  // Fetch suggestions as user types
  const handleSubjectChange = (value: string) => {
    setSubject(value)

    if (value.trim().length > 0) {
      // Mock suggestions - replace with actual API call
      const allSuggestions = [
        "Mathematics - Sarah Johnson",
        "Mathematics - Michael Chen",
        "Physics - Emily Davis",
        "Physics - James Wilson",
        "Chemistry - Emma Brown",
        "Chemistry - David Lee",
        "English - Olivia Martinez",
        "English - Daniel Taylor",
        "Biology - Sarah Johnson",
        "History - Michael Chen",
        "Computer Science - Emily Davis",
        "Economics - James Wilson",
      ]

      const filtered = allSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )

      setSuggestions(filtered.slice(0, 6))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSubject(suggestion)
    setShowSuggestions(false)
  }

  const handleSearch = () => {
    // Handle search - you can add your search logic here
    console.log("Searching with:", { subject, location, learningMode })
    // TODO: Implement search functionality
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`)
        },
        () => {
          setLocation("Unable to get location")
        },
      )
    }
  }

  const modes = [
    { id: "online", label: "Online", icon: Monitor },
    { id: "physical", label: "Physical", icon: Users },
    { id: "hybrid", label: "Hybrid", icon: Shuffle },
  ]

  return (
    <section id="tutor-search" className="py-0 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-2xl rounded-2xl border-0">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Search for Tutors</h2>

            <div className="space-y-4">
              {/* Subject Search with Autocomplete */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder="What subject do you want to learn?"
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  onFocus={() => subject.trim().length > 0 && setShowSuggestions(true)}
                  className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  autoComplete="off"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{suggestion}</p>
                        </div>
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Enter your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  className="h-14 px-4 rounded-xl border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-transparent"
                >
                  <Locate className="w-5 h-5" />
                </Button>
              </div>

              {/* Learning Mode Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Learning Mode</p>
                <div className="flex flex-wrap gap-3">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setLearningMode(learningMode === mode.id ? null : mode.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all duration-200 ${
                        learningMode === mode.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600"
                      }`}
                    >
                      <mode.icon className="w-5 h-5" />
                      <span className="font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in">
                <Search className="w-5 h-5 mr-2" />
                Search Tutors
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
