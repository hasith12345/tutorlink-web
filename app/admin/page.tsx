"use client"

import { ShieldCheck, Users, DollarSign, Bell, TrendingUp, Clock } from "lucide-react"

const stats = [
  { label: "Pending Approvals", value: "—", icon: ShieldCheck, color: "amber" },
  { label: "Total Accounts", value: "—", icon: Users, color: "blue" },
  { label: "Total Payments", value: "—", icon: DollarSign, color: "green" },
  { label: "Notifications", value: "—", icon: Bell, color: "purple" },
]

const colorMap: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
}

export default function AdminOverviewPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header — consistent with other admin pages */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-500 text-sm">Welcome to the TutorLink Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Recent Activity</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Activity will appear here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Platform Summary</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">Stats coming soon</p>
            <p className="text-sm text-gray-400 mt-1">Platform metrics will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
