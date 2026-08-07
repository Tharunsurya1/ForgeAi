"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
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
  Award,
  MapPin,
  Briefcase,
  Phone,
  ExternalLink,
  Camera,
  Image as ImageIcon,
} from "lucide-react"

export default function MyProfilePage() {
  const router = useRouter()

  // Live Toast & Interactive State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Demo Profile State
  const [profile, setProfile] = useState({
    name: "Tharun Surya",
    username: "@tharunsurya",
    designation: "Chief Technology Officer & AI Architect",
    company: "ForgeAI Labs Inc.",
    bio: "Architecting high-performance LLM agent workflows, vector embeddings, and Rust/Next.js systems.",
    email: "tharun@forgeai.com",
    phone: "+1 (555) 948-2104",
    location: "San Francisco, CA & Hyderabad, IN",
    timezone: "UTC+05:30 (IST)",
    language: "English (US) & Telugu",
    country: "United States / India",
    website: "https://forgeai.dev/tharun",
    github: "github.com/tharunsurya",
    twitter: "twitter.com/tharunsurya",
    linkedin: "linkedin.com/in/tharunsurya",
  })

  // Skills List
  const skills = [
    "LLM Agent Orchestration",
    "Rust Microservices",
    "TypeScript & Next.js 15",
    "Qdrant Vector DB",
    "PyTorch & Fine-tuning",
    "Kubernetes & Helm",
    "Docker Containerization",
    "WebSockets Real-time API",
  ]

  // Achievements List
  const achievements = [
    { title: "Super Admin Badge", desc: "Full root workspace access & security control", icon: ShieldCheck, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
    { title: "Top AI Code Contributor", desc: "Generated 142.5k lines of production Rust/TS code", icon: Award, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    { title: "Workflow Architect", desc: "Designed 18 active enterprise workflow graph pipelines", icon: Zap, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  ]

  // Handle Save Profile Edits
  const handleSaveProfile = () => {
    setIsEditing(false)
    setToastMessage("✅ Profile updated successfully!")
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
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
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-[#141620] shadow-2xl">
                TS
              </div>
              <button
                onClick={() => setToastMessage("📷 Profile Avatar upload dialog opened!")}
                className="absolute bottom-2 right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border border-[#141620] shadow-lg cursor-pointer transition-transform group-hover:scale-110"
                title="Upload Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{profile.name}</h1>
                <span className="text-xs text-purple-300 font-mono font-bold px-2 py-0.5 bg-purple-500/20 rounded border border-purple-500/30">
                  {profile.username}
                </span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#141620]" title="Online Now" />
              </div>

              <p className="text-xs text-purple-300 font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                {profile.designation} at <span className="text-white font-bold">{profile.company}</span>
              </p>

              <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono mt-1 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {profile.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {profile.timezone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-white" />
              <span>{isEditing ? "Done Editing" : "Edit Profile"}</span>
            </button>

            <button
              onClick={() => setToastMessage("📥 Exported profile card spec!")}
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
            <div className="bg-[#141620] border border-purple-500/50 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Edit3 className="w-4 h-4 text-purple-400" /> Edit Profile Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Designation</label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          )}

          {/* BIO & PERSONAL INFORMATION CARD */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <User className="w-4 h-4 text-purple-400" /> Personal & Professional Details
            </h3>

            <p className="text-slate-200 text-xs leading-relaxed bg-[#0d0e14] p-4 rounded-xl border border-[#232736] font-sans">
              {profile.bio}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-white font-bold">{profile.email}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Phone Number:</span>
                <span className="text-purple-300 font-bold">{profile.phone}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Primary Language:</span>
                <span className="text-emerald-400 font-bold">{profile.language}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Country:</span>
                <span className="text-blue-400 font-bold">{profile.country}</span>
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
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-[#0d0e14] border border-[#2d3248] text-slate-200 font-mono text-[11px] font-bold hover:border-purple-500/50 transition-colors">
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
              <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Contribution Metrics</span>
              <span className="text-[10px] text-emerald-400 font-mono">30 Days</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Tokens Used:</span>
                <span className="text-purple-400 font-bold">142,500 Tokens</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Active Projects:</span>
                <span className="text-emerald-400 font-bold">14 Projects</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Documents Authored:</span>
                <span className="text-blue-400 font-bold">42 Docs</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Workflows Built:</span>
                <span className="text-amber-400 font-bold">18 Workflows</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] border-b border-[#232736] pb-2">
              Social Profiles & Links
            </h4>

            <div className="flex flex-col gap-2 font-mono text-[11px]">
              <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors">
                <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> GitHub Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href={`https://${profile.twitter}`} target="_blank" rel="noreferrer" className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors">
                <span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Twitter / X</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-colors">
                <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> LinkedIn Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
