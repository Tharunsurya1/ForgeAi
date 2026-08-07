"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

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
      <div className="p-3 mt-auto flex flex-col gap-3 border-t border-[#1c1e24] bg-[#0f1013]">
        {/* Upgrade Button */}
        <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
          <Zap className="w-3.5 h-3.5 fill-current text-white" />
          <span>Upgrade to Pro</span>
        </button>

        {/* User Profile */}
        <div className="pt-2 border-t border-[#1c1e24] flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs border border-[#3b82f6]/40 shrink-0 shadow-sm">
            AD
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate leading-tight">Alex Developer</span>
            <span className="text-[11px] text-slate-400 truncate leading-tight">alex@forgeai.com</span>
          </div>
        </div>
      </div>
    </aside>
  )
}


