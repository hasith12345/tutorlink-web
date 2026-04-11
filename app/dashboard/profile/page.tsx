"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, User, Mail, Calendar, Edit, GraduationCap, BookOpen, Loader2, X, Camera } from "lucide-react"
import { api, authStorage, UserProfile, UpdateProfileData } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingTutorAvatar, setUploadingTutorAvatar] = useState(false)
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    student: {
      dob: '',
      phone: '',
      address: '',
      schoolGrade: '',
      schoolName: '',
      parentName: '',
      parentPhone: ''
    },
    tutor: {
      dob: '',
      phone: '',
      address: '',
      idNumber: ''
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!authStorage.isAuthenticated()) {
          router.push('/login')
          return
        }

        const data = await api.getProfile()
        setProfile(data)
        // Initialize form data
        setFormData({
          fullName: data.fullName,
          student: {
            dob: data.student?.dob || '',
            phone: data.student?.phone || '',
            address: data.student?.address || '',
            schoolGrade: data.student?.schoolGrade || '',
            schoolName: data.student?.schoolName || '',
            parentName: data.student?.parentName || '',
            parentPhone: data.student?.parentPhone || ''
          },
          tutor: {
            dob: data.tutor?.dob || '',
            phone: data.tutor?.phone || '',
            address: data.tutor?.address || '',
            idNumber: data.tutor?.idNumber || ''
          }
        })
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          authStorage.clear()
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const result = await api.uploadStudentAvatar(file)
      // Update profile state with new avatar
      setProfile(prev => prev ? {
        ...prev,
        student: prev.student ? { ...prev.student, avatar: result.imageUrl } : prev.student
      } : prev)

      // Update localStorage so navbar and other components get the new avatar
      const currentUser = authStorage.getUser()
      if (currentUser) {
        authStorage.setUser({ ...currentUser, avatar: result.imageUrl })
      }
      // Notify other components (e.g. navbar) that user data changed
      window.dispatchEvent(new Event('userDataUpdated'))
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleTutorAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingTutorAvatar(true)
    try {
      const result = await api.uploadTutorAvatar(file)
      setProfile(prev => prev ? {
        ...prev,
        tutor: prev.tutor ? { ...prev.tutor, avatar: result.imageUrl } : prev.tutor
      } : prev)

      const currentUser = authStorage.getUser()
      if (currentUser) {
        authStorage.setUser({ ...currentUser, avatar: result.imageUrl })
      }
      window.dispatchEvent(new Event('userDataUpdated'))
    } catch (err) {
      console.error('Tutor avatar upload failed:', err)
      alert(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingTutorAvatar(false)
    }
  }

  const openEditModal = () => {
    setSaveError(null)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSaveError(null)
    // Reset form data to current profile
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        student: {
          dob: profile.student?.dob || '',
          phone: profile.student?.phone || '',
          address: profile.student?.address || '',
          schoolGrade: profile.student?.schoolGrade || '',
          schoolName: profile.student?.schoolName || '',
          parentName: profile.student?.parentName || '',
          parentPhone: profile.student?.parentPhone || ''
        },
        tutor: {
          dob: profile.tutor?.dob || '',
          phone: profile.tutor?.phone || '',
          address: profile.tutor?.address || '',
          idNumber: profile.tutor?.idNumber || ''
        }
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    try {
      const updateData: UpdateProfileData = {
        fullName: formData.fullName
      }

      // Add student data if student profile exists
      if (profile?.hasStudentProfile) {
        updateData.student = {
          dob: formData.student.dob || undefined,
          phone: formData.student.phone || undefined,
          address: formData.student.address || undefined,
          schoolGrade: formData.student.schoolGrade || undefined,
          schoolName: formData.student.schoolName || undefined,
          parentName: formData.student.parentName || undefined,
          parentPhone: formData.student.parentPhone || undefined
        }
      }

      // Add tutor data if tutor profile exists
      if (profile?.hasTutorProfile) {
        updateData.tutor = {
          dob: formData.tutor.dob || undefined,
          phone: formData.tutor.phone || undefined,
          address: formData.tutor.address || undefined,
          idNumber: formData.tutor.idNumber || undefined
        }
      }

      const result = await api.updateProfile(updateData)
      setProfile(result.profile)
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go back home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              {(profile.student?.avatar || profile.tutor?.avatar) ? (
                <img
                  src={profile.student?.avatar || profile.tutor?.avatar || ''}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getInitials(profile.fullName)}
                </div>
              )}
              {(profile.hasStudentProfile || profile.hasTutorProfile) && (
                <label className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity cursor-pointer ${
                  (uploadingAvatar || uploadingTutorAvatar) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {(uploadingAvatar || uploadingTutorAvatar) ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={profile.hasStudentProfile ? handleAvatarUpload : handleTutorAvatarUpload}
                    disabled={uploadingAvatar || uploadingTutorAvatar}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800">{profile.fullName}</h1>
              <p className="text-slate-600 mt-1">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {profile.hasStudentProfile && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Student
                  </span>
                )}
                {profile.hasTutorProfile && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Tutor
                  </span>
                )}
              </div>
              <button 
                onClick={openEditModal}
                className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="text-base text-slate-800 font-medium">{profile.fullName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-base text-slate-800 font-medium">{profile.email}</p>
                {profile.isEmailVerified && (
                  <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Member Since</p>
                <p className="text-base text-slate-800 font-medium">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Profile Details */}
        {profile.student && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Student Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.student.dob && (
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.dob}</p>
                </div>
              )}

              {profile.student.phone && (
                <div>
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.phone}</p>
                </div>
              )}

              {profile.student.schoolGrade && (
                <div>
                  <p className="text-sm text-slate-500">School Grade</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.schoolGrade}</p>
                </div>
              )}

              {profile.student.schoolName && (
                <div>
                  <p className="text-sm text-slate-500">School Name</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.schoolName}</p>
                </div>
              )}

              {profile.student.parentName && (
                <div>
                  <p className="text-sm text-slate-500">Parent Name</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.parentName}</p>
                </div>
              )}

              {profile.student.parentPhone && (
                <div>
                  <p className="text-sm text-slate-500">Parent Phone</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.parentPhone}</p>
                </div>
              )}

              {profile.student.address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="text-base text-slate-800 font-medium">{profile.student.address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tutor Profile Details */}
        {profile.tutor && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-800">Tutor Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.tutor.dob && (
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="text-base text-slate-800 font-medium">{profile.tutor.dob}</p>
                </div>
              )}

              {profile.tutor.phone && (
                <div>
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <p className="text-base text-slate-800 font-medium">{profile.tutor.phone}</p>
                </div>
              )}

              {profile.tutor.idNumber && (
                <div>
                  <p className="text-sm text-slate-500">ID Number</p>
                  <p className="text-base text-slate-800 font-medium">{profile.tutor.idNumber}</p>
                </div>
              )}

              {profile.tutor.address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="text-base text-slate-800 font-medium">{profile.tutor.address}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header — sticky, never scrolls */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body — only this part scrolls */}
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {saveError}
                </div>
              )}

              {/* Basic Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Student Profile Section */}
              {profile?.hasStudentProfile && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-slate-800">Student Profile</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.student.dob}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, dob: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.student.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0771234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData.student.address}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, address: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        School Grade
                      </label>
                      <input
                        type="text"
                        value={formData.student.schoolGrade}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, schoolGrade: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g., Grade 10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={formData.student.schoolName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, schoolName: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Enter school name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Parent Name
                      </label>
                      <input
                        type="text"
                        value={formData.student.parentName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, parentName: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Enter parent name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Parent Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.student.parentPhone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          student: { ...prev.student, parentPhone: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0771234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tutor Profile Section */}
              {profile?.hasTutorProfile && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <h4 className="text-lg font-semibold text-slate-800">Tutor Profile</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.tutor.dob}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tutor: { ...prev.tutor, dob: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.tutor.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tutor: { ...prev.tutor, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="0771234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData.tutor.address}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tutor: { ...prev.tutor, address: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ID Number (NIC)
                      </label>
                      <input
                        type="text"
                        value={formData.tutor.idNumber}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          tutor: { ...prev.tutor, idNumber: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="123456789V or 123456789012"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer — sticky, never scrolls */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
