"use client"
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutGrid,
  Sparkles,
  Folder,
  FileText,
  Code2,
  Palette,
  Database,
  Workflow,
  Zap,
  File,
  Users,
  BarChart2,
  ChevronsUpDown,
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Shield,
  Sliders,
  MoreVertical,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react"
import { authApi } from "@/lib/api"
import { authStorage } from "@/lib/auth"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutType, setLogoutType] = useState<"current" | "all">("current")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load logged-in user from storage
    const storedUser = authStorage.getUser()
    if (storedUser) {
      setUser(storedUser)
    } else {
      setUser({ full_name: "Tharun Surya", email: "tharun@forgeai.com" })
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async (allDevices: boolean = false) => {
    setIsLoggingOut(true)
    try {
      await authApi.logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      authStorage.clearAuth()
      setIsLoggingOut(false)
      setShowLogoutModal(false)
      setIsMenuOpen(false)
      router.push("/login")
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "FA"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, exact: true },
    {
      label: "AI",
      href: "/dashboard/ai",
      icon: Sparkles,
      subItems: [
        { label: "Chat", href: "/dashboard/ai/chat" },
        { label: "Agents", href: "/dashboard/agents" },
        { label: "Models", href: "/dashboard/models" },
        { label: "Prompt Library", href: "/dashboard/prompts" },
      ],
    },
    {
      label: "Documents",
      href: "/dashboard/documents",
      icon: FileText,
      subItems: [
        { label: "Project Notes", href: "/dashboard/documents" },
        { label: "AI Doc Generator", href: "/dashboard/documents/generator" },
      ],
    },
    { label: "Code Studio", href: "/dashboard/code-studio", icon: Code2 },
    { label: "UI Studio", href: "/dashboard/ui-studio", icon: Palette },
  ]

  const knowledgeFlowItems = [
    { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: Database },
    { label: "Workflows", href: "/dashboard/workflows", icon: Workflow },
    { label: "Automations", href: "/dashboard/automations", icon: Zap },
    { label: "Files", href: "/dashboard/files", icon: File },
  ]

  const managementItems = [
    { label: "Team", href: "/dashboard/team", icon: Users },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
    { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ]

  return (
    <>
      <aside className="bg-[#0f1013] text-slate-200 h-screen w-60 border-r border-[#1c1e24] flex flex-col shrink-0 relative z-20 select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1c1e24] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              F
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">ForgeAi</h1>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white transition-colors" />
              </div>
              <span className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">Enterprise Plan</span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1 text-xs md:text-sm">
          {/* Main Nav */}
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)

            if (item.subItems) {
              const isSubActive = item.subItems.some((sub) => pathname?.startsWith(sub.href))
              return (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <div
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isSubActive ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {/* Sub Items */}
                  <div className="pl-9 flex flex-col gap-1.5 py-0.5">
                    {item.subItems.map((sub) => {
                      const activeSub = pathname === sub.href
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`text-xs font-medium transition-colors ${
                            activeSub ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#20232b] text-white"
                    : "text-slate-400 hover:text-white hover:bg-[#16181e]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Category: KNOWLEDGE & FLOW */}
          <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Knowledge & Flow
          </div>
          {knowledgeFlowItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#20232b] text-white"
                    : "text-slate-400 hover:text-white hover:bg-[#16181e]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* Category: MANAGEMENT */}
          <div className="pt-4 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Management
          </div>
          {managementItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#20232b] text-white"
                    : "text-slate-400 hover:text-white hover:bg-[#16181e]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Section */}
        <div className="p-3 mt-auto flex flex-col gap-3 border-t border-[#1c1e24] bg-[#0f1013] relative" ref={menuRef}>
          {/* User Profile Popover / Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#141620] border border-[#262a3c] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xl">
              {/* Popover Header */}
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#1e2232] flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  {getInitials(user?.full_name)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-white truncate text-xs">{user?.full_name || "User Account"}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email || "user@forgeai.com"}</span>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <Link
                href="/dashboard/settings/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1f2333] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Profile Settings</span>
              </Link>

              <Link
                href="/dashboard/settings/security"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1f2333] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Security & Sessions</span>
              </Link>

              <Link
                href="/dashboard/settings/appearance"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1f2333] transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Appearance</span>
              </Link>

              <div className="h-px bg-[#262a3c] my-1" />

              {/* Logout Options in Menu */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  setLogoutType("current")
                  setShowLogoutModal(true)
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors w-full text-left font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out Current Device</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  setLogoutType("all")
                  setShowLogoutModal(true)
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors w-full text-left text-[11px] cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400/70" />
                <span>Log Out All Devices</span>
              </button>
            </div>
          )}

          {/* Upgrade Button */}
          <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
            <Zap className="w-3.5 h-3.5 fill-current text-white" />
            <span>Upgrade to Pro</span>
          </button>

          {/* User Profile Bar with Click to Open Menu & Quick Logout */}
          <div className="pt-2 border-t border-[#1c1e24] flex items-center justify-between gap-1.5 px-1">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 min-w-0 flex-1 p-1.5 -ml-1 rounded-xl hover:bg-[#1a1d26] transition-colors cursor-pointer group"
              title="Click for account & logout options"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-[11px] border border-[#3b82f6]/40 shrink-0 shadow-sm">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-white truncate leading-tight group-hover:text-purple-300 transition-colors">
                  {user?.full_name || "Alex Developer"}
                </span>
                <span className="text-[10px] text-slate-400 truncate leading-tight">
                  {user?.email || "alex@forgeai.com"}
                </span>
              </div>
            </div>

            {/* Quick 1-Click Logout Action Button */}
            <button
              type="button"
              onClick={() => {
                setLogoutType("current")
                setShowLogoutModal(true)
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Log out of session"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sleek Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141620] border border-[#262a3c] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#232736] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {logoutType === "all" ? "Log Out All Devices?" : "Log Out of ForgeAI?"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {logoutType === "all"
                      ? "This will revoke all active sessions across desktop, mobile, and web."
                      : "You will be signed out of this browser session."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2333] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/30">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white font-bold truncate text-xs">{user?.full_name || "User"}</span>
                <span className="text-slate-400 text-[11px] truncate">{user?.email || "user@forgeai.com"}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#232736]">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleLogout(logoutType === "all")}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5 text-white" />
                    <span>{logoutType === "all" ? "Log Out Everywhere" : "Confirm Log Out"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



