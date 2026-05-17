// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export interface SignupData {
  fullName: string
  email: string
  password: string
  role: 'student' | 'tutor'
  // Student-specific fields
  dob?: string
  phone?: string
  address?: string
  schoolGrade?: string
  schoolName?: string
  parentName?: string
  parentPhone?: string
  // Tutor-specific fields
  idNumber?: string
  idCopyFront?: string
  idCopyBack?: string
  idCopyPdf?: string
  qualifications?: string
  subjects?: string[]
  experience?: string
  cvUrl?: string
}

// ✅ OAuth Signup Data (no password needed)
export interface OAuthSignupData {
  fullName: string
  email: string
  role: 'student' | 'tutor'
  // Student-specific fields
  dob?: string
  phone?: string
  address?: string
  schoolGrade?: string
  schoolName?: string
  parentName?: string
  parentPhone?: string
  // Tutor-specific fields
  idNumber?: string
  idCopyFront?: string
  idCopyBack?: string
  idCopyPdf?: string
  qualifications?: string
  subjects?: string[]
  experience?: string
  cvUrl?: string
}

export interface LoginData {
  email: string
  password: string
}

// ✅ Updated AuthResponse for new login structure
export interface AuthResponse {
  token: string
  role?: 'student' | 'tutor'  // For signup response
  email?: string
  isEmailVerified?: boolean
  message?: string
  user?: {
    id: string
    email: string
    fullName: string
    hasStudentProfile: boolean
    hasTutorProfile: boolean
  }
}

// ✅ Add Role Data Interface
export interface AddRoleData {
  role: 'student' | 'tutor'
  // Student-specific fields
  dob?: string
  phone?: string
  address?: string
  schoolGrade?: string
  schoolName?: string
  parentName?: string
  parentPhone?: string
  // Tutor-specific fields
  idNumber?: string
  idCopyFront?: string
  idCopyBack?: string
  idCopyPdf?: string
  qualifications?: string
  subjects?: string[]
  experience?: string
  cvUrl?: string
}

// ✅ User Profile Response
export interface UserProfile {
  id: string
  fullName: string
  email: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  hasStudentProfile: boolean
  hasTutorProfile: boolean
  student: {
    id: string
    dob: string | null
    phone: string | null
    address: string | null
    schoolGrade: string | null
    schoolName: string | null
    parentName: string | null
    parentPhone: string | null
    avatar: string | null
    createdAt: string
  } | null
  tutor: {
    id: string
    dob: string | null
    phone: string | null
    address: string | null
    idNumber: string | null
    avatar: string | null
    createdAt: string
  } | null
}

// ✅ Update Profile Request Data
export interface UpdateProfileData {
  fullName?: string
  student?: {
    dob?: string
    phone?: string
    address?: string
    schoolGrade?: string
    schoolName?: string
    parentName?: string
    parentPhone?: string
  }
  tutor?: {
    dob?: string
    phone?: string
    address?: string
    idNumber?: string
    idCopyFront?: string
    idCopyBack?: string
    idCopyPdf?: string
    qualifications?: string
    subjects?: string[]
    experience?: string
  }
}

export interface ApiError {
  message: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  // Authentication endpoints
  async signup(data: SignupData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ✅ OAuth Signup - Creates account for OAuth users with profile
  async oauthSignup(data: OAuthSignupData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/oauth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyEmail(email: string, code: string): Promise<{ verified: boolean; message: string }> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  }

  async resendVerificationCode(email: string): Promise<{ sent: boolean; message: string }> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // ✅ Add Role endpoint (authenticated)
  async addRole(data: AddRoleData): Promise<{ message: string; hasStudentProfile: boolean; hasTutorProfile: boolean }> {
    const token = authStorage.getToken()
    return this.request('/auth/add-role', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
  }

  // ✅ Get current user with role flags (authenticated)
  async getCurrentUser(): Promise<{ user: any }> {
    const token = authStorage.getToken()
    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
  }

  // ✅ Get User Profile (authenticated)
  async getProfile(): Promise<UserProfile> {
    const token = authStorage.getToken()
    return this.request<UserProfile>('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
  }

  // ✅ Update User Profile (authenticated)
  async updateProfile(data: UpdateProfileData): Promise<{ message: string; profile: UserProfile }> {
    const token = authStorage.getToken()
    return this.request('/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })
  }

  // ✅ Upload Student Avatar (authenticated)
  async uploadStudentAvatar(file: File): Promise<{ message: string; imageUrl: string }> {
    const token = authStorage.getToken()
    const formData = new FormData()
    formData.append('image', file)

    const url = `${this.baseUrl}/upload/student-avatar`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `Upload failed: ${response.status}`)
    }
    return data
  }

  // ✅ Upload Tutor Avatar (authenticated)
  async uploadTutorAvatar(file: File): Promise<{ message: string; imageUrl: string }> {
    const token = authStorage.getToken()
    const formData = new FormData()
    formData.append('image', file)

    const url = `${this.baseUrl}/upload/tutor-avatar`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `Upload failed: ${response.status}`)
    }
    return data
  }

  // ✅ Change Password (authenticated)
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const token = authStorage.getToken()
    return this.request('/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // ✅ Set Password for OAuth users (no current password needed)
  async setPassword(newPassword: string): Promise<{ message: string }> {
    const token = authStorage.getToken()
    return this.request('/auth/set-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword }),
    })
  }

  // Add token to requests for authenticated endpoints
  setAuthToken(token: string) {
    // This can be used for future authenticated requests
    return token
  }

  // Tutor endpoints
  async searchTutors(params: {
    subject?: string
    location?: string
    learningMode?: string
    limit?: number
  }): Promise<{ success: boolean; count: number; tutors: any[] }> {
    const queryParams = new URLSearchParams()
    if (params.subject) queryParams.append('subject', params.subject)
    if (params.location) queryParams.append('location', params.location)
    if (params.learningMode) queryParams.append('learningMode', params.learningMode)
    if (params.limit) queryParams.append('limit', params.limit.toString())

    return this.request(`/tutors/search?${queryParams.toString()}`, {
      method: 'GET',
    })
  }

  async getTutorSuggestions(query: string, limit = 10): Promise<{ success: boolean; suggestions: any[] }> {
    const queryParams = new URLSearchParams({ query, limit: limit.toString() })
    return this.request(`/tutors/suggestions?${queryParams.toString()}`, {
      method: 'GET',
    })
  }

  async getTutorById(id: string): Promise<{ success: boolean; tutor: any }> {
    return this.request(`/tutors/${id}`, {
      method: 'GET',
    })
  }

  async seedMockTutors(): Promise<{ success: boolean; message: string; tutors: any[] }> {
    return this.request('/tutors/seed', {
      method: 'POST',
    })
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }

  // ✅ Tutor Application endpoints
  async submitTutorApplication(data: {
    cvUrl?: string
    qualifications: string
    subjects: string[]
    experience?: string
  }): Promise<{ message: string; tutorStatus: string }> {
    const token = authStorage.getToken()
    return this.request('/tutor/application/submit', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  }

  async getTutorApplicationStatus(): Promise<{
    tutorStatus: string
    profile: {
      applicationStatus: string
      cvUrl: string | null
      qualifications: string | null
      subjects: string[]
      experience: string | null
      rating: number
      totalReviews: number
      totalStudents: number
    }
  }> {
    const token = authStorage.getToken()
    return this.request('/tutor/application/status', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  async uploadCV(file: File): Promise<{ message: string; cvUrl: string }> {
    const token = authStorage.getToken()
    const formData = new FormData()
    formData.append('cv', file)

    const url = `${this.baseUrl}/tutor/application/upload-cv`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || `Upload failed: ${response.status}`)
    }
    return data
  }

  // ✅ Class Management endpoints
  async createClass(data: {
    subject: string
    description?: string
    venue?: string
    mode: string
    location?: string
    schedule: string[]
    time: string
    duration: string
    fees: number
    maxStudents?: number
  }): Promise<{ message: string; class: any }> {
    const token = authStorage.getToken()
    return this.request('/tutor/classes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  }

  async getMyClasses(): Promise<{ classes: any[] }> {
    const token = authStorage.getToken()
    return this.request('/tutor/classes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  async getClassById(classId: string): Promise<{ class: any }> {
    const token = authStorage.getToken()
    return this.request(`/tutor/classes/${classId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  async updateClass(classId: string, data: any): Promise<{ message: string; class: any }> {
    const token = authStorage.getToken()
    return this.request(`/tutor/classes/${classId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  }

  async cancelClass(classId: string): Promise<{ message: string; class: any }> {
    const token = authStorage.getToken()
    return this.request(`/tutor/classes/${classId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  async deleteClass(classId: string): Promise<{ message: string }> {
    const token = authStorage.getToken()
    return this.request(`/tutor/classes/${classId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  // ✅ Admin endpoints
  async getAdminApplications(status?: string): Promise<{ applications: any[] }> {
    const query = status ? `?status=${status}` : ''
    return this.request(`/tutor/admin/applications${query}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  async approveApplication(tutorId: string): Promise<{ message: string; tutor: any }> {
    return this.request(`/tutor/admin/applications/${tutorId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  async rejectApplication(tutorId: string): Promise<{ message: string; tutor: any }> {
    return this.request(`/tutor/admin/applications/${tutorId}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  private getAdminToken(): string | null {
    if (typeof window !== 'undefined') return localStorage.getItem('adminToken')
    return null
  }

  async getAllUsers(): Promise<{ users: any[]; total: number }> {
    return this.request('/auth/admin/users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  async banUser(userId: string): Promise<{ message: string; user: any }> {
    return this.request(`/auth/admin/users/${userId}/ban`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  async unbanUser(userId: string): Promise<{ message: string; user: any }> {
    return this.request(`/auth/admin/users/${userId}/unban`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${this.getAdminToken()}` },
    })
  }

  async createPaymentIntent(classId: string): Promise<{
    clientSecret: string
    paymentIntentId: string
    classDetails: {
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
  }> {
    return this.request('/payments/create-intent', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStorage.getToken()}` },
      body: JSON.stringify({ classId }),
    })
  }

  async confirmPayment(paymentIntentId: string, classId: string): Promise<{
    enrollmentId: string
    tutorAmount: number
    platformAmount: number
    totalAmount: number
  }> {
    return this.request('/payments/confirm', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStorage.getToken()}` },
      body: JSON.stringify({ paymentIntentId, classId }),
    })
  }

  async getTutorEarnings(): Promise<{
    summary: { totalEarned: number; thisMonth: number; count: number }
    payments: Array<{
      id: string
      totalAmount: number
      tutorAmount: number
      platformAmount: number
      status: string
      paidAt: string | null
      createdAt: string
      studentName: string
      className: string
      classSchedule: string[]
      classMode: string
    }>
  }> {
    return this.request('/payments/tutor/earnings', {
      headers: { 'Authorization': `Bearer ${authStorage.getToken()}` },
    })
  }

  async getStudentEnrollments(): Promise<{
    enrollments: Array<{
      enrollmentId: string
      enrolledAt: string
      status: string
      class: {
        id: string
        subject: string
        description?: string
        mode: string
        schedule: string[]
        time: string
        duration: string
        fees: number
        venue?: string
        tutorId: string
        tutorName: string
        tutorAvatar?: string
      }
      payment: { totalAmount: number; status: string; paidAt: string | null } | null
    }>
  }> {
    return this.request('/payments/student/enrollments', {
      headers: { 'Authorization': `Bearer ${authStorage.getToken()}` },
    })
  }

  async getAdminPayments(): Promise<{
    summary: {
      totalRevenue: number
      totalPlatform: number
      totalTutor: number
      thisMonth: number
      count: number
    }
    payments: Array<{
      id: string
      stripePaymentId: string
      totalAmount: number
      tutorAmount: number
      platformAmount: number
      currency: string
      status: string
      paidAt: string | null
      createdAt: string
      studentName: string
      studentEmail: string
      tutorName: string
      className: string
      classMode: string
    }>
  }> {
    return this.request('/payments/admin', {
      headers: { 'Authorization': `Bearer ${authStorage.getToken()}` },
    })
  }
}

export const api = new ApiClient(API_BASE_URL)

// ✅ Updated helper functions for auth storage
export const authStorage = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  },

  // ✅ Store user info with role flags
  setUser(user: { id: string; email: string; fullName: string; hasStudentProfile: boolean; hasTutorProfile: boolean; tutorStatus?: string | null; avatar?: string | null; isOAuthUser?: boolean }) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  getUser(): { id: string; email: string; fullName: string; hasStudentProfile: boolean; hasTutorProfile: boolean; tutorStatus?: string | null; avatar?: string | null; isOAuthUser?: boolean } | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  // ✅ Store active role (for users with both roles)
  setActiveRole(role: 'student' | 'tutor') {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeRole', role)
    }
  },

  getActiveRole(): 'student' | 'tutor' | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeRole') as 'student' | 'tutor' | null
    }
    return null
  },

  // Legacy - kept for backward compatibility during signup
  setRole(role: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', role)
    }
  },

  getRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role')
    }
    return null
  },

  clear() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
      localStorage.removeItem('activeRole')
    }
  },

  // Alias for clear (used in some components)
  clearAuth() {
    this.clear()
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
