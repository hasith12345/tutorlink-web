"use client"

import { useState, useEffect } from "react"
import {
  DollarSign, TrendingUp, CreditCard, Receipt,
  Users, Monitor, Building, Search,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getAdminPayments>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.getAdminPayments()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load payments"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data?.payments.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.studentName.toLowerCase().includes(q) ||
      p.tutorName.toLowerCase().includes(q) ||
      p.className.toLowerCase().includes(q)
    )
  }) ?? []

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 text-sm">Track and manage platform payments</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: data ? `Rs.${data.summary.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, color: "green" },
          { label: "Platform Commission (8%)", value: data ? `Rs.${data.summary.totalPlatform.toLocaleString()}` : "—", icon: TrendingUp, color: "purple" },
          { label: "Tutor Payouts (92%)", value: data ? `Rs.${data.summary.totalTutor.toLocaleString()}` : "—", icon: Users, color: "blue" },
          { label: "Total Transactions", value: data ? data.summary.count : "—", icon: CreditCard, color: "indigo" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            {loading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm flex-1">All Transactions</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, tutor, class..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor (92%)</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform (8%)</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-28 mb-1" /><Skeleton className="h-3 w-36" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-4 w-16 rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></td>
                    <td className="px-5 py-4 text-center"><Skeleton className="h-3 w-20 mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-medium text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Receipt className="w-7 h-7 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">
              {search ? "No results found" : "No transactions yet"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "Transactions will appear here once students enroll"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor (92%)</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform (8%)</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => {
                  const ModeIcon = p.classMode === "physical" ? Building : Monitor
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm text-gray-900">{p.studentName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.studentEmail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm text-gray-900">{p.tutorName}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm text-gray-900">{p.className}</p>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] mt-1">
                          <ModeIcon className="w-2.5 h-2.5 mr-1" />
                          {p.classMode}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-sm text-gray-900">
                        Rs.{p.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-green-600 font-medium">
                        Rs.{p.tutorAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-purple-600 font-medium">
                        Rs.{p.platformAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge
                          className={
                            p.status === "COMPLETED"
                              ? "bg-green-100 text-green-700 border-green-200 text-[10px]"
                              : p.status === "FAILED"
                              ? "bg-red-100 text-red-700 border-red-200 text-[10px]"
                              : "bg-amber-100 text-amber-700 border-amber-200 text-[10px]"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-gray-400">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-US", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {data?.payments.length ?? 0} transactions
          </div>
        )}
      </div>
    </div>
  )
}
