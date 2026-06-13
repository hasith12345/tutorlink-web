"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TutorShell } from "@/components/tutor/tutor-shell"
import { TutorPageHeader } from "@/components/tutor/tutor-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign, TrendingUp, Users, CalendarDays,
  Receipt, Monitor, Building, Wallet,
} from "lucide-react"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function TutorEarningsPage() {
  const router = useRouter()
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getTutorEarnings>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.getTutorEarnings()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load earnings"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <TutorShell maxWidth="max-w-6xl">
        <TutorPageHeader
          icon={Wallet}
          title="My Earnings"
          subtitle="Your 92% share of all student payments"
        />

        {loading ? (
          <>
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[0,1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                  <Skeleton className="w-10 h-10 rounded-xl bg-gray-200" />
                  <Skeleton className="h-7 w-28 bg-gray-200" />
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                </div>
              ))}
            </div>

            {/* Payment table skeleton */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <Skeleton className="h-5 w-36 bg-gray-200" />
              </div>
              <div className="divide-y divide-gray-50">
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex items-center gap-2 w-36 flex-shrink-0">
                      <Skeleton className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                      <Skeleton className="h-4 w-24 bg-gray-200" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32 bg-gray-200" />
                      <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                    </div>
                    <Skeleton className="h-3 w-28 bg-gray-200 hidden md:block" />
                    <Skeleton className="h-4 w-20 bg-gray-200 ml-auto" />
                    <div className="space-y-1 text-right flex-shrink-0">
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                      <Skeleton className="h-3 w-8 bg-gray-200" />
                    </div>
                    <Skeleton className="h-3 w-20 bg-gray-200 hidden lg:block flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: `Rs.${data.summary.totalEarned.toLocaleString()}`, label: "Total Earned", icon: DollarSign, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/30" },
                { value: `Rs.${data.summary.thisMonth.toLocaleString()}`, label: "This Month", icon: TrendingUp, gradient: "from-indigo-500 to-purple-600", glow: "shadow-indigo-500/30" },
                { value: `${data.summary.count}`, label: "Total Enrollments", icon: Users, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/30" },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <Card key={s.label} className="rounded-2xl border border-slate-200/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-5">
                      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{s.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Payments table */}
            <Card className="overflow-hidden rounded-2xl border border-slate-200/70 py-0 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="font-bold text-slate-900">Payment History</h2>
                </div>

                {data.payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Receipt className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700">No payments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Earnings will appear here when students enroll</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Paid</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Earnings</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.payments.map((p) => {
                          const ModeIcon = p.classMode === "physical" ? Building : Monitor
                          return (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                                    {p.studentName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-gray-900">{p.studentName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-gray-900">{p.className}</p>
                                <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200">
                                  <ModeIcon className="w-3 h-3 mr-1" />
                                  {p.classMode}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {p.classSchedule.length > 0 ? (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                    {p.classSchedule.join(", ")}
                                  </div>
                                ) : "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600">
                                Rs.{p.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-bold text-green-600">
                                  Rs.{p.tutorAmount.toLocaleString()}
                                </span>
                                <p className="text-xs text-gray-400">92%</p>
                              </td>
                              <td className="px-6 py-4 text-center text-gray-500 text-xs">
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
              </CardContent>
            </Card>
          </>
        ) : null}
    </TutorShell>
  )
}
