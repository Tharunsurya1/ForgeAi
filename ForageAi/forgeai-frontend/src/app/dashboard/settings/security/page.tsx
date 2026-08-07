"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShieldCheck,
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
  Key,
  Shield,
  Smartphone,
  Laptop,
  LogOut,
  X,
  ShieldAlert,
} from "lucide-react"

export default function AccountSecurityPage() {
  const router = useRouter()

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  // Demo Login Sessions List State
  const [sessions, setSessions] = useState([
    { id: "s-1", device: "MacBook Pro 16\" (M3 Max)", browser: "Chrome 126.0 (macOS)", ip: "192.168.1.104", location: "San Francisco, CA, USA", current: true, time: "Active now" },
    { id: "s-2", device: "Windows Workstation RTX 4090", browser: "Edge 125.0 (Windows 11)", ip: "49.207.214.89", location: "Hyderabad, Telangana, IN", current: false, time: "2h ago" },
    { id: "s-3", device: "iPhone 15 Pro Max", browser: "Safari Mobile 17.4 (iOS)", ip: "172.56.21.90", location: "San Francisco, CA, USA", current: false, time: "1d ago" },
  ])

  // Security Audit Logs
  const auditLogs = [
    { event: "SSO Login Success", user: "tharun@forgeai.com", ip: "192.168.1.104", time: "10m ago", status: "Success 🟢" },
    { event: "API Key Generated", user: "tharun@forgeai.com", ip: "192.168.1.104", time: "1h ago", status: "Success 🟢" },
    { event: "2FA Verification", user: "tharun@forgeai.com", ip: "49.207.214.89", time: "2h ago", status: "Success 🟢" },
    { event: "Failed Login Attempt", user: "unknown_user", ip: "185.220.101.5", time: "1d ago", status: "Blocked 🔴" },
  ]

  // Handle Revoke Single Session
  const handleRevokeSession = (id: string, device: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    setToastMessage(`🔒 Revoked session for ${device}!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Logout All Devices
  const handleLogoutAll = () => {
    setSessions(prev => prev.filter(s => s.current))
    setToastMessage("🚨 Logged out of all other active device sessions!")
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Change Password Submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPasswordModal(false)
    setNewPassword("")
    setToastMessage("🔑 Password changed successfully! 2FA session re-authenticated.")
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Account & Security Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage 2FA, single sign-on authentication, active device sessions, and audit security logs.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Key className="w-4 h-4 text-white" />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleLogoutAll}
            className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout All Devices</span>
          </button>

          <button
            onClick={() => setToastMessage("📥 Downloaded Security Audit Log CSV!")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Audit Logs</span>
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

      {/* ========================================================================= */}
      {/* SECURITY OVERVIEW STATS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#141620] border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Security Health Score</span>
            <h3 className="text-xl font-bold text-emerald-400">98 / 100 Excellent</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Two-Factor Auth (2FA)</span>
            <h3 className="text-xl font-bold text-purple-400">ENABLED 🟢</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Active Device Sessions</span>
            <h3 className="text-xl font-bold text-blue-400">{sessions.length} Active</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">SSO / OAuth Apps</span>
            <h3 className="text-xl font-bold text-amber-400">3 Connected</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* TWO FACTOR AUTHENTICATION (2FA) CARD */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" /> Two-Factor Authentication (2FA) Setup
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PROTECTED
              </span>
            </div>

            <p className="text-slate-300 bg-[#0d0e14] p-3.5 rounded-xl border border-[#232736] leading-relaxed">
              Two-factor authentication adds an extra layer of security to your ForgeAI account by requiring a time-based TOTP verification code from your authenticator app (1Password, Google Authenticator, or Authy).
            </p>

            <div className="flex items-center justify-between font-mono bg-[#0d0e14] p-3 rounded-xl border border-[#232736]">
              <div>
                <span className="text-white font-bold block">Authenticator App (TOTP)</span>
                <span className="text-[10px] text-slate-400">Configured with Google Authenticator</span>
              </div>
              <button
                onClick={() => setToastMessage("📱 Re-configuring 2FA TOTP secrets...")}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
              >
                Re-configure 2FA
              </button>
            </div>
          </div>

          {/* ACTIVE DEVICE SESSIONS TABLE */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-400" /> Active Login Sessions & Devices
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{sessions.length} Devices Registered</span>
            </div>

            <div className="flex flex-col gap-2">
              {sessions.map((s) => (
                <div key={s.id} className="p-3.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{s.device}</span>
                        {s.current && (
                          <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{s.browser} • IP: {s.ip} • {s.location}</span>
                    </div>
                  </div>

                  {!s.current && (
                    <button
                      onClick={() => handleRevokeSession(s.id, s.device)}
                      className="bg-[#181a26] text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl border border-[#2d3248] transition-colors cursor-pointer text-xs font-bold"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECURITY AUDIT LOGS */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Activity className="w-4 h-4 text-purple-400" /> Real-time Security Audit Stream
            </h3>

            <div className="flex flex-col gap-2">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-white block">{log.event}</span>
                    <span className="text-slate-400">User: {log.user} • IP: {log.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[10px]">{log.time}</span>
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (SECURITY POLICIES) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Security Compliance Policy */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Compliance Status</span>
              <span className="text-[10px] text-emerald-400 font-mono">SOC2 Type II</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">SAML SSO:</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Data Retention:</span>
                <span className="text-purple-300 font-bold">30 Days</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">IP Allowlist:</span>
                <span className="text-blue-400 font-bold">Configured</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CHANGE PASSWORD DIALOG */}
      {/* ========================================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleChangePassword} className="bg-[#141620] border border-[#232736] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" /> Change Account Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} type="button" className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">New Master Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong 12+ char password..."
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
