"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  Sparkles,
  Check,
  Mail,
  Smartphone,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react"

export default function NotificationsPage() {
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
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Notification Center Preferences</h1>
            <p className="text-xs text-slate-400">Configure email digests, push notifications, Slack/Discord webhooks, and security alerts.</p>
          </div>
        </div>

        <button
          onClick={() => { setToastMessage("🔔 Saved notification preferences!"); setTimeout(() => setToastMessage(null), 3000); }}
          className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Save Preferences
        </button>
      </header>

      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs font-mono">
        <h3 className="text-sm font-bold text-white border-b border-[#232736] pb-3">Notification Channels</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Email Digest", desc: "Weekly executive summary of AI tokens & workflow runs", icon: Mail },
            { name: "Push Notifications", desc: "Real-time browser notifications for workflow failures", icon: Smartphone },
            { name: "Slack & Discord Webhook Alerts", desc: "Instant messages in #enterprise-alerts channel", icon: MessageSquare },
            { name: "Security & 2FA Login Alerts", desc: "Critical security notifications for new IP logins", icon: Shield },
          ].map((ch, idx) => {
            const Icon = ch.icon
            return (
              <div key={idx} className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-purple-400" />
                  <div>
                    <strong className="text-white block">{ch.name}</strong>
                    <span className="text-[10px] text-slate-400">{ch.desc}</span>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-[#262a3c] bg-[#0d0e14] text-purple-600 cursor-pointer w-4 h-4" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
