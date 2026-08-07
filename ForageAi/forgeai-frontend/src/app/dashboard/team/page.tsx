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
  UserCheck,
  UserMinus,
  X,
  Settings,
} from "lucide-react"

export default function TeamWorkspacePage() {
  const router = useRouter()

  // Navigation Tab State (8 Tabs)
  const [activeTab, setActiveTab] = useState<
    "members" | "teams" | "departments" | "roles" | "invitations" | "activity" | "analytics" | "settings"
  >("members")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("All Departments")
  const [inviteEmail, setInviteEmail] = useState("")

  // Modal Dialog States
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any | null>(null)
  const [editingMember, setEditingMember] = useState<any | null>(null)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamLead, setNewTeamLead] = useState("Tharun Surya")

  // Live Toast & Process State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Demo Team Members State
  const [members, setMembers] = useState([
    {
      id: "m-1",
      name: "Tharun Surya",
      email: "tharun@forgeai.com",
      role: "Super Admin",
      department: "Engineering & Executive",
      status: "Online",
      avatar: "TH",
      aiUsage: "142,500 Tokens",
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
      aiUsage: "98,200 Tokens",
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
      aiUsage: "54,100 Tokens",
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
      aiUsage: "41,800 Tokens",
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
      aiUsage: "38,900 Tokens",
      projects: 5,
      docs: 14,
      workflows: 6,
      storage: "3.8 GB",
      lastActive: "2h ago",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ])

  // Demo Teams List State
  const [teams, setTeams] = useState([
    { id: "t-1", name: "AI Core Research Squad", lead: "Alex Rivera", count: 8, projectCount: 6, desc: "RAG vectors, LLM fine-tuning, & Tokio Rust microservices." },
    { id: "t-2", name: "Frontend & UI Studio", lead: "Sarah Chen", count: 6, projectCount: 4, desc: "Next.js 15 App Router, Tailwind tokens, & glassmorphism components." },
    { id: "t-3", name: "DevOps & Security Guild", lead: "Marcus Vance", count: 5, projectCount: 8, desc: "Kubernetes Helm charts, Terraform AWS infra, & OWASP secret scanning." },
    { id: "t-4", name: "Data Science & Pipeline", lead: "Elena Rostova", count: 4, projectCount: 3, desc: "Qdrant vector clustering, embedding pipelines, & dataset curation." },
  ])

  // Demo Pending Invitations State
  const [invitations, setInvitations] = useState([
    { id: "inv-1", email: "david.k@enterprise.com", role: "Senior Developer", sent: "2d ago", status: "Pending" },
    { id: "inv-2", email: "priya.m@tech.io", role: "AI Prompt Engineer", sent: "4d ago", status: "Pending" },
    { id: "inv-3", email: "jason.b@security.org", role: "Security Auditor", sent: "1w ago", status: "Expired" },
  ])

  // Interactive Roles & Permission Matrix State
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    "Super Admin": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: true, Billing: true },
    "AI Architect": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: true, Billing: false },
    "Developer": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: false, Billing: false },
    "Viewer": { Projects: true, KnowledgeBase: true, AIModels: false, Files: false, Workflows: false, Automations: false, Billing: false },
  })

  // Settings State
  const [workspaceName, setWorkspaceName] = useState("ForgeAI Enterprise Org")
  const [customDomain, setCustomDomain] = useState("ai.forgeai.dev")
  const [ssoEnabled, setSsoEnabled] = useState(true)

  // Department List
  const departments = [
    "All Departments",
    "Engineering & Executive",
    "AI & ML Core",
    "UI/UX & Web Studio",
    "DevOps & Security",
    "Data & Vector DB",
  ]

  // Handle Send Member Invite
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setIsProcessing(true)
    setToastMessage(`✉️ Sending workspace invitation email to ${inviteEmail}...`)

    setTimeout(() => {
      setIsProcessing(false)
      setInvitations([
        { id: `inv-${Date.now()}`, email: inviteEmail, role: "Developer", sent: "Just now", status: "Pending" },
        ...invitations,
      ])
      setToastMessage(`✅ Invitation successfully sent to ${inviteEmail}!`)
      setInviteEmail("")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1000)
  }

  // Handle Create Team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName) return
    const createdTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      lead: newTeamLead,
      count: 1,
      projectCount: 1,
      desc: "Newly created engineering & research squad.",
    }
    setTeams([...teams, createdTeam])
    setShowCreateTeamModal(false)
    setNewTeamName("")
    setToastMessage(`🎉 Team "${newTeamName}" created successfully!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Toggle Permission Switch
  const togglePermission = (role: string, feature: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [feature]: !prev[role]?.[feature],
      },
    }))
    setToastMessage(`Updated ${role} permission for "${feature}"!`)
    setTimeout(() => setToastMessage(null), 2000)
  }

  // Handle Remove Member
  const handleRemoveMember = (id: string, name: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
    setToastMessage(`🗑️ Member "${name}" removed from workspace.`)
    setTimeout(() => setToastMessage(null), 3000)
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Team Workspace Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage members, departments, permissions and collaboration across your AI workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab("invitations")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Invite Member</span>
          </button>

          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Building className="w-4 h-4 text-purple-400" />
            <span>Create Team</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Directory</span>
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "members", label: "All Members", count: members.length },
            { id: "teams", label: "Teams & Squads", count: teams.length },
            { id: "departments", label: "Departments", count: 5 },
            { id: "roles", label: "Roles & Permissions", count: Object.keys(rolePermissions).length },
            { id: "invitations", label: "Invitations", count: invitations.length },
            { id: "activity", label: "Activity Stream", count: null },
            { id: "analytics", label: "Team Productivity", count: null },
            { id: "settings", label: "Workspace Settings", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                  : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#0d0e14] text-[10px] font-mono text-slate-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT CANVASES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* TAB 1: ALL MEMBERS VIEW */}
          {/* ========================================================================= */}
          {activeTab === "members" && (
            <div className="flex flex-col gap-6">
              
              {/* Quick Invite Form */}
              <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#232736]">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-purple-400" /> Invite Team Member to ForgeAI Workspace
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Enterprise SSO & SAML Enabled
                  </span>
                </div>

                <form onSubmit={handleInviteMember} className="relative">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter colleague's email address (e.g. teammate@forgeai.com)..."
                    className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-4 pr-36 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {isProcessing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Invite</span>
                  </button>
                </form>
              </div>

              {/* Members Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members
                  .filter(m => selectedDept === "All Departments" || m.department === selectedDept)
                  .filter(m => searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((member) => (
                    <div key={member.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
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

                      <div className="flex flex-col gap-1.5 text-[11px] font-mono text-slate-400 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span className="text-slate-200 font-bold">{member.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Tokens Used:</span>
                          <span className="text-purple-400 font-bold">{member.aiUsage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="text-emerald-400 font-bold">{member.projects} active</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                        <button
                          onClick={() => setSelectedMemberProfile(member)}
                          className="bg-[#181a26] hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingMember(member)}
                            className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"
                            title="Edit Member"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="bg-[#181a26] text-rose-400 p-2 rounded-xl hover:bg-rose-600 hover:text-white border border-[#2d3248]"
                            title="Remove Member"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TEAMS & SQUADS VIEW */}
          {/* ========================================================================= */}
          {activeTab === "teams" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team.id} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{team.name}</h3>
                        <span className="text-[11px] text-purple-300 font-mono">Lead: {team.lead}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#0d0e14] border border-[#232736] text-xs font-mono font-bold text-slate-300">
                      {team.count} Members
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232] leading-relaxed">
                    {team.desc}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#232736]">
                    <span className="text-slate-400 font-mono">{team.projectCount} Projects Assigned</span>
                    <button
                      onClick={() => {
                        setToastMessage(`Opening squad management for ${team.name}...`)
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Manage Squad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ROLES & PERMISSIONS MATRIX */}
          {/* ========================================================================= */}
          {activeTab === "roles" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Interactive Enterprise Role Permissions Matrix
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">1-Click Live Toggle</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-[#0d0e14] text-slate-400 uppercase text-[10px] border-b border-[#232736]">
                      <th className="p-3">Role</th>
                      {["Projects", "KnowledgeBase", "AIModels", "Files", "Workflows", "Automations", "Billing"].map((f) => (
                        <th key={f} className="p-3 text-center">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232736]">
                    {Object.keys(rolePermissions).map((role) => (
                      <tr key={role} className="hover:bg-[#181a26]">
                        <td className="p-3 font-bold text-purple-300">{role}</td>
                        {["Projects", "KnowledgeBase", "AIModels", "Files", "Workflows", "Automations", "Billing"].map((f) => {
                          const isAllowed = rolePermissions[role]?.[f]
                          return (
                            <td key={f} className="p-3 text-center">
                              <button
                                onClick={() => togglePermission(role, f)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  isAllowed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {isAllowed ? "✓ ALLOW" : "✕ DENY"}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: INVITATIONS VIEW */}
          {/* ========================================================================= */}
          {activeTab === "invitations" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Mail className="w-4 h-4 text-purple-400" /> Pending Workspace Invitations
              </h3>

              <div className="flex flex-col gap-2">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-[#0d0e14] border border-[#232736] rounded-xl flex items-center justify-between font-mono">
                    <div>
                      <span className="font-bold text-white block">{inv.email}</span>
                      <span className="text-[10px] text-slate-400">Role: {inv.role} • Sent {inv.sent}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {inv.status}
                      </span>
                      <button
                        onClick={() => setToastMessage(`Resent invitation email to ${inv.email}!`)}
                        className="bg-purple-600 text-white font-bold px-3 py-1 rounded-lg cursor-pointer"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: WORKSPACE SETTINGS VIEW */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Settings className="w-4 h-4 text-purple-400" /> Enterprise Workspace Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Custom Workspace Subdomain</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setToastMessage("✅ Workspace settings saved successfully!")
                  setTimeout(() => setToastMessage(null), 3000)
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer text-center"
              >
                Save Workspace Settings
              </button>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (WORKSPACE OVERVIEW) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Workspace Telemetry */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-purple-400" /> Workspace Overview</span>
              <span className="text-[10px] text-emerald-400 font-mono">Enterprise</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Members:</span>
                <span className="text-white font-bold">48 Members</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Active Users:</span>
                <span className="text-emerald-400 font-bold">42 Active</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Pending Invites:</span>
                <span className="text-amber-400 font-bold">3 Invites</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Monthly AI Usage:</span>
                <span className="text-purple-400 font-bold">14.2M Tokens</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW MEMBER PROFILE DIALOG */}
      {/* ========================================================================= */}
      {selectedMemberProfile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Member Profile - {selectedMemberProfile.name}
              </h3>
              <button onClick={() => setSelectedMemberProfile(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 font-mono">
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-bold">{selectedMemberProfile.email}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="text-purple-300 font-bold">{selectedMemberProfile.role}</span>
              </div>
              <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">AI Usage:</span>
                <span className="text-emerald-400 font-bold">{selectedMemberProfile.aiUsage}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberProfile(null)}
              className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE TEAM DIALOG */}
      {/* ========================================================================= */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateTeam} className="bg-[#141620] border border-[#232736] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" /> Create New Engineering Squad / Team
              </h3>
              <button onClick={() => setShowCreateTeamModal(false)} type="button" className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Team / Squad Name</label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. LLM Optimization Squad..."
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              Create Team Squad
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
