"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Sparkles,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Eye,
  Bot,
  Database,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  Mail,
  UserPlus,
  Building,
  UserMinus,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react"

import { orgsApi, teamsApi } from "@/lib/api"
import { Organization, OrganizationMember, Team } from "@/types"

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
  const [inviteRole, setInviteRole] = useState<string>("member")

  // Modal Dialog States
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")

  // Live Toast & Process State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Real Data State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Interactive Roles & Permission Matrix State
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    "Owner / Admin": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: true, Billing: true },
    "Member": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: false, Billing: false },
    "Viewer": { Projects: true, KnowledgeBase: true, AIModels: false, Files: false, Workflows: false, Automations: false, Billing: false },
  })

  // Fetch Organizations & Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const orgs = await orgsApi.list()
      setOrganizations(orgs)

      if (orgs.length > 0) {
        const activeOrg = orgs[0]
        setSelectedOrg(activeOrg)
        const [mems, tms] = await Promise.all([
          orgsApi.listMembers(activeOrg.id),
          orgsApi.listTeams(activeOrg.id),
        ])
        setMembers(mems)
        setTeams(tms)
      } else {
        // Auto-create default org if empty
        const newOrg = await orgsApi.create({ name: "Primary Workspace" })
        setOrganizations([newOrg])
        setSelectedOrg(newOrg)
        const [mems, tms] = await Promise.all([
          orgsApi.listMembers(newOrg.id),
          orgsApi.listTeams(newOrg.id),
        ])
        setMembers(mems)
        setTeams(tms)
      }
    } catch (err: any) {
      console.error("Failed to load team data:", err)
      setError(err?.message || "Failed to load team data from backend")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle Switch Org
  const handleSelectOrg = async (org: Organization) => {
    setSelectedOrg(org)
    setIsLoading(true)
    try {
      const [mems, tms] = await Promise.all([
        orgsApi.listMembers(org.id),
        orgsApi.listTeams(org.id),
      ])
      setMembers(mems)
      setTeams(tms)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Failed to switch organization: ${err?.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Send Member Invite
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !selectedOrg) return
    setIsProcessing(true)
    setToastMessage(`✉️ Inviting ${inviteEmail} to ${selectedOrg.name}...`)

    try {
      await orgsApi.inviteMember(selectedOrg.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      const updatedMembers = await orgsApi.listMembers(selectedOrg.id)
      setMembers(updatedMembers)
      setInviteEmail("")
      setToastMessage(`✅ Member ${inviteEmail} successfully added with role ${inviteRole}!`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Invitation failed: ${err?.message || "Error"}`)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim() || !selectedOrg) return
    setIsProcessing(true)

    try {
      await orgsApi.createTeam(selectedOrg.id, {
        name: newTeamName.trim(),
        description: newTeamDesc.trim() || undefined,
      })
      const updatedTeams = await orgsApi.listTeams(selectedOrg.id)
      setTeams(updatedTeams)
      setShowCreateTeamModal(false)
      setNewTeamName("")
      setNewTeamDesc("")
      setToastMessage(`🎉 Team "${newTeamName}" created successfully!`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Failed to create team: ${err?.message || "Error"}`)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Delete Team
  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!selectedOrg) return
    try {
      await teamsApi.delete(teamId)
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
      setToastMessage(`🗑️ Team "${teamName}" removed.`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Failed to delete team: ${err?.message || "Error"}`)
    } finally {
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    return m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
  })

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
                Manage organization members, squads, role-based access control, and workspace collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons & Org Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {organizations.length > 1 && (
            <select
              value={selectedOrg?.id || ""}
              onChange={(e) => {
                const org = organizations.find((o) => o.id === e.target.value)
                if (org) handleSelectOrg(org)
              }}
              className="bg-[#181a26] border border-[#2d3248] text-xs font-semibold text-purple-300 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  🏢 {org.name} ({org.role || "member"})
                </option>
              ))}
            </select>
          )}

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

          <button
            onClick={loadData}
            disabled={isLoading}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs p-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-purple-400" : "text-slate-300"}`} />
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

      {/* Loading & Error Banners */}
      {isLoading && (
        <div className="bg-[#141620] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-purple-300 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Loading organization and team data from PostgreSQL...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
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
            { id: "roles", label: "Roles & Permissions", count: Object.keys(rolePermissions).length },
            { id: "invitations", label: "Invite Member", count: null },
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
              
              {/* Quick Search & Filters */}
              <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members by name, email, or role..."
                    className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>Organization:</span>
                  <span className="text-purple-300 font-bold">{selectedOrg?.name || "Workspace"}</span>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-[#232736] flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" /> Active Workspace Members ({filteredMembers.length})
                  </h3>
                  <Link
                    href="/dashboard/team/members"
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <span>Full Directory</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No members found matching your search.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1e2232]">
                    {filteredMembers.map((member) => {
                      const initials = member.full_name
                        ? member.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "U"

                      const isOwner = member.role === "owner"
                      const roleColor =
                        member.role === "owner"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : member.role === "admin"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"

                      return (
                        <div
                          key={member.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-[#181a26] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {member.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.avatar_url}
                                alt={member.full_name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#2d3248]"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center border border-[#2d3248] shrink-0">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{member.full_name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleColor}`}>
                                  {member.role.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                {member.email}
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TEAMS & SQUADS */}
          {/* ========================================================================= */}
          {activeTab === "teams" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-400" /> Organization Teams & Squads ({teams.length})
                </h3>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Team</span>
                </button>
              </div>

              {teams.length === 0 ? (
                <div className="bg-[#141620] border border-[#232736] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Building className="w-8 h-8 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-300">No teams created yet</span>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Create functional squads to organize projects and manage team permissions.
                  </p>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Create First Team
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((t) => (
                    <div
                      key={t.id}
                      className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/40 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-sm">{t.name}</h4>
                          <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                            {t.member_count} {t.member_count === 1 ? "Member" : "Members"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {t.description || "Active functional engineering and research squad."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#232736] text-[11px] font-mono text-slate-400">
                        <span>Created {new Date(t.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleDeleteTeam(t.id, t.name)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ROLES & PERMISSIONS */}
          {/* ========================================================================= */}
          {activeTab === "roles" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-[#232736] pb-3">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Role-Based Access Control (RBAC) Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-[#232736] text-slate-400">
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Projects</th>
                      <th className="py-2.5 px-3">Knowledge Base</th>
                      <th className="py-2.5 px-3">AI Models</th>
                      <th className="py-2.5 px-3">Workflows</th>
                      <th className="py-2.5 px-3">Billing & Org</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2232]">
                    <tr>
                      <td className="py-3 px-3 font-bold text-purple-300">Owner</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">MANAGE 🟢</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-blue-300">Admin</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-emerald-300">Member</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">READ / WRITE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">READ / WRITE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">USE 🟢</td>
                      <td className="py-3 px-3 text-slate-500">VIEW ⚪</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-400">Viewer</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">READ ONLY 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">READ ONLY 🟢</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: INVITATIONS */}
          {/* ========================================================================= */}
          {activeTab === "invitations" && (
            <form
              onSubmit={handleInviteMember}
              className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs"
            >
              <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-[#232736] pb-3">
                <UserPlus className="w-4 h-4 text-purple-400" /> Invite New Member to {selectedOrg?.name || "Workspace"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">User Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isProcessing ? "Processing..." : "Send Workspace Invitation"}</span>
              </button>
            </form>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (SUMMARY STATS & POLICIES) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-purple-400" /> Tenant Info
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">{selectedOrg?.plan_tier?.toUpperCase() || "FREE"}</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Members:</span>
                <span className="text-purple-300 font-bold">{members.length}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Squads / Teams:</span>
                <span className="text-blue-300 font-bold">{teams.length}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Your Role:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedOrg?.role || "OWNER"}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE TEAM */}
      {/* ========================================================================= */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTeam}
            className="bg-[#141620] border border-[#262a3c] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" /> Create New Team Squad
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTeamModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Team Name *</label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. AI Core Research Squad"
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-semibold">Description (Optional)</label>
              <textarea
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                placeholder="Brief description of the squad's scope and mission..."
                rows={3}
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#232736]">
              <button
                type="button"
                onClick={() => setShowCreateTeamModal(false)}
                className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isProcessing ? "Creating..." : "Create Team"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
