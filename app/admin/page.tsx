"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Users, DollarSign, Bell, TrendingUp, Clock, Loader2, CreditCard, GraduationCap } from "lucide-react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

const colorMap: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null)
  const [totalAccounts, setTotalAccounts] = useState<number | null>(null)
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState<number | null>(null)
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [paymentSummary, setPaymentSummary] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [applicationsRes, usersRes, paymentsRes, notifRes] = await Promise.allSettled([
          api.getAdminApplications("pending"),
          api.getAllUsers(),
          api.getAdminPayments(),
          api.getAdminUnreadCount(),
        ])

        if (applicationsRes.status === "fulfilled") {
          setPendingApprovals(applicationsRes.value.applications.length)
        }
        if (usersRes.status === "fulfilled") {
          setTotalAccounts(usersRes.value.total)
        }
        if (paymentsRes.status === "fulfilled") {
          setTotalRevenue(paymentsRes.value.summary.totalRevenue)
          setPaymentSummary(paymentsRes.value.summary)
          setRecentPayments(paymentsRes.value.payments.slice(0, 5))
        }
        if (notifRes.status === "fulfilled") {
          setUnreadNotifications(notifRes.value.count)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    {
      label: "Pending Approvals",
      value: loading ? "—" : pendingApprovals ?? "—",
      icon: ShieldCheck,
      color: "amber",
    },
    {
      label: "Total Accounts",
      value: loading ? "—" : totalAccounts ?? "—",
      icon: Users,
      color: "blue",
    },
    {
      label: "Total Revenue",
      value: loading ? "—" : totalRevenue != null ? `Rs.${totalRevenue.toLocaleString()}` : "—",
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Unread Notifications",
      value: loading ? "—" : unreadNotifications ?? "—",
      icon: Bell,
      color: "purple",
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
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
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Recent Transactions</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Transactions will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.studentName}</p>
                    <p className="text-xs text-gray-500 truncate">{p.className}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">Rs.{p.totalAmount.toLocaleString()}</p>
                    <Badge
                      className={
                        p.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200 text-[10px]"
                          : "bg-amber-100 text-amber-700 border-amber-200 text-[10px]"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Platform Summary</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          ) : paymentSummary ? (
            <div className="p-4 space-y-3">
              {[
                { label: "Total Revenue", value: `Rs.${paymentSummary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                { label: "Platform Commission (8%)", value: `Rs.${paymentSummary.totalPlatform.toLocaleString()}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Tutor Payouts (92%)", value: `Rs.${paymentSummary.totalTutor.toLocaleString()}`, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total Transactions", value: paymentSummary.count, icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                  <p className={`text-sm font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No data yet</p>
              <p className="text-sm text-gray-400 mt-1">Platform metrics will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
