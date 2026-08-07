"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Cloud,
  Sparkles,
  Check,
  Globe,
  Bot,
  MessageSquare,
  Database,
  GitBranch,
} from "lucide-react"

export default function IntegrationsPage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const integrations = [
    { name: "Google Workspace & OAuth", status: "Connected 🟢", date: "Jan 12, 2026", icon: Globe },
    { name: "GitHub Organization", status: "Connected 🟢", date: "Feb 04, 2026", icon: GitBranch },
    { name: "Slack Enterprise Grid", status: "Connected 🟢", date: "Mar 18, 2026", icon: MessageSquare },
    { name: "OpenAI Platform API", status: "Connected 🟢", date: "Apr 01, 2026", icon: Bot },
    { name: "Anthropic Claude API", status: "Connected 🟢", date: "May 10, 2026", icon: Bot },
    { name: "Qdrant Vector Database", status: "Connected 🟢", date: "Jun 22, 2026", icon: Database },
  ]

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
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Connected Accounts & Integrations</h1>
            <p className="text-xs text-slate-400">Manage OAuth single sign-on apps, cloud integrations, and AI LLM providers.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {integrations.map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-400" />
                  <strong className="text-white text-xs">{item.name}</strong>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">{item.status}</span>
              </div>
              <span className="text-[10px] text-slate-400">Connected: {item.date}</span>
              <div className="flex items-center gap-2 pt-2 border-t border-[#232736]">
                <button onClick={() => setToastMessage(`Synced integration "${item.name}"`)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex-1 cursor-pointer">Sync Now</button>
                <button onClick={() => setToastMessage(`Disconnected "${item.name}"`)} className="bg-[#181a26] text-rose-400 border border-[#2d3248] font-bold py-1.5 px-3 rounded-xl text-xs cursor-pointer">Disconnect</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
