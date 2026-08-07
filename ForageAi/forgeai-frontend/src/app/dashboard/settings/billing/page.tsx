"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CreditCard,
  Sparkles,
  Check,
  DollarSign,
  Download,
  ShieldCheck,
  Zap,
} from "lucide-react"

export default function BillingPage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Billing & Subscription Management</h1>
            <p className="text-xs text-slate-400">Stripe-powered payment methods, invoice downloads, and enterprise license quota.</p>
          </div>
        </div>

        <button
          onClick={() => { setToastMessage("⚡ Upgraded workspace license tier!"); setTimeout(() => setToastMessage(null), 3000); }}
          className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-4 h-4" /> Upgrade License Plan
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-2 shadow-xl">
          <span className="text-slate-400">Current Active Plan</span>
          <h3 className="text-xl font-bold text-purple-400">Enterprise Tier</h3>
          <span className="text-[10px] text-emerald-400">Unlimited AI Tokens • 48 Members</span>
        </div>

        <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-2 shadow-xl">
          <span className="text-slate-400">Monthly Usage Bill</span>
          <h3 className="text-xl font-bold text-emerald-400">$42.80 / Month</h3>
          <span className="text-[10px] text-slate-400">Next billing date: Aug 01, 2026</span>
        </div>

        <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-2 shadow-xl">
          <span className="text-slate-400">Payment Method</span>
          <h3 className="text-xl font-bold text-blue-400">Visa ending in 4921</h3>
          <span className="text-[10px] text-slate-400">Expires 09/2028</span>
        </div>
      </div>
    </div>
  )
}
