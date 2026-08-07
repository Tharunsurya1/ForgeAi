"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Code2,
  Sparkles,
  Plus,
  Copy,
  Key,
  Terminal,
  Shield,
  Upload,
} from "lucide-react"

export default function DeveloperSettingsPage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState("https://api.forgeai.dev/v1/webhooks/deploy")

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
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Developer Portal & API Key Management</h1>
            <p className="text-xs text-slate-400">Manage REST/GraphQL API keys, Webhooks, SDK Tokens, and rate limits.</p>
          </div>
        </div>

        <button
          onClick={() => { setToastMessage("🔑 Generated new Production API Token!"); setTimeout(() => setToastMessage(null), 3000); }}
          className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Generate API Key
        </button>
      </header>

      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs font-mono">
        <h3 className="text-sm font-bold text-white border-b border-[#232736] pb-3">Active API Keys</h3>
        <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
          <div>
            <strong className="text-white block">Production Live API Token</strong>
            <span className="text-[10px] text-slate-400">fg_live_948210492817492104928104</span>
          </div>
          <button onClick={() => setToastMessage("Copied API key to clipboard!")} className="bg-[#181a26] text-purple-300 p-2 rounded-xl border border-[#2d3248]"><Copy className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <label className="text-slate-400 font-semibold font-sans">Webhook Event Endpoint URL</label>
          <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono" />
        </div>
      </div>
    </div>
  )
}
