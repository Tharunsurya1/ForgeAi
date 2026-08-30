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
  Trash2,
  Edit3,
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
  Copy,
  Check,
} from "lucide-react"

import { orgsApi, teamsApi } from "@/lib/api"
import { Organization, OrganizationInvitation, OrganizationMember, Team } from "@/types"

export default function TeamWorkspacePage() {
  const router = useRouter()

  // Navigation Tab State (4 Tabs)
  const [activeTab, setActiveTab] = useState<"members" | "teams" | "roles" | "invitations">("members")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("member")

  // Modal Dialog States
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")

  // Live Toast & Process State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Real Data State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Interactive Roles & Permission Matrix State
  const [rolePermissions] = useState<Record<string, Record<string, boolean>>>({
    "Owner": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: true, Billing: true },
    "Admin": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: true, Automations: true, Billing: false },
    "Member": { Projects: true, KnowledgeBase: true, AIModels: true, Files: true, Workflows: false, Automations: false, Billing: false },
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
        const activeOrg = selectedOrg ? (orgs.find(o => o.id === selectedOrg.id) || orgs[0]) : orgs[0]
        setSelectedOrg(activeOrg)
        const [mems, tms, invs] = await Promise.all([
          orgsApi.listMembers(activeOrg.id),
          orgsApi.listTeams(activeOrg.id),
          orgsApi.listInvitations(activeOrg.id).catch(() => []),
        ])
        setMembers(mems)
        setTeams(tms)
        setInvitations(invs)
      } else {
        const newOrg = await orgsApi.create({ name: "Primary Workspace" })
        setOrganizations([newOrg])
        setSelectedOrg(newOrg)
        const [mems, tms, invs] = await Promise.all([
          orgsApi.listMembers(newOrg.id),
          orgsApi.listTeams(newOrg.id),
          orgsApi.listInvitations(newOrg.id).catch(() => []),
        ])
        setMembers(mems)
        setTeams(tms)
        setInvitations(invs)
      }
    } catch (err: any) {
      console.error("Failed to load team data:", err)
      setError(err?.message || "Failed to load team data from backend")
    } finally {
      setIsLoading(false)
    }
  }, [selectedOrg])

  useEffect(() => {
    loadData()
  }, [])

  // Handle Switch Org
  const handleSelectOrg = async (org: Organization) => {
    setSelectedOrg(org)
    setIsLoading(true)
    try {
      const [mems, tms, invs] = await Promise.all([
        orgsApi.listMembers(org.id),
        orgsApi.listTeams(org.id),
        orgsApi.listInvitations(org.id).catch(() => []),
      ])
      setMembers(mems)
      setTeams(tms)
      setInvitations(invs)
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
    setToastMessage(`✉️ Creating secure invitation for ${inviteEmail}...`)

    try {
      const newInv = await orgsApi.inviteMember(selectedOrg.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      setInvitations((prev) => [newInv, ...prev])
      setInviteEmail("")
      setToastMessage(`✅ Invitation sent to ${inviteEmail} with role ${inviteRole}!`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Invitation failed: ${err?.message || "Error"}`)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Revoke Invitation
  const handleRevokeInvite = async (invitationId: string) => {
    if (!selectedOrg) return
    try {
      await orgsApi.revokeInvitation(selectedOrg.id, invitationId)
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId ? { ...i, status: "revoked" } : i))
      )
      setToastMessage("🗑️ Invitation successfully revoked.")
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Revocation failed: ${err?.message || "Error"}`)
    } finally {
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!selectedOrg) return
    try {
      const updated = await orgsApi.updateMemberRole(selectedOrg.id, userId, { role: newRole })
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: updated.role } : m))
      )
      setToastMessage(`🛡️ Member role updated to ${newRole.toUpperCase()}!`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Role update failed: ${err?.message || "Error"}`)
    } finally {
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  // Handle Remove Member
  const handleRemoveMember = async (userId: string, fullName: string) => {
    if (!selectedOrg) return
    if (!confirm(`Are you sure you want to remove ${fullName} from ${selectedOrg.name}?`)) return

    try {
      await orgsApi.removeMember(selectedOrg.id, userId)
      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
      setToastMessage(`👋 Member ${fullName} removed from workspace.`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Member removal failed: ${err?.message || "Error"}`)
    } finally {
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
    if (!confirm(`Are you sure you want to delete the team "${teamName}"?`)) return
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

  // Handle Copy Token / Invite Link
  const handleCopyInvite = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/team?token=${token}`)
    setCopiedToken(token)
    setToastMessage("📋 Invitation link copied to clipboard!")
    setTimeout(() => setCopiedToken(null), 2500)
  }

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    return m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
  })

  const isOwnerOrAdmin = selectedOrg?.role === "owner" || selectedOrg?.role === "admin"

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

          {isOwnerOrAdmin && (
            <button
              onClick={() => setActiveTab("invitations")}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>+ Invite Member</span>
            </button>
          )}

          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Building className="w-4 h-4 text-purple-400" />
              <span>Create Team</span>
            </button>
          )}

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
      {/* 4 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "members", label: "All Members", count: members.length },
            { id: "teams", label: "Teams & Squads", count: teams.length },
            { id: "roles", label: "Roles & Permissions", count: Object.keys(rolePermissions).length },
            { id: "invitations", label: "Invitations & Access", count: invitations.filter(i => i.status === "pending").length },
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
              {tab.count !== null && tab.count !== undefined && (
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

                      const isTargetOwner = member.role === "owner"
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

                          <div className="flex items-center gap-3">
                            {/* Role Selector (Owner & Admin can change roles) */}
                            {isOwnerOrAdmin && !isTargetOwner && (
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                                className="bg-[#0d0e14] border border-[#262a3c] text-[11px] font-mono text-purple-300 px-2.5 py-1 rounded-lg focus:outline-none focus:border-purple-500"
                              >
                                {selectedOrg?.role === "owner" && <option value="admin">Admin</option>}
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            )}

                            {isOwnerOrAdmin && !isTargetOwner && (
                              <button
                                onClick={() => handleRemoveMember(member.user_id, member.full_name)}
                                className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Remove Member"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}

                            <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </div>
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
                {isOwnerOrAdmin && (
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Team</span>
                  </button>
                )}
              </div>

              {teams.length === 0 ? (
                <div className="bg-[#141620] border border-[#232736] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Building className="w-8 h-8 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-300">No teams created yet</span>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Create functional squads to organize projects and manage team permissions.
                  </p>
                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => setShowCreateTeamModal(true)}
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Create First Team
                    </button>
                  )}
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
                        {isOwnerOrAdmin && (
                          <button
                            onClick={() => handleDeleteTeam(t.id, t.name)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                      <th className="py-2.5 px-3">AI Blueprints</th>
                      <th className="py-2.5 px-3">Teams</th>
                      <th className="py-2.5 px-3">Billing & Org</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2232]">
                    <tr>
                      <td className="py-3 px-3 font-bold text-purple-300">Owner</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">GENERATE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">MANAGE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">MANAGE 🟢</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-blue-300">Admin</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">FULL 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">GENERATE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">MANAGE 🟢</td>
                      <td className="py-3 px-3 text-slate-500">DENIED ⚪</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-emerald-300">Member</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">CREATE / EDIT 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">READ / WRITE 🟢</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">GENERATE 🟢</td>
                      <td className="py-3 px-3 text-slate-400">VIEW ⚪</td>
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
            <div className="flex flex-col gap-6">
              {isOwnerOrAdmin && (
                <form
                  onSubmit={handleInviteMember}
                  className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs"
                >
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-[#232736] pb-3">
                    <UserPlus className="w-4 h-4 text-purple-400" /> Send Tokenized Invitation to {selectedOrg?.name || "Workspace"}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-slate-400 font-semibold">User Email Address</label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="collaborator@company.com"
                        className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-semibold">Assign Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                      >
                        {selectedOrg?.role === "owner" && <option value="admin">Administrator</option>}
                        <option value="member">Regular Member</option>
                        <option value="viewer">Viewer (Read-Only)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isProcessing ? "Sending Invitation..." : "Send Invitation"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Pending & Active Invitations List */}
              <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-[#232736] flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" /> Pending Invitations ({invitations.length})
                  </h3>
                </div>

                {invitations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No invitations generated for this workspace yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1e2232]">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181a26] transition-colors text-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{inv.email}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {inv.role.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              inv.status === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : inv.status === "accepted"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}>
                              {inv.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Expires: {new Date(inv.expires_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {inv.status === "pending" && (
                            <button
                              onClick={() => handleCopyInvite(inv.token)}
                              className="px-2.5 py-1.5 bg-[#0d0e14] hover:bg-[#222536] border border-[#2d3248] rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer transition-colors"
                              title="Copy Invitation Link"
                            >
                              {copiedToken === inv.token ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>Copy Link</span>
                            </button>
                          )}

                          {isOwnerOrAdmin && inv.status === "pending" && (
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Revoke Invitation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* SIDEBAR WIDGET COLUMN */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Building className="w-4 h-4 text-purple-400" /> Workspace Overview
            </h4>
            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Active Workspace:</span>
                <span className="text-purple-300 font-bold">{selectedOrg?.name || "Workspace"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plan Tier:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedOrg?.plan_tier || "free"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Your Role:</span>
                <span className="text-blue-400 font-bold uppercase">{selectedOrg?.role || "member"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Members:</span>
                <span className="text-slate-200 font-bold">{members.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Squads:</span>
                <span className="text-slate-200 font-bold">{teams.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CREATE TEAM MODAL */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#141620] border border-[#2d3248] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" /> Create New Team
              </h3>
              <button
                onClick={() => setShowCreateTeamModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. AI Core Infrastructure"
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Description (Optional)</label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Mission, technical responsibilities, or squad scope..."
                  rows={3}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 bg-[#1c1f2e] text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  {isProcessing ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
