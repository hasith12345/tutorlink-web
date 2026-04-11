'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star,
  Clock,
  Users,
  MapPin,
  Monitor,
  Users2,
  Shuffle,
  ChevronRight,
  MessageCircle,
  Share2,
  BookOpen,
  TrendingUp,
  Award,
  FileText,
} from 'lucide-react'

// Mock tutor data - in a real app, this would come from a database
const tutorData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Mathematics Expert',
    bio: 'Passionate mathematics educator with 6 years of experience. I believe in making complex concepts simple and enjoyable.',
    avatar: '/female-tutor.jpg',
    subject: 'Mathematics',
    experience: 6,
    students: 21,
    location: 'New York',
    mode: 'online',
    rating: 4.1,
    reviews: 66,
    hourlyRate: 48,
    verified: true,
    education: [
      { degree: 'M.S.', field: 'Mathematics', university: 'MIT' },
      { degree: 'B.S.', field: 'Mathematics', university: 'Stanford University' },
    ],
    certifications: ['Cambridge Teaching Credential', 'Advanced Mathematics Specialist'],
    responseTime: '1 hour',
    acceptanceRate: '98%',
  },
  '2': {
    id: '2',
    name: 'Michael Chen',
    title: 'Physics Specialist',
    bio: 'Physics enthusiast helping students understand the fundamentals. 3 years experience with 79 satisfied students.',
    avatar: '/male-tutor.jpg',
    subject: 'Physics',
    experience: 3,
    students: 79,
    location: 'Los Angeles',
    mode: 'physical',
    rating: 4.5,
    reviews: 172,
    hourlyRate: 52,
    verified: true,
    education: [
      { degree: 'M.S.', field: 'Physics', university: 'Caltech' },
      { degree: 'B.S.', field: 'Physics', university: 'UC Berkeley' },
    ],
    certifications: ['Physics Teaching Award 2024', 'Advanced Lab Instructor'],
    responseTime: '30 minutes',
    acceptanceRate: '99%',
  },
  '3': {
    id: '3',
    name: 'Emily Davis',
    title: 'Chemistry Expert',
    bio: 'Chemistry tutor with 9 years of teaching experience. Specialized in organic and inorganic chemistry.',
    avatar: '/female-chemistry-tutor.jpg',
    subject: 'Chemistry',
    experience: 9,
    students: 92,
    location: 'Chicago',
    mode: 'hybrid',
    rating: 4.6,
    reviews: 48,
    hourlyRate: 54,
    verified: true,
    education: [
      { degree: 'Ph.D.', field: 'Chemistry', university: 'Harvard University' },
      { degree: 'B.S.', field: 'Chemistry', university: 'Northwestern University' },
    ],
    certifications: ['Professional Chemistry Teacher', 'Research Mentor Certification'],
    responseTime: '15 minutes',
    acceptanceRate: '100%',
  },
  '4': {
    id: '4',
    name: 'James Wilson',
    title: 'English Language Expert',
    bio: 'English tutor helping students master literature, writing, and communication skills.',
    avatar: '/male-teacher-english.jpg',
    subject: 'English',
    experience: 6,
    students: 91,
    location: 'Houston',
    mode: 'online',
    rating: 4.4,
    reviews: 28,
    hourlyRate: 36,
    verified: true,
    education: [
      { degree: 'M.A.', field: 'English Literature', university: 'University of Texas' },
      { degree: 'B.A.', field: 'English', university: 'Rice University' },
    ],
    certifications: ['TESOL Certification', 'Academic Writing Specialist'],
    responseTime: '45 minutes',
    acceptanceRate: '96%',
  },
}

// Mock classes data
const classesData: Record<string, any> = {
  '1': [
    {
      id: '1',
      name: 'Algebra Fundamentals',
      level: 'Intermediate',
      schedule: 'Mon, Wed, Fri - 4:00 PM',
      students: 12,
      price: 48,
      description: 'Master algebraic equations and functions',
    },
    {
      id: '2',
      name: 'Calculus Basics',
      level: 'Advanced',
      schedule: 'Tue, Thu - 6:00 PM',
      students: 8,
      price: 52,
      description: 'Introduction to limits and derivatives',
    },
    {
      id: '3',
      name: 'SAT Math Prep',
      level: 'High School',
      schedule: 'Sat, Sun - 10:00 AM',
      students: 15,
      price: 55,
      description: 'Complete SAT mathematics preparation',
    },
  ],
  '2': [
    {
      id: '1',
      name: 'Physics Mechanics',
      level: 'Intermediate',
      schedule: 'Mon, Wed - 5:00 PM',
      students: 10,
      price: 52,
      description: 'Classical mechanics and motion',
    },
    {
      id: '2',
      name: 'Quantum Physics',
      level: 'Advanced',
      schedule: 'Fri - 7:00 PM',
      students: 6,
      price: 58,
      description: 'Introduction to quantum mechanics',
    },
  ],
  '3': [
    {
      id: '1',
      name: 'Organic Chemistry',
      level: 'Advanced',
      schedule: 'Tue, Thu - 6:00 PM',
      students: 9,
      price: 54,
      description: 'Reactions, mechanisms, and synthesis',
    },
    {
      id: '2',
      name: 'General Chemistry',
      level: 'Intermediate',
      schedule: 'Mon, Wed, Fri - 4:30 PM',
      students: 14,
      price: 50,
      description: 'Periodic table, bonding, and reactions',
    },
    {
      id: '3',
      name: 'AP Chemistry Review',
      level: 'Advanced',
      schedule: 'Sat - 2:00 PM',
      students: 11,
      price: 56,
      description: 'Complete AP Chemistry exam preparation',
    },
  ],
  '4': [
    {
      id: '1',
      name: 'English Literature',
      level: 'Intermediate',
      schedule: 'Mon, Wed - 3:00 PM',
      students: 13,
      price: 36,
      description: 'Classics and contemporary literature analysis',
    },
    {
      id: '2',
      name: 'Academic Writing',
      level: 'All Levels',
      schedule: 'Tue, Thu - 5:00 PM',
      students: 18,
      price: 40,
      description: 'Essays, research papers, and academic writing',
    },
  ],
}

const modeConfig = {
  online: { label: 'Online', icon: Monitor, color: 'bg-blue-100 text-blue-700' },
  physical: { label: 'Physical', icon: Users2, color: 'bg-green-100 text-green-700' },
  hybrid: { label: 'Hybrid', icon: Shuffle, color: 'bg-purple-100 text-purple-700' },
}

function ClassCard({ classItem, tutorId }: { classItem: any; tutorId: string }) {
  return (
    <Card className="bg-white rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{classItem.name}</h3>
            <Badge variant="outline" className="text-xs">
              {classItem.level}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">${classItem.price}</p>
            <p className="text-xs text-gray-500">/hour</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{classItem.description}</p>

        <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{classItem.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{classItem.students} students enrolled</span>
          </div>
        </div>

        <Link href={`/booking/${tutorId}?classId=${classItem.id}`}>
          <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300">
            Enroll Now
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function TutorPublicProfilePage() {
  const [contactOpen, setContactOpen] = useState(false)
  // Default to tutor 1 for now - in production this would come from query params or props
  const tutor = tutorData['1']
  const classes = classesData['1']
  const ModeConfig = modeConfig[tutor.mode as keyof typeof modeConfig]
  const ModeIcon = ModeConfig.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 font-medium">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Tutors
        </Link>

        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <img
                    src={tutor.avatar || "/placeholder.svg"}
                    alt={tutor.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-indigo-200 to-purple-200"
                  />
                  {tutor.verified && (
                    <Badge className="absolute -bottom-2 -right-2 bg-green-500 text-white border-0 rounded-full p-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">{tutor.name}</h1>
                  <p className="text-lg text-indigo-600 font-semibold mb-3">{tutor.title}</p>
                  <p className="text-gray-600 mb-4">{tutor.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${ModeConfig.color} border-0 flex items-center gap-1`}>
                      <ModeIcon className="w-3 h-3" />
                      {ModeConfig.label}
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {tutor.rating} ({tutor.reviews} reviews)
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50"
                      onClick={() => setContactOpen(!contactOpen)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent border-gray-300 hover:bg-gray-50">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-white rounded-xl border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{tutor.students}</div>
                  <p className="text-sm text-gray-600">Students Taught</p>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-xl border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{tutor.experience}</div>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-xl border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600 mb-1">{tutor.responseTime}</div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                </CardContent>
              </Card>
              <Card className="bg-white rounded-xl border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{tutor.acceptanceRate}</div>
                  <p className="text-sm text-gray-600">Acceptance Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Education & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Education
                </h3>
                <div className="space-y-3">
                  {tutor.education.map((edu: any, idx: number) => (
                    <div key={idx} className="pb-3 border-b border-gray-100 last:border-0">
                      <p className="font-semibold text-gray-900">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-sm text-gray-600">{edu.university}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {tutor.certifications.map((cert: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Pricing Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white rounded-2xl border-0 shadow-lg sticky top-20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-2">Hourly Rate</p>
                  <p className="text-5xl font-bold text-indigo-600 mb-1">${tutor.hourlyRate}</p>
                  <p className="text-sm text-gray-500">/hour</p>
                </div>

                <div className="space-y-3 pb-6 border-b border-gray-200 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold text-gray-900">{tutor.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location</span>
                    <span className="font-semibold text-gray-900">{tutor.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Acceptance</span>
                    <span className="font-semibold text-gray-900">{tutor.acceptanceRate}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mb-4">
                  Select a class below to get started with your learning journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Classes Section */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              Available Classes
            </h2>
            <p className="text-gray-600">Choose from {classes.length} carefully designed classes tailored to your learning needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem: any) => (
              <ClassCard key={classItem.id} classItem={classItem} tutorId={tutor.id} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to start learning?</h3>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
            Select a class above and begin your personalized learning journey with {tutor.name.split(' ')[0]}.
          </p>
          <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg">
            View More Classes
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
