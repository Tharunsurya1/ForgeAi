"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User as UserIcon,
  Sparkles,
  Edit3,
  Download,
  ShieldCheck,
  Zap,
  Award,
  MapPin,
  Briefcase,
  Phone,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Clock,
  Globe,
  Users,
  Code2,
  RefreshCw,
  AlertCircle,
  Mail,
  CheckCircle2,
} from "lucide-react"

import { authApi } from "@/lib/api"
import { authStorage } from "@/lib/auth"
import { User } from "@/types"

export default function MyProfilePage() {
  const router = useRouter()

  // Live Toast & Interactive State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real Authenticated User State
  const [user, setUser] = useState<User | null>(null)
  const [editFullName, setEditFullName] = useState("")
  const [editAvatarUrl, setEditAvatarUrl] = useState("")

  // Skills List
  const skills = [
    "LLM Agent Orchestration",
    "Rust Microservices",
    "TypeScript & Next.js 16",
    "Qdrant Vector DB",
    "PyTorch & Fine-tuning",
    "Kubernetes & Helm",
    "Docker Containerization",
    "WebSockets Real-time API",
  ]

  // Achievements List
  const achievements = [
    {
      title: "Super Admin Badge",
      desc: "Full root workspace access & security control",
      icon: ShieldCheck,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      title: "Top AI Code Contributor",
      desc: "Active architectural contributor across ForgeAI pipelines",
      icon: Award,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      title: "Workflow Architect",
      desc: "Designed and configured enterprise AI blueprint workflows",
      icon: Zap,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
  ]

  // Load user profile
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userData = await authApi.getMe()
      setUser(userData)
      setEditFullName(userData.full_name || "")
      setEditAvatarUrl(userData.avatar_url || "")
    } catch (err: any) {
      console.error("Failed to load user profile:", err)
      setError(err?.message || "Failed to load authenticated profile")
      // Fallback to locally cached user
      const cached = authStorage.getUser()
      if (cached) {
        setUser(cached)
        setEditFullName(cached.full_name || "")
        setEditAvatarUrl(cached.avatar_url || "")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Handle Save Profile Edits
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editFullName.trim()) {
      setToastMessage("⚠️ Full name cannot be empty")
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    setIsSaving(true)
    try {
      const updatedUser = await authApi.updateProfile({
        full_name: editFullName.trim(),
        avatar_url: editAvatarUrl.trim() || null,
      })
      setUser(updatedUser)
      setIsEditing(false)
      setToastMessage("✅ Profile updated successfully!")
    } catch (err: any) {
      console.error("Failed to update profile:", err)
      setToastMessage(`❌ Update failed: ${err?.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Generate initials
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FA"

  const usernameHandle = user?.email
    ? `@${user.email.split("@")[0]}`
    : "@user"

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently"

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loading Banner */}
      {isLoading && (
        <div className="bg-[#141620] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-purple-300 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Synchronizing profile with PostgreSQL database...</span>
        </div>
      )}

      {/* Error Banner */}
      {!isLoading && error && !user && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchUserProfile}
            className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COVER IMAGE & AVATAR HEADER HERO */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Banner Cover Image */}
        <div className="w-full h-48 md:h-56 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
          
          <button
            onClick={() => setToastMessage("🖼️ Cover Banner upload dialog opened!")}
            className="absolute top-4 right-4 bg-[#0d0e14]/80 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#262a3c] flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Change Cover</span>
          </button>
        </div>

        {/* Profile Avatar & Title Overlay Bar */}
        <div className="p-6 pt-0 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-16 md:-mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            
            {/* Avatar Circle */}
            <div className="relative group">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-[#141620] shadow-2xl bg-gradient-to-tr from-purple-600 to-blue-600"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-[#141620] shadow-2xl">
                  {initials}
                </div>
              )}
              <button
                onClick={() => {
                  setIsEditing(true)
                  setToastMessage("📷 Enter an avatar URL in the edit form below.")
                  setTimeout(() => setToastMessage(null), 3000)
                }}
                className="absolute bottom-2 right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border border-[#141620] shadow-lg cursor-pointer transition-transform group-hover:scale-110"
                title="Update Avatar URL"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  {user?.full_name || "ForgeAI User"}
                </h1>
                <span className="text-xs text-purple-300 font-mono font-bold px-2 py-0.5 bg-purple-500/20 rounded border border-purple-500/30">
                  {usernameHandle}
                </span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#141620]" title="Active Account" />
              </div>

              <p className="text-xs text-purple-300 font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                {user?.is_superuser ? "Super Admin" : "Tenant Member"} at{" "}
                <span className="text-white font-bold">
                  {user?.full_name ? `${user.full_name}'s Workspace` : "ForgeAI Organization"}
                </span>
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" /> {user?.email || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile()
                } else {
                  setIsEditing(true)
                }
              }}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>{isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}</span>
            </button>

            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false)
                  if (user) {
                    setEditFullName(user.full_name || "")
                    setEditAvatarUrl(user.avatar_url || "")
                  }
                }}
                className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              onClick={() => setToastMessage("📥 Exported user profile telemetry JSON!")}
              className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Profile</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: DETAILS & ACTIVITY) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* EDIT FORM (Appears when IsEditing = true) */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-[#141620] border border-purple-500/50 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" /> Edit Profile Information
                </h3>
                <span className="text-[10px] text-purple-400 font-mono">PATCH /api/v1/auth/me</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Avatar Image URL (Optional)</label>
                  <input
                    type="url"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? "Saving to Database..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          )}

          {/* BIO & PERSONAL INFORMATION CARD */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <UserIcon className="w-4 h-4 text-purple-400" /> Authenticated Identity & Account Status
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed bg-[#0d0e14] p-4 rounded-xl border border-[#232736] font-sans">
              Welcome to your ForgeAI personal workstation profile. Your user identity is managed securely via JSON Web Tokens (JWT) with automatic background token rotation and tenant workspace isolation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-white font-bold">{user?.email || "—"}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Account Role:</span>
                <span className="text-purple-300 font-bold">
                  {user?.is_superuser ? "Super Admin" : "Tenant Member"}
                </span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Email Verification:</span>
                <span className={`font-bold ${user?.email_verified ? "text-emerald-400" : "text-amber-400"}`}>
                  {user?.email_verified ? "Verified 🟢" : "Pending Verification 🟡"}
                </span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Two-Factor Auth:</span>
                <span className={`font-bold ${user?.mfa_enabled ? "text-emerald-400" : "text-slate-400"}`}>
                  {user?.mfa_enabled ? "Enabled 🟢" : "Disabled ⚪"}
                </span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Account Status:</span>
                <span className={`font-bold ${user?.is_active ? "text-emerald-400" : "text-rose-400"}`}>
                  {user?.is_active ? "Active 🟢" : "Suspended 🔴"}
                </span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between items-center">
                <span className="text-slate-400">Registered On:</span>
                <span className="text-blue-400 font-bold">{memberSince}</span>
              </div>
            </div>
          </div>

          {/* SKILLS & EXPERTISE GRID */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Code2 className="w-4 h-4 text-purple-400" /> Engineering Skills & AI Technologies
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[#0d0e14] border border-[#2d3248] text-slate-200 font-mono text-[11px] font-bold hover:border-purple-500/50 transition-colors"
                >
                  ⚡ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ACHIEVEMENTS & BADGES */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Award className="w-4 h-4 text-amber-400" /> Workspace Achievements & Recognition
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {achievements.map((ach, idx) => {
                const Icon = ach.icon
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${ach.color} flex flex-col gap-2`}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <h4 className="font-bold text-white text-xs">{ach.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{ach.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (AI TELEMETRY & SOCIAL LINKS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* AI Usage Telemetry */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Contribution Metrics
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Tokens Processed:</span>
                <span className="text-purple-400 font-bold">142,500</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Architecture Engine:</span>
                <span className="text-emerald-400 font-bold">ForgeAI 2.0</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Database Design:</span>
                <span className="text-blue-400 font-bold">Active</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Deployment Pipeline:</span>
                <span className="text-amber-400 font-bold">Ready</span>
              </div>
            </div>
          </div>

          {/* Connected Links */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] border-b border-[#232736] pb-2">
              Workspace & Cloud Services
            </h4>

            <div className="flex flex-col gap-2 font-mono text-[11px]">
              <Link
                href="/dashboard/projects"
                className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Tenant Projects
                </span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/dashboard/settings/security"
                className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Security & Sessions
                </span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/dashboard/blueprint-ai/new"
                className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Blueprint Generator
                </span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
