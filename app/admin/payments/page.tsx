"use client"

import { DollarSign, TrendingUp, CreditCard, Receipt } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-sm text-gray-500 mt-0.5">Transactions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">—</p>
          <p className="text-sm text-gray-500 mt-0.5">This Month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Recent Transactions</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Receipt className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">Payment tracking coming soon</p>
          <p className="text-sm text-gray-400 mt-1">Transaction history will appear here</p>
        </div>
      </div>
    </div>
  )
}
