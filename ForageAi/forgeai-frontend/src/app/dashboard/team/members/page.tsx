"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  Sparkles,
  Search,
  Filter,
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
  Grid,
  List,
  ChevronLeft,
} from "lucide-react"

import { orgsApi } from "@/lib/api"
import { Organization, OrganizationMember } from "@/types"

export default function AllMembersPage() {
  const router = useRouter()

  // View Mode State (Grid Cards vs Table View)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("All Roles")

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("member")
  const [isProcessing, setIsProcessing] = useState(false)

  // Real Data State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Members
  const loadMembers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const orgs = await orgsApi.list()
      setOrganizations(orgs)

      if (orgs.length > 0) {
        const activeOrg = orgs[0]
        setSelectedOrg(activeOrg)
        const mems = await orgsApi.listMembers(activeOrg.id)
        setMembers(mems)
      }
    } catch (err: any) {
      console.error("Failed to load organization members:", err)
      setError(err?.message || "Failed to load members from backend")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  // Handle Invite Member
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !selectedOrg) return
    setIsProcessing(true)

    try {
      await orgsApi.inviteMember(selectedOrg.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      })
      setShowInviteModal(false)
      setInviteEmail("")
      setToastMessage(`✅ Invitation created and sent to ${inviteEmail}!`)
    } catch (err: any) {
      console.error(err)
      setToastMessage(`❌ Invitation failed: ${err?.message || "Error"}`)
    } finally {
      setIsProcessing(false)
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

  const isOwnerOrAdmin = selectedOrg?.role === "owner" || selectedOrg?.role === "admin"

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      m.full_name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    const matchesRole =
      selectedRole === "All Roles" || m.role.toLowerCase() === selectedRole.toLowerCase()
    return matchesSearch && matchesRole
  })

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/team"
              className="w-9 h-9 rounded-xl bg-[#1e2232] border border-[#2d3248] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Back to Team Overview"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                Organization Member Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Full list of active workspace collaborators, credentials, and RBAC privileges in {selectedOrg?.name || "Workspace"}.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>+ Invite Member</span>
            </button>
          )}

          <button
            onClick={loadMembers}
            disabled={isLoading}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs p-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Directory"
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
          <span>Loading members from database...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadMembers}
            className="px-3 py-1 bg-rose-600/30 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-500"
          >
            <option value="All Roles">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          <div className="flex items-center bg-[#0d0e14] border border-[#262a3c] rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MEMBERS DIRECTORY RENDER */}
      {filteredMembers.length === 0 ? (
        <div className="bg-[#141620] border border-[#232736] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Users className="w-8 h-8 text-slate-600" />
          <span className="text-xs font-semibold text-slate-300">No members found</span>
          <p className="text-[11px] text-slate-500">Try adjusting your search query or role filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="bg-[#141620] border border-[#232736] hover:border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {member.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#2d3248]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center border border-[#2d3248] shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-xs">{member.full_name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{member.email}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleColor}`}>
                    {member.role.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#232736] text-[11px] font-mono text-slate-400">
                  <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-2">
                    {isOwnerOrAdmin && !isTargetOwner && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                        className="bg-[#0d0e14] border border-[#262a3c] text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded focus:outline-none"
                      >
                        {selectedOrg?.role === "owner" && <option value="admin">Admin</option>}
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}

                    {isOwnerOrAdmin && !isTargetOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id, member.full_name)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
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
                    {isOwnerOrAdmin && !isTargetOwner && (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                        className="bg-[#0d0e14] border border-[#262a3c] text-[11px] font-mono text-purple-300 px-2.5 py-1 rounded-lg focus:outline-none"
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
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#141620] border border-[#2d3248] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" /> Invite Collaborator
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">User Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-[#1c1f2e] text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  {isProcessing ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
