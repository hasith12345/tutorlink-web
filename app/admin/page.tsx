"use client"

import { ShieldCheck, Users, DollarSign, Bell, TrendingUp, Clock } from "lucide-react"

const stats = [
  { label: "Pending Approvals", value: "—", icon: ShieldCheck, color: "amber", href: "/admin/tutor-approvals" },
  { label: "Total Accounts", value: "—", icon: Users, color: "blue", href: "/admin/accounts" },
  { label: "Total Payments", value: "—", icon: DollarSign, color: "green", href: "/admin/payments" },
  { label: "Notifications", value: "—", icon: Bell, color: "purple", href: "/admin/notifications" },
]

const colorMap: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
}

export default function AdminOverviewPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to the TutorLink Admin Portal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Recent Activity</h2>
          </div>
          <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Platform Summary</h2>
          </div>
          <p className="text-sm text-gray-400 text-center py-8">Stats coming soon</p>
        </div>
      </div>
    </div>
  )
}
