"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Sparkles,
  Command,
  Bell,
  Settings,
  Plus,
  MessageSquare,
  Folder,
  FileText,
  Code2,
  Palette,
  Database,
  Workflow,
  Zap,
  Users,
  BarChart3,
  Cpu,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  Layers,
  Bot,
  Play,
  Square,
  Check,
  Calendar,
  ChevronRight,
  Download,
  Trash2,
  Filter,
  Globe,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Terminal,
  HardDrive,
  Percent,
  ChevronDown,
  X,
  ExternalLink,
  PieChart as PieIcon,
} from "lucide-react"

export default function DashboardPage() {
  // State for interactive features
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("GPT-4o (Active)")
  
  const [workspaceSelectorOpen, setWorkspaceSelectorOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState("⚡ Enterprise Workspace")

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "High Token Usage Alert", message: "Cluster-01 exceeded 80% quota", time: "10m ago", priority: "HIGH", unread: true },
    { id: 2, title: "Workflow Execution Completed", message: "Daily Data Sync executed successfully", time: "1h ago", priority: "LOW", unread: true },
    { id: 3, title: "Agent Deployment Live", message: "Customer Support Agent v2.4 deployed", time: "3h ago", priority: "MEDIUM", unread: false },
  ])

  const [agents, setAgents] = useState([
    { id: 1, name: "Crawler-Bot Alpha", avatar: "🤖", task: "Scraping tech blogs & indexing vectors", status: "Running", cpu: "42%", mem: "1.2 GB", runtime: "04h 12m", running: true },
    { id: 2, name: "Data Synthesizer", avatar: "⚡", task: "Generating synthetic training pairs", status: "Processing", cpu: "78%", mem: "3.4 GB", runtime: "01h 45m", running: true },
    { id: 3, name: "Security Auditor", avatar: "🛡️", task: "Scanning repo for secrets & vulnerabilities", status: "Idle", cpu: "04%", mem: "512 MB", runtime: "12h 05m", running: false },
    { id: 4, name: "DevOps Copilot", avatar: "🚀", task: "Monitoring K8s pod health & auto-scaling", status: "Running", cpu: "29%", mem: "1.8 GB", runtime: "08h 30m", running: true },
  ])

  const [pendingTasks, setPendingTasks] = useState([
    { id: 1, text: "Review fine-tuning dataset v3", done: false },
    { id: 2, text: "Approve GPU cluster scaling policy", done: true },
    { id: 3, text: "Rotate OpenAI & Anthropic API keys", done: false },
    { id: 4, text: "Verify RAG vector search latency", done: false },
  ])

  const [projectFilter, setProjectFilter] = useState("All")

  const toggleTask = (id: number) => {
    setPendingTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const toggleAgent = (id: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const isRunning = !a.running
        return {
          ...a,
          running: isRunning,
          status: isRunning ? "Running" : "Stopped",
          cpu: isRunning ? "35%" : "00%",
        }
      }
      return a
    }))
  }

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-8">

      {/* ========================================================================= */}
      {/* TOP NAVIGATION HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141a]/80 backdrop-blur-xl border border-[#222530] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg sticky top-2 z-40">
        
        {/* Title & Path */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-blue-500/20 shrink-0">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">ForgeAI</h1>
              <span className="text-xs text-slate-500 font-mono">/</span>
              <span className="text-xs font-semibold text-blue-400">Dashboard Overview</span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise AI SaaS Operating System</p>
          </div>
        </div>

        {/* Search Bar with Command+K */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, agents, workflows, files... (Cmd + K)"
            className="w-full bg-[#0d0e12] border border-[#262936] rounded-xl pl-10 pr-16 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#181a22] border border-[#282c3c] px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        {/* Action Dropdowns & User Profile */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* AI Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setModelSelectorOpen(!modelSelectorOpen); setWorkspaceSelectorOpen(false); setNotificationOpen(false) }}
              className="bg-[#181a22] hover:bg-[#20232e] border border-[#282c3c] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {modelSelectorOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#15171f] border border-[#2b2f3e] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                {["GPT-4o (Active)", "Claude 3.5 Sonnet", "Llama 3.1 70B", "Gemini 1.5 Pro"].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedModel(m); setModelSelectorOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedModel === m ? "bg-[#2563eb] text-white" : "text-slate-300 hover:bg-[#20232e]"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setWorkspaceSelectorOpen(!workspaceSelectorOpen); setModelSelectorOpen(false); setNotificationOpen(false) }}
              className="bg-[#181a22] hover:bg-[#20232e] border border-[#282c3c] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{selectedWorkspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {workspaceSelectorOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#15171f] border border-[#2b2f3e] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                {["⚡ Enterprise Workspace", "🚀 Production Cluster", "🧪 Staging Workspace"].map((w) => (
                  <button
                    key={w}
                    onClick={() => { setSelectedWorkspace(w); setWorkspaceSelectorOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedWorkspace === w ? "bg-[#2563eb] text-white" : "text-slate-300 hover:bg-[#20232e]"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Icon with Unread Badge */}
          <div className="relative">
            <button
              onClick={() => { setNotificationOpen(!notificationOpen); setModelSelectorOpen(false); setWorkspaceSelectorOpen(false) }}
              className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] border border-[#282c3c] text-slate-300 flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            {/* Notification Popover */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#15171f] border border-[#2b2f3e] rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#262a38] pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-blue-400" /> Notifications
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notifications.filter(n => n.unread).length} unread
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-colors ${
                        n.unread ? "bg-[#1c1f2b] border-blue-500/30" : "bg-[#12141a] border-[#222530]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[170px]">{n.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          n.priority === "HIGH" ? "bg-rose-500/20 text-rose-400" : n.priority === "MEDIUM" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>{n.priority}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{n.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                        {n.unread && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Shortcut */}
          <Link
            href="/dashboard/settings"
            className="w-9 h-9 rounded-xl bg-[#181a22] hover:bg-[#20232e] border border-[#282c3c] text-slate-300 flex items-center justify-center transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#262936]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs border border-blue-400/30 shrink-0 shadow-md">
              TH
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">Tharun</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Admin
              </span>
            </div>
          </div>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="w-full bg-gradient-to-r from-[#14161f] via-[#161924] to-[#12141c] border border-[#232736] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        
        {/* Ambient Gradient Glow Effect */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> ForgeAI v2.4 Enterprise Release
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, Tharun 👋
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Good Morning! Manage your AI workspace, agents, projects and automations from one place.
          </p>
        </div>

        {/* Hero Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/dashboard/projects/new"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs md:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create New Project</span>
          </Link>

          <Link
            href="/dashboard/ai/chat"
            className="bg-[#181a24] hover:bg-[#222533] border border-[#2d3246] text-slate-200 font-semibold text-xs md:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Start AI Chat</span>
          </Link>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: AI USAGE SUMMARY (4 KPI CARDS) */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Total AI Requests */}
        <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 flex flex-col justify-between h-44 shadow-md hover:border-[#32384d] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total AI Requests</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">1,428,950</h3>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="w-full h-2 bg-[#1c1f2c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[78%]"></div>
          </div>
        </div>

        {/* KPI 2: Tokens Used */}
        <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 flex flex-col justify-between h-44 shadow-md hover:border-[#32384d] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +8.6%
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tokens Used</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">84.2M</h3>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="w-full h-2 bg-[#1c1f2c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[84%]"></div>
          </div>
        </div>

        {/* KPI 3: Cost This Month */}
        <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 flex flex-col justify-between h-44 shadow-md hover:border-[#32384d] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> -3.1%
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Cost This Month</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">$1,248.50</h3>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="w-full h-2 bg-[#1c1f2c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[62%]"></div>
          </div>
        </div>

        {/* KPI 4: Avg Response Time */}
        <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 flex flex-col justify-between h-44 shadow-md hover:border-[#32384d] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              -18ms
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Avg Response Time</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1">240ms</h3>
          </div>
          {/* Mini Sparkline Chart */}
          <div className="w-full h-2 bg-[#1c1f2c] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full w-[90%]"></div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN CONTAINER: SECTIONS 2-12 + RIGHT SIDE PANEL */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

        {/* LEFT / MAIN COLUMN (SECTIONS 2 TO 12) */}
        <div className="xl:col-span-3 flex flex-col gap-8 w-full">

          {/* ========================================================================= */}
          {/* SECTION 2: RECENT PROJECTS TABLE */}
          {/* ========================================================================= */}
          <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#232736] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-400" /> Recent Projects
                </h3>
                <p className="text-xs text-slate-400">Active AI development projects & repositories</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#0d0e12] p-1 rounded-xl border border-[#232736]">
                {["All", "Active", "Deploying", "Paused"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setProjectFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      projectFilter === st ? "bg-[#2563eb] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736]">
                    <th className="pb-3 px-2">Project Name</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Last Updated</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Owner</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2230]">
                  {[
                    { name: "Neural Engine v3", type: "LLM Infrastructure", updated: "2m ago", status: "Active", owner: "Tharun" },
                    { name: "Automated Support Agent", type: "AI Agent", updated: "14m ago", status: "Deploying", owner: "Sarah K." },
                    { name: "Vector DB Pipeline", type: "Data Science", updated: "1h ago", status: "Active", owner: "Alex D." },
                    { name: "Vision OCR Pipeline", type: "Computer Vision", updated: "3h ago", status: "Completed", owner: "Tharun" },
                    { name: "CodeRefactor Bot", type: "Automation", updated: "1d ago", status: "Paused", owner: "Marcus V." },
                  ]
                    .filter(p => projectFilter === "All" || p.status === projectFilter)
                    .map((proj, idx) => (
                      <tr key={idx} className="hover:bg-[#191c28] transition-colors group">
                        <td className="py-3 px-2 font-semibold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {proj.name}
                        </td>
                        <td className="py-3 px-2 text-slate-400">{proj.type}</td>
                        <td className="py-3 px-2 text-slate-400 font-mono">{proj.updated}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            proj.status === "Active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            proj.status === "Deploying" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                            proj.status === "Completed" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-slate-500/10 border-slate-500/30 text-slate-400"
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">{proj.owner}</td>
                        <td className="py-3 px-2 text-right">
                          <Link
                            href="/dashboard/projects"
                            className="bg-[#1e2230] hover:bg-[#2563eb] text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                          >
                            Open <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 3: RECENT CHATS & CHARTS (AREA + BAR CHART) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Chats Grid */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" /> Recent AI Chats
                </h3>
                <Link href="/dashboard/ai/chat" className="text-xs text-blue-400 hover:underline">View All</Link>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { title: "Architecture review for Distributed Vector Search", model: "Claude 3.5 Sonnet", preview: "I have optimized the HNSW index params for 10M vectors...", time: "5m ago" },
                  { title: "SQL Query Optimization & Indexing Strategy", model: "GPT-4o", preview: "Here is the optimized EXPLAIN ANALYZE query plan...", time: "42m ago" },
                  { title: "Python Microservice Refactoring", model: "Llama 3 70B", preview: "Replaced synchronous requests with asyncio gather pool...", time: "2h ago" },
                ].map((chat, idx) => (
                  <div key={idx} className="p-4 bg-[#181a24] border border-[#242838] rounded-xl flex flex-col gap-2 hover:border-[#353b52] transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[220px]">{chat.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono">
                        {chat.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-normal">{chat.preview}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">{chat.time}</span>
                      <Link href="/dashboard/ai/chat" className="text-xs text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1">
                        Continue Chat →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Inference Throughput Area & Bar Chart */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" /> Token Inference Volume (24h)
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Live</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Real-time LLM token consumption chart</p>
              </div>

              {/* SVG Area Chart */}
              <div className="w-full h-44 relative my-4">
                <div className="absolute inset-0 flex flex-col justify-between py-2 text-[10px] text-slate-500 font-mono border-b border-[#232736]/60">
                  <div className="border-b border-[#232736]/40 pb-1">120K tokens/min</div>
                  <div className="border-b border-[#232736]/40 pb-1">80K tokens/min</div>
                  <div className="border-b border-[#232736]/40 pb-1">40K tokens/min</div>
                  <div>0 tokens</div>
                </div>

                <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,65 Q 15,35 30,55 T 60,30 T 80,45 T 100,15 L 100,100 L 0,100 Z"
                    fill="url(#areaGradient)"
                  />
                  <path
                    d="M 0,65 Q 15,35 30,55 T 60,30 T 80,45 T 100,15"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              {/* Model Bar Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#232736] text-[11px]">
                <div className="flex flex-col">
                  <span className="text-slate-400">GPT-4o</span>
                  <span className="font-bold text-white">58%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Claude 3.5</span>
                  <span className="font-bold text-purple-400">32%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400">Llama 3</span>
                  <span className="font-bold text-indigo-400">10%</span>
                </div>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: RUNNING AI AGENTS GRID */}
          {/* ========================================================================= */}
          <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" /> Running AI Agents
                </h3>
                <p className="text-xs text-slate-400">Autonomous workers executing background workflows</p>
              </div>
              <Link href="/dashboard/agents" className="text-xs text-blue-400 hover:underline">Manage Agents</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((ag) => (
                <div key={ag.id} className="p-4 bg-[#181a24] border border-[#242838] rounded-xl flex flex-col gap-3 hover:border-[#353b52] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#222634] text-xl flex items-center justify-center border border-[#303648] shrink-0">
                        {ag.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{ag.name}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          ag.running ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-slate-500/10 border border-slate-500/30 text-slate-400"
                        }`}>
                          {ag.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAgent(ag.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ag.running ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {ag.running ? "Stop" : "Start"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#12141c] p-2.5 rounded-lg border border-[#202432] font-mono leading-relaxed">
                    {ag.task}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono border-t border-[#232736] pt-2 text-slate-400">
                    <div>CPU: <span className="text-white">{ag.cpu}</span></div>
                    <div>MEM: <span className="text-white">{ag.mem}</span></div>
                    <div>TIME: <span className="text-white">{ag.runtime}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: ACTIVE AUTOMATIONS (TIMELINE STYLE) */}
          {/* ========================================================================= */}
          <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" /> Active Automations (Timeline)
              </h3>
              <Link href="/dashboard/automations" className="text-xs text-blue-400 hover:underline">View All</Link>
            </div>

            <div className="relative pl-6 border-l-2 border-[#262a3a] flex flex-col gap-6 my-2">
              {[
                { name: "Daily Data Vector Sync", trigger: "Cron (0 0 * * *)", next: "In 4 hours", status: "Active", last: "20h ago (Success)" },
                { name: "GitHub PR Auto Reviewer", trigger: "Webhook (pull_request.opened)", next: "Real-time", status: "Active", last: "12m ago (Success)" },
                { name: "Slack Incident Alerting", trigger: "Webhook (alert.triggered)", next: "Real-time", status: "Active", last: "2h ago (Success)" },
                { name: "Database Backup & Indexing", trigger: "Event (db.snapshot)", next: "Tomorrow 02:00", status: "Scheduled", last: "1d ago (Success)" },
              ].map((auto, idx) => (
                <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between bg-[#181a24] border border-[#242838] rounded-xl p-4 gap-3">
                  <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-amber-400 border-4 border-[#14161f]"></div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{auto.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Trigger: <span className="text-slate-200 font-mono">{auto.trigger}</span></p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">Next: <span className="text-white">{auto.next}</span></span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {auto.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTIONS 6 & 7: TEAM ACTIVITY & NOTIFICATIONS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section 6: Team Activity Feed */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Users className="w-4 h-4 text-blue-400" /> Team Activity Feed
              </h3>
              <div className="flex flex-col gap-3.5">
                {[
                  { user: "Sarah Jenkins", action: "joined Enterprise Workspace", time: "5m ago", icon: "👋" },
                  { user: "Tharun", action: "created AI Agent 'DevOps Copilot v2'", time: "24m ago", icon: "🤖" },
                  { user: "System", action: "executed workflow 'Production Data Sync'", time: "1h ago", icon: "⚙️" },
                  { user: "Alex", action: "uploaded document 'architecture-specs-v4.pdf'", time: "3h ago", icon: "📄" },
                  { user: "Marcus", action: "added comment on 'Vector DB Pipeline'", time: "5h ago", icon: "💬" },
                ].map((act, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#202330] border border-[#2d3244] flex items-center justify-center text-sm shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-white">{act.user}</span> <span className="text-slate-400">{act.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{act.time}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 7: Notifications Center */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Bell className="w-4 h-4 text-purple-400" /> Notifications Center
              </h3>
              <div className="flex flex-col gap-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-[#181a24] border border-[#242838] rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${n.unread ? "bg-rose-500" : "bg-slate-600"}`}></div>
                      <div>
                        <h5 className="text-xs font-bold text-white">{n.title}</h5>
                        <p className="text-[11px] text-slate-400">{n.message}</p>
                      </div>
                    </div>
                    {n.unread && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[11px] text-blue-400 hover:underline shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 8: QUICK ACTIONS GRID */}
          {/* ========================================================================= */}
          <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Zap className="w-4 h-4 text-yellow-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "+ New Chat", href: "/dashboard/ai/chat", icon: MessageSquare, color: "text-purple-400" },
                { label: "+ Create Agent", href: "/dashboard/agents", icon: Bot, color: "text-emerald-400" },
                { label: "+ Upload File", href: "/dashboard/files", icon: FileText, color: "text-blue-400" },
                { label: "+ Create Workflow", href: "/dashboard/workflows", icon: Workflow, color: "text-amber-400" },
                { label: "+ New Project", href: "/dashboard/projects/new", icon: Plus, color: "text-indigo-400" },
                { label: "+ Invite Member", href: "/dashboard/team", icon: Users, color: "text-pink-400" },
              ].map((act, idx) => {
                const Icon = act.icon
                return (
                  <Link
                    key={idx}
                    href={act.href}
                    className="p-4 bg-[#181a24] hover:bg-[#222533] border border-[#242838] hover:border-[#3b425a] rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all group active:scale-95"
                  >
                    <Icon className={`w-5 h-5 ${act.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-semibold text-white">{act.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 9 & 10: RESOURCE USAGE & RECENT FILES */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section 9: Resource Usage */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <HardDrive className="w-4 h-4 text-emerald-400" /> Infrastructure Resource Usage
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "CPU Core Allocation", val: "68%", info: "32.6 / 48 vCPUs", color: "bg-blue-500" },
                  { label: "RAM Memory", val: "82%", info: "105 GB / 128 GB", color: "bg-purple-500" },
                  { label: "Vector DB Storage", val: "43%", info: "432 GB / 1 TB", color: "bg-amber-500" },
                  { label: "API Rate Limit", val: "54%", info: "5,400 / 10,000 req/min", color: "bg-emerald-500" },
                  { label: "GPU Compute Cluster", val: "91%", info: "14.5 / 16 H100 SXM", color: "bg-rose-500" },
                ].map((res, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">{res.label}</span>
                      <span className="text-slate-400 font-mono">{res.info} ({res.val})</span>
                    </div>
                    <div className="w-full h-2 bg-[#1c1f2c] rounded-full overflow-hidden">
                      <div className={`h-full ${res.color} rounded-full`} style={{ width: res.val }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 10: Recent Files Table */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Recent Files & Datasets
                </h3>
                <Link href="/dashboard/files" className="text-xs text-blue-400 hover:underline">View All</Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-[#232736]">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Size</th>
                      <th className="pb-2">Modified</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2230]">
                    {[
                      { name: "fine_tuning_dataset_v2.jsonl", size: "45.2 MB", mod: "10m ago" },
                      { name: "system_architecture_diagram.pdf", size: "3.8 MB", mod: "2h ago" },
                      { name: "vector_embeddings_index.bin", size: "210.5 MB", mod: "5h ago" },
                      { name: "security_compliance_report.docx", size: "1.2 MB", mod: "1d ago" },
                    ].map((f, idx) => (
                      <tr key={idx} className="hover:bg-[#191c28]">
                        <td className="py-2.5 font-medium text-white truncate max-w-[150px]">{f.name}</td>
                        <td className="py-2.5 text-slate-400 font-mono">{f.size}</td>
                        <td className="py-2.5 text-slate-400 font-mono">{f.mod}</td>
                        <td className="py-2.5 text-right">
                          <button className="text-slate-400 hover:text-white p-1">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 11 & 12: CALENDAR & PRODUCTIVITY SCORE */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section 11: Calendar & Upcoming Events */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Calendar className="w-4 h-4 text-purple-400" /> Mini Calendar & Upcoming Events
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Mini Calendar graphic */}
                <div className="bg-[#181a24] border border-[#242838] p-3 rounded-xl text-center flex-1">
                  <div className="font-bold text-xs text-white mb-2">July 2026</div>
                  <div className="grid grid-cols-7 gap-1 text-[10px] font-mono text-slate-400">
                    <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <div
                        key={d}
                        className={`p-1 rounded ${d === 24 ? "bg-blue-600 font-bold text-white" : "hover:bg-[#232736]"}`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming List */}
                <div className="flex-1 flex flex-col gap-2.5 text-xs">
                  <div className="p-2.5 bg-[#181a24] border border-[#242838] rounded-xl flex flex-col">
                    <span className="font-semibold text-white">📅 AI Architecture Review</span>
                    <span className="text-[10px] text-slate-400">Today at 15:00 • Google Meet</span>
                  </div>
                  <div className="p-2.5 bg-[#181a24] border border-[#242838] rounded-xl flex flex-col">
                    <span className="font-semibold text-white">⚙️ Scheduled Fine-tuning Job</span>
                    <span className="text-[10px] text-slate-400">Tonight at 23:00 • GPU Cluster</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: Productivity Score & Progress */}
            <section className="bg-[#14161f] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Productivity Score & Progress
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Optimal</span>
              </div>

              <div className="flex items-center justify-around gap-4">
                {/* Circular Score Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#202434]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray="94, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-white">94</span>
                    <span className="text-[9px] text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* Score Breakdown Sub-metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs w-full">
                  <div className="p-2 bg-[#181a24] rounded-xl border border-[#242838]">
                    <span className="text-slate-400 text-[10px]">Completed Tasks</span>
                    <div className="font-bold text-white text-sm">342</div>
                  </div>
                  <div className="p-2 bg-[#181a24] rounded-xl border border-[#242838]">
                    <span className="text-slate-400 text-[10px]">Pending Tasks</span>
                    <div className="font-bold text-amber-400 text-sm">18</div>
                  </div>
                  <div className="p-2 bg-[#181a24] rounded-xl border border-[#242838]">
                    <span className="text-slate-400 text-[10px]">Automation Saved</span>
                    <div className="font-bold text-emerald-400 text-sm">124 hrs/wk</div>
                  </div>
                  <div className="p-2 bg-[#181a24] rounded-xl border border-[#242838]">
                    <span className="text-slate-400 text-[10px]">AI Efficiency</span>
                    <div className="font-bold text-blue-400 text-sm">99.4%</div>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE PANEL (STICKY DESKTOP COLUMN WITH INDEPENDENT SCROLLBAR) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-6 w-full sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Today's Summary Widget */}
          <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Today's Summary
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center bg-[#181a24] p-2.5 rounded-xl">
                <span className="text-slate-400">Workspace Health</span>
                <span className="text-emerald-400 font-bold">99.98%</span>
              </div>
              <div className="flex justify-between items-center bg-[#181a24] p-2.5 rounded-xl">
                <span className="text-slate-400">Active Workers</span>
                <span className="text-white font-bold">4 Running</span>
              </div>
              <div className="flex justify-between items-center bg-[#181a24] p-2.5 rounded-xl">
                <span className="text-slate-400">Credits Remaining</span>
                <span className="text-purple-400 font-bold">$4,850.00</span>
              </div>
            </div>
          </div>

          {/* Running Agents Mini List */}
          <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-emerald-400" /> Active Agents</span>
              <span className="text-[10px] text-emerald-400 font-mono">3 Online</span>
            </h4>
            <div className="flex flex-col gap-2">
              {agents.filter(a => a.running).map(a => (
                <div key={a.id} className="p-2.5 bg-[#181a24] rounded-xl border border-[#242838] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-semibold text-white">{a.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{a.cpu} CPU</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Interactive Checklist */}
          <div className="bg-[#14161f] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Pending Tasks</span>
              <span className="text-[10px] text-slate-400 font-mono">{pendingTasks.filter(t => !t.done).length} Remaining</span>
            </h4>
            <div className="flex flex-col gap-2">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-all cursor-pointer select-none ${
                    t.done ? "bg-[#12141c] border-[#1e2230] text-slate-500 line-through" : "bg-[#181a24] border-[#242838] text-slate-200 hover:border-[#353b52]"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    t.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-500"
                  }`}>
                    {t.done && <Check className="w-3 h-3" />}
                  </div>
                  <span className="leading-tight">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights & Optimization Suggestions */}
          <div className="bg-gradient-to-b from-[#1b172a] to-[#14161f] border border-purple-500/30 rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 border-b border-purple-500/20 pb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Suggestions & Insights
            </h4>
            <div className="p-3 bg-[#131120] border border-purple-500/20 rounded-xl flex flex-col gap-1 text-xs">
              <span className="font-bold text-white flex items-center gap-1">💡 Cost Savings Recommendation</span>
              <p className="text-slate-300 text-[11px]">
                Switch background summary tasks to <span className="text-purple-300 font-mono font-semibold">GPT-4o-mini</span> to save ~$140/month without accuracy degradation.
              </p>
              <button className="mt-2 text-[11px] font-semibold text-purple-400 hover:underline text-left">
                Apply Auto-Routing Rule →
              </button>
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}


