"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User, Shield, Rocket, Search, Bell } from "lucide-react"
import { authStorage } from "@/lib/auth"
import { authApi } from "@/lib/api"

export default function TopNav() {
  const router = useRouter()
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(authStorage.getUser() || { full_name: "Tharun Surya", email: "tharun@forgeai.com" })
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error(e)
    } finally {
      authStorage.clearAuth()
      router.push("/login")
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "TS"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-20 sticky top-0 bg-[#0f1013]/90 backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Command + K to search..." 
            className="w-full bg-[#141620] border border-[#232736] rounded-xl pl-10 pr-12 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="bg-[#1e2232] border border-[#2d3248] rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 flex items-center">⌘</kbd>
            <kbd className="bg-[#1e2232] border border-[#2d3248] rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 flex items-center">K</kbd>
          </div>
        </div>
      </div>
      
      {/* Action Icons & Avatar */}
      <div className="flex items-center gap-3.5">
        <button className="text-slate-400 hover:text-slate-200 transition-colors relative p-2 hover:bg-[#1a1d26] rounded-xl">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500"></span>
        </button>

        <button className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
          <Rocket className="w-3.5 h-3.5" />
          <span>Deploy</span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs border border-purple-500/40 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="User Account"
          >
            {getInitials(user?.full_name)}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#141620] border border-[#262a3c] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#1e2232] mb-1">
                <span className="font-bold text-white block truncate text-xs">{user?.full_name || "Tharun Surya"}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || "tharun@forgeai.com"}</span>
              </div>

              <Link
                href="/dashboard/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1f2333] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Profile Settings</span>
              </Link>

              <Link
                href="/dashboard/settings/security"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1f2333] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Security & Sessions</span>
              </Link>

              <div className="h-px bg-[#262a3c] my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors w-full text-left font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

