"use client"

import { useState, useEffect } from "react"
import {
  DollarSign, TrendingUp, CreditCard, Receipt,
  Users, Loader2, Monitor, Building, Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 text-sm">All transactions across the platform</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{data.summary.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Total Revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{data.summary.totalPlatform.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Platform Commission (8%)</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{data.summary.totalTutor.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Tutor Payouts (92%)</p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.summary.count}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Search + table */}
          <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm flex-1">All Transactions</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search student, tutor, class..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
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
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{p.studentName}</p>
                              <p className="text-xs text-gray-400">{p.studentEmail}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{p.tutorName}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{p.className}</p>
                            <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200">
                              <ModeIcon className="w-3 h-3 mr-1" />
                              {p.classMode}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-gray-900">
                            Rs.{p.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right text-green-600 font-medium">
                            Rs.{p.tutorAmount.toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-right text-purple-600 font-medium">
                            Rs.{p.platformAmount.toLocaleString()}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <Badge
                              className={
                                p.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700 border-0 text-xs"
                                  : p.status === "FAILED"
                                  ? "bg-red-100 text-red-700 border-0 text-xs"
                                  : "bg-yellow-100 text-yellow-700 border-0 text-xs"
                              }
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-center text-gray-500 text-xs">
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
          </Card>
        </>
      ) : null}
    </div>
  )
}
