"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Settings,
  Sparkles,
  Plus,
  Search,
  Filter,
  Play,
  Copy,
  Star,
  Check,
  Clock,
  Tag,
  Folder,
  FileText,
  Share2,
  Download,
  Trash2,
  Edit3,
  Eye,
  Users,
  Bot,
  Database,
  ShieldCheck,
  Zap,
  BarChart3,
  Wand2,
  FileCode,
  Layers,
  Terminal,
  Server,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  RefreshCw,
  Upload,
  Activity,
  Sliders,
  ChevronDown,
  Bookmark,
  Mail,
  MessageSquare,
  Send,
  GitBranch,
  Code2,
  Radio,
  TerminalSquare,
  DollarSign,
  TrendingUp,
  HardDrive,
  CheckSquare,
  Key,
  Shield,
  Palette,
  Bell,
  Building,
  User,
  CreditCard,
  SlidersHorizontal,
  Cloud,
  X,
  LogOut,
} from "lucide-react"
import { authApi } from "@/lib/api"
import { authStorage } from "@/lib/auth"

export default function WorkspaceSettingsHubPage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [aiPresetQuery, setAiPresetQuery] = useState("Optimize my AI for coding.")

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // 11 Enterprise Settings Modules List
  const settingsModules = [
    { id: "profile", label: "My Profile", href: "/dashboard/settings/profile", icon: User, desc: "Personal info, avatar, cover banner, bio, and social links.", status: "Verified" },
    { id: "security", label: "Account & Security", href: "/dashboard/settings/security", icon: Lock, desc: "Password, 2FA authenticator, active device sessions, and audit logs.", status: "Protected 🟢" },
    { id: "branding", label: "Workspace Branding", href: "/dashboard/settings/branding", icon: Building, desc: "Workspace logos, custom subdomain, brand colors, and favicons.", status: "Configured" },
    { id: "ai", label: "AI Configuration", href: "/dashboard/settings/ai", icon: Bot, desc: "Foundation LLM routing, temperature tuning, max tokens, and memory.", status: "Claude 3.5" },
    { id: "appearance", label: "Appearance & Theme", href: "/dashboard/settings/appearance", icon: Palette, desc: "Dark/Light themes, accent colors, compact layout, and font sizing.", status: "Dark Mode" },
    { id: "notifications", label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell, desc: "Email digests, browser push, Slack/Discord webhooks, and alerts.", status: "Active" },
    { id: "integrations", label: "Connected Accounts", href: "/dashboard/settings/integrations", icon: Cloud, desc: "Google, GitHub, Slack, OpenAI, Anthropic, and Qdrant OAuth SSO.", status: "6 Connected" },
    { id: "developer", label: "Developer & API Keys", href: "/dashboard/settings/developer", icon: Code2, desc: "REST/GraphQL API tokens, Webhook endpoints, and rate limits.", status: "2 Keys Live" },
    { id: "billing", label: "Billing & Plans", href: "/dashboard/settings/billing", icon: CreditCard, desc: "Subscription plan, payment methods, invoices, and token costs.", status: "Enterprise Tier" },
    { id: "compliance", label: "SSO & Compliance", href: "/dashboard/settings/compliance", icon: ShieldCheck, desc: "SAML 2.0, Okta, Azure AD, SOC2 Type II, ISO27001, and HIPAA.", status: "SOC2 Verified" },
    { id: "advanced", label: "Advanced System", href: "/dashboard/settings/advanced", icon: SlidersHorizontal, desc: "Cache purge, WAL snapshots, background jobs, and feature flags.", status: "Optimal" },
  ]

  const handleAiAutoPreset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiPresetQuery) return
    setToastMessage(`🧠 AI Settings Assistant configured parameters for: "${aiPresetQuery}"!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authApi.logout()
    } catch (err) {
      console.error(err)
    } finally {
      authStorage.clearAuth()
      setIsLoggingOut(false)
      setShowLogoutModal(false)
      router.push("/login")
    }
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* PAGE HEADER */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Enterprise Administration Settings</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized workspace management across 11 dedicated enterprise settings modules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => setToastMessage("📥 Exported master enterprise configuration ZIP!")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Config</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NATURAL LANGUAGE AI SETTINGS ASSISTANT BAR */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-purple-400" /> AI Settings Assistant (Natural Language Tuning)
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto Tuning Mode</span>
        </div>

        <form onSubmit={handleAiAutoPreset} className="relative">
          <input
            type="text"
            value={aiPresetQuery}
            onChange={(e) => setAiPresetQuery(e.target.value)}
            placeholder="Describe desired setup e.g., 'Optimize my AI for coding' or 'Configure maximum privacy'..."
            className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-4 pr-44 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Configure</span>
          </button>
        </form>
      </div>

      {/* 11 DEDICATED SETTINGS MODULE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsModules.map((mod) => {
          const Icon = mod.icon
          return (
            <div
              key={mod.id}
              onClick={() => router.push(mod.href)}
              className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/60 rounded-2xl flex flex-col justify-between gap-4 shadow-xl transition-all group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{mod.label}</h3>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0d0e14] border border-[#232736] text-purple-300">
                    {mod.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 my-3 leading-relaxed font-sans bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                  {mod.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                <span>Manage {mod.label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )
        })}
      </div>

      {/* SESSION & LOGOUT BANNER */}
      <div className="p-6 bg-gradient-to-r from-[#141620] to-[#1e1528] border border-rose-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-inner">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Active Account Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Signed in as an authenticated enterprise administrator. Ready to conclude your session?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/settings/security")}
            className="px-4 py-2.5 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold text-xs rounded-xl border border-[#2d3248] transition-colors cursor-pointer"
          >
            Manage Sessions
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141620] border border-[#262a3c] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#232736] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Sign Out</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Are you sure you want to end your current session?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#232736]">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

