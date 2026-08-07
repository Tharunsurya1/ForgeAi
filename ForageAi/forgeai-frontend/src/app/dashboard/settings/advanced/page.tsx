"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  SlidersHorizontal,
  Sparkles,
  Check,
  RefreshCw,
  Trash2,
  Download,
  Database,
  History,
} from "lucide-react"

export default function AdvancedSettingsPage() {
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
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Advanced System & Audit History</h1>
            <p className="text-xs text-slate-400">Purge cache, storage cleanup, database maintenance, feature flags, and backup snapshots.</p>
          </div>
        </div>
      </header>

      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs font-mono">
        <h3 className="text-sm font-bold text-white border-b border-[#232736] pb-3">System Maintenance Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
            <div>
              <strong className="text-white block font-sans font-bold">Purge System Cache</strong>
              <span className="text-[10px] text-slate-400">Flush Redis cache and compiled Next.js SSR bundle</span>
            </div>
            <button onClick={() => setToastMessage("⚡ Flushed Redis system cache!")} className="bg-purple-600 text-white font-bold py-1.5 px-3 rounded-xl cursor-pointer">Purge Cache</button>
          </div>

          <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
            <div>
              <strong className="text-white block font-sans font-bold">Database WAL Snapshot</strong>
              <span className="text-[10px] text-slate-400">Create instant backup snapshot of Qdrant/PostgreSQL</span>
            </div>
            <button onClick={() => setToastMessage("💾 Snapshot backup generated & uploaded to AWS S3!")} className="bg-[#181a26] text-blue-300 border border-[#2d3248] font-bold py-1.5 px-3 rounded-xl cursor-pointer">Backup Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
