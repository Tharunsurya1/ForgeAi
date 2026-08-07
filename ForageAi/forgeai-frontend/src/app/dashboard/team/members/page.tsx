"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
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
  Bot,
  Database,
  ShieldCheck,
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
  Pause,
  Calendar,
  TrendingUp,
  HardDrive,
  FolderPlus,
  UserPlus,
  Shield,
  Crown,
  Key,
  Building,
  UserMinus,
  UserCheck,
  Grid,
  List,
} from "lucide-react"

export default function AllMembersPage() {
  const router = useRouter()

  // View Mode State (Grid Cards vs Table View)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("All Departments")
  const [selectedRole, setSelectedRole] = useState("All Roles")

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Detailed Team Members List
  const [members, setMembers] = useState([
    {
      id: "m-1",
      name: "Tharun Surya",
      email: "tharun@forgeai.com",
      role: "Super Admin",
      department: "Engineering & Executive",
      status: "Online",
      avatar: "TH",
      aiUsage: "142.5K tokens",
      projects: 14,
      docs: 42,
      workflows: 18,
      storage: "14.8 GB",
      lastActive: "Active now",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "m-2",
      name: "Alex Rivera",
      email: "alex@forgeai.com",
      role: "AI Lead Architect",
      department: "AI & ML Core",
      status: "Online",
      avatar: "AR",
      aiUsage: "98.2K tokens",
      projects: 9,
      docs: 28,
      workflows: 12,
      storage: "8.4 GB",
      lastActive: "2m ago",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "m-3",
      name: "Sarah Chen",
      email: "sarah@forgeai.com",
      role: "Frontend Architect",
      department: "UI/UX & Web Studio",
      status: "Away",
      avatar: "SC",
      aiUsage: "54.1K tokens",
      projects: 7,
      docs: 19,
      workflows: 8,
      storage: "5.1 GB",
      lastActive: "15m ago",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "m-4",
      name: "Marcus Vance",
      email: "marcus@forgeai.com",
      role: "DevOps & Security Lead",
      department: "DevOps & Security",
      status: "Online",
      avatar: "MV",
      aiUsage: "41.8K tokens",
      projects: 11,
      docs: 34,
      workflows: 15,
      storage: "12.2 GB",
      lastActive: "Active now",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "m-5",
      name: "Elena Rostova",
      email: "elena@forgeai.com",
      role: "Data Scientist",
      department: "Data & Vector DB",
      status: "Offline",
      avatar: "ER",
      aiUsage: "38.9K tokens",
      projects: 5,
      docs: 14,
      workflows: 6,
      storage: "3.8 GB",
      lastActive: "2h ago",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ])

  // Department Options
  const departments = [
    "All Departments",
    "Engineering & Executive",
    "AI & ML Core",
    "UI/UX & Web Studio",
    "DevOps & Security",
    "Data & Vector DB",
  ]

  // Role Options
  const roles = [
    "All Roles",
    "Super Admin",
    "AI Lead Architect",
    "Frontend Architect",
    "DevOps & Security Lead",
    "Data Scientist",
  ]

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">All Workspace Members</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage members, roles, permissions, AI token allocations, and active team sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              setToastMessage("✉️ Opening Invite Member Modal...")
              setTimeout(() => setToastMessage(null), 3000)
            }}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Invite Member</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Directory</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* KPI STAT CARDS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Total Members</span>
            <h3 className="text-xl font-bold text-white">48 Members</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Active Today</span>
            <h3 className="text-xl font-bold text-emerald-400">42 Online</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Pending Invites</span>
            <h3 className="text-xl font-bold text-amber-400">3 Invites</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">AI Tokens Used</span>
            <h3 className="text-xl font-bold text-blue-400">14.2M Tokens</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: SEARCH & MEMBER CARDS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* SEARCH & FILTER BAR WITH VIEW TOGGLE */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by name, email or role..."
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Department & Role Selectors */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar font-medium">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>

              {/* Grid vs List View Toggle */}
              <div className="flex items-center gap-1 bg-[#0d0e14] border border-[#262a3c] p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MEMBER CARDS GRID VIEW */}
          {/* ========================================================================= */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members
                .filter(m => selectedDept === "All Departments" || m.department === selectedDept)
                .filter(m => selectedRole === "All Roles" || m.role === selectedRole)
                .filter(m => searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((member) => (
                  <div key={member.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Header & Avatar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-purple-500/20 relative">
                          {member.avatar}
                          <span className={`w-3 h-3 rounded-full border-2 border-[#141620] absolute -bottom-0.5 -right-0.5 ${
                            member.status === "Online" ? "bg-emerald-500" : member.status === "Away" ? "bg-amber-500" : "bg-slate-500"
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{member.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${member.badgeColor}`}>
                        {member.role}
                      </span>
                    </div>

                    {/* Telemetry Stats Box */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">AI Usage:</span>
                        <span className="text-purple-400 font-bold">{member.aiUsage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Projects:</span>
                        <span className="text-emerald-400 font-bold">{member.projects} active</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Docs / Workflows:</span>
                        <span className="text-blue-400 font-bold">{member.docs} / {member.workflows}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Storage Used:</span>
                        <span className="text-amber-400 font-bold">{member.storage}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                      <button
                        onClick={() => {
                          setToastMessage(`Opening member profile for ${member.name}...`)
                          setTimeout(() => setToastMessage(null), 3000)
                        }}
                        className="bg-[#181a26] hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Profile
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]" title="Edit Role"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]" title="Assign Team"><Users className="w-3.5 h-3.5" /></button>
                        <button className="bg-[#181a26] text-rose-400 p-2 rounded-xl hover:bg-rose-600 hover:text-white border border-[#2d3248]" title="Deactivate Member"><UserMinus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          ) : (
            /* MEMBER TABLE VIEW */
            <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0d0e14] text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-[#232736]">
                    <th className="p-4">Member</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">AI Usage</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232736]">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#181a26] transition-colors font-mono">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {m.avatar}
                        </div>
                        <div>
                          <div className="font-sans font-bold">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.email}</div>
                        </div>
                      </td>
                      <td className="p-4 text-purple-300 font-bold">{m.role}</td>
                      <td className="p-4 text-slate-300 font-sans">{m.department}</td>
                      <td className="p-4 text-emerald-400 font-bold">{m.aiUsage}</td>
                      <td className="p-4 text-slate-300">{m.status}</td>
                      <td className="p-4 text-right">
                        <button className="text-purple-400 hover:underline font-bold">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (WORKSPACE OVERVIEW & RECENT ACTIVITY) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Workspace Overview */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-purple-400" /> Workspace Overview</span>
              <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Members:</span>
                <span className="text-white font-bold">48 Members</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Members Online:</span>
                <span className="text-emerald-400 font-bold">42 Online</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Pending Invites:</span>
                <span className="text-amber-400 font-bold">3 Invites</span>
              </div>
            </div>
          </div>

          {/* Latest Activity Stream */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> Recent Team Stream</span>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {[
                { user: "Tharun S.", act: "created new RAG Workflow", time: "5m ago" },
                { user: "Alex R.", act: "compiled Rust vector engine", time: "12m ago" },
                { user: "Sarah C.", act: "updated UI Studio design tokens", time: "42m ago" },
              ].map((act, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between text-[11px]">
                  <div>
                    <strong className="text-purple-300">{act.user}</strong> <span className="text-slate-300">{act.act}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
