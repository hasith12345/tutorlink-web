"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign, Users, BookOpen, Star, TrendingUp, Plus, Edit, Trash2, Monitor } from "lucide-react"

interface ScheduledClass {
  id: string
  topic: string
  date: string
  time: string
  duration: number
  totalSeats: number
  enrolledSeats: number
  price: number
  mode: "online" | "physical" | "hybrid"
  status: "active" | "full" | "completed"
}

export function TutorDashboardContent() {
  const [scheduledClasses] = useState<ScheduledClass[]>([
    {
      id: "1-1",
      topic: "Calculus Fundamentals",
      date: "2026-01-28",
      time: "10:00 AM",
      duration: 60,
      totalSeats: 5,
      enrolledSeats: 2,
      price: 35,
      mode: "online",
      status: "active"
    },
    {
      id: "1-2",
      topic: "Advanced Algebra",
      date: "2026-01-29",
      time: "2:00 PM",
      duration: 90,
      totalSeats: 4,
      enrolledSeats: 2,
      price: 50,
      mode: "online",
      status: "active"
    },
    {
      id: "1-3",
      topic: "Trigonometry Basics",
      date: "2026-01-30",
      time: "4:00 PM",
      duration: 60,
      totalSeats: 6,
      enrolledSeats: 2,
      price: 35,
      mode: "online",
      status: "active"
    },
    {
      id: "1-4",
      topic: "SAT Math Prep",
      date: "2026-02-01",
      time: "11:00 AM",
      duration: 60,
      totalSeats: 5,
      enrolledSeats: 0,
      price: 35,
      mode: "online",
      status: "active"
    },
    {
      id: "1-5",
      topic: "Linear Equations Workshop",
      date: "2026-01-27",
      time: "3:00 PM",
      duration: 60,
      totalSeats: 4,
      enrolledSeats: 4,
      price: 35,
      mode: "online",
      status: "full"
    }
  ])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Monitor className="w-3.5 h-3.5 text-blue-600" />
      case "physical":
        return <Users className="w-3.5 h-3.5 text-green-600" />
      case "hybrid":
        return <div className="flex items-center gap-0.5">
          <Monitor className="w-3 h-3 text-purple-600" />
          <Users className="w-3 h-3 text-purple-600" />
        </div>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your tutoring activity.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500 mt-1">8 completed, 4 upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hours Taught</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,340</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Scheduled Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Scheduled Classes</CardTitle>
                <CardDescription>Manage your upcoming class schedule</CardDescription>
              </div>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledClasses.filter(c => c.status !== "completed").map((classItem) => (
                <div 
                  key={classItem.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    classItem.status === "full" 
                      ? "bg-gray-50 border-gray-200" 
                      : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{classItem.topic}</h3>
                        <Badge variant={classItem.status === "full" ? "secondary" : "default"}>
                          {classItem.status === "full" ? "Full" : `${classItem.totalSeats - classItem.enrolledSeats} seats left`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(classItem.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {classItem.time}
                        </span>
                        <span>{classItem.duration} min</span>
                        <span className="flex items-center gap-1">
                          {getModeIcon(classItem.mode)}
                          <span className="capitalize">{classItem.mode}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Enrolled: <span className="font-semibold text-gray-900">{classItem.enrolledSeats}/{classItem.totalSeats}</span>
                        </span>
                        <span className="text-indigo-600 font-bold">${classItem.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {classItem.enrolledSeats > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <Button variant="link" className="text-xs p-0 h-auto text-indigo-600">
                        View {classItem.enrolledSeats} enrolled student{classItem.enrolledSeats > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {scheduledClasses.filter(c => c.status !== "completed").length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No scheduled classes yet</p>
                <p className="text-sm text-gray-400 mb-4">Create your first class to start accepting enrollments</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews & Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rating</CardTitle>
            <CardDescription>Based on student reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900">4.9</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Based on 48 reviews</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">5★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: "85%" }} />
                </div>
                <span className="text-sm text-gray-500 w-8">41</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">4★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: "12%" }} />
                </div>
                <span className="text-sm text-gray-500 w-8">5</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">3★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: "4%" }} />
                </div>
                <span className="text-sm text-gray-500 w-8">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
