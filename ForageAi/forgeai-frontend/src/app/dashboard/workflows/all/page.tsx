"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Workflow,
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
  Grid,
  List,
  ExternalLink,
  DollarSign,
  Zap,
  MoreVertical,
  CheckSquare,
} from "lucide-react"

export default function AllWorkflowsPage() {
  const router = useRouter()

  // View Mode State (Grid Cards vs Table View)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([])

  // Live Toast & Interactive State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Demo Workflows List State
  const [workflows, setWorkflows] = useState([
    {
      id: "wf-1",
      name: "Stripe Webhook RAG Customer Ingestion Pipeline",
      desc: "Triggers on new customer event, performs vector embedding search in Qdrant, & posts reasoning to Slack.",
      category: "AI & Database",
      owner: "Tharun (Admin)",
      triggerType: "Webhook Event",
      lastRun: "2m ago",
      nextRun: "Real-time",
      status: "Active",
      successRate: "99.8%",
      executions: "12,450 runs",
      runtime: "420ms",
      cost: "$0.004 / run",
      model: "Claude 3.5 Sonnet",
      icon: Radio,
    },
    {
      id: "wf-2",
      name: "GitHub Repository Automated CI/CD & Security Audit",
      desc: "Executes automated Rust unit tests, compiles Next.js 15 standalone bundle, & triggers OWASP secret scanning.",
      category: "DevOps",
      owner: "Marcus V.",
      triggerType: "GitHub Push",
      lastRun: "15m ago",
      nextRun: "On Commit",
      status: "Active",
      successRate: "100%",
      executions: "4,820 runs",
      runtime: "1.2s",
      cost: "$0.002 / run",
      model: "GPT-4o Engine",
      icon: GitBranch,
    },
    {
      id: "wf-3",
      name: "Zendesk Support Ticket Triage & Auto-Reply Bot",
      desc: "Analyzes incoming support email sentiment with LLM reasoning and dispatches resolution steps.",
      category: "AI Support",
      owner: "Alex Developer",
      triggerType: "Email / Webhook",
      lastRun: "1h ago",
      nextRun: "Real-time",
      status: "Active",
      successRate: "99.5%",
      executions: "8,910 runs",
      runtime: "340ms",
      cost: "$0.006 / run",
      model: "Claude 3.5 Sonnet",
      icon: Bot,
    },
    {
      id: "wf-4",
      name: "Weekly Enterprise Revenue & Vector DB Digest",
      desc: "Compiles weekly revenue data, calculates Qdrant vector latency p99 metrics, and exports PDF report.",
      category: "Analytics",
      owner: "Sarah K.",
      triggerType: "Cron Scheduler",
      lastRun: "4d ago",
      nextRun: "in 3d",
      status: "Active",
      successRate: "100%",
      executions: "52 runs",
      runtime: "2.4s",
      cost: "$0.012 / run",
      model: "DeepSeek V3",
      icon: BarChart3,
    },
    {
      id: "wf-5",
      name: "PostgreSQL Database Automated Backup & S3 Sync",
      desc: "Triggers WAL archive snapshot of vector DB and syncs compressed file to AWS S3 storage bucket.",
      category: "Database",
      owner: "Tharun (Admin)",
      triggerType: "Cron (Daily)",
      lastRun: "1d ago",
      nextRun: "Paused",
      status: "Paused",
      successRate: "99.2%",
      executions: "365 runs",
      runtime: "3.1s",
      cost: "$0.001 / run",
      model: "Ollama Local",
      icon: Database,
    },
  ])

  // Category Options
  const categories = [
    "All Categories",
    "AI & Database",
    "DevOps",
    "AI Support",
    "Analytics",
    "Database",
  ]

  // Handle Run Test Run
  const handleTestRun = (name: string) => {
    setToastMessage(`⚡ Triggered manual execution for "${name}"...`)
    setTimeout(() => {
      setToastMessage(`✅ Workflow executed cleanly in 420ms!`)
      setTimeout(() => setToastMessage(null), 3000)
    }, 1000)
  }

  // Handle Duplicate Workflow
  const handleDuplicate = (wf: any) => {
    const duplicated = {
      ...wf,
      id: `wf-${Date.now()}`,
      name: `${wf.name} (Copy)`,
      executions: "0 runs",
      lastRun: "Never",
      status: "Paused",
    }
    setWorkflows([duplicated, ...workflows])
    setToastMessage(`📋 Duplicated workflow "${wf.name}"!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Delete Workflow
  const handleDelete = (id: string, name: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id))
    setToastMessage(`🗑️ Deleted workflow "${name}".`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Export Workflow JSON
  const handleExport = (name: string) => {
    setToastMessage(`📥 Exported workflow JSON spec for "${name}"!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Toggle Pause/Resume
  const togglePause = (id: string) => {
    setWorkflows(prev =>
      prev.map(w => (w.id === id ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w))
    )
  }

  // Bulk Selection Handlers
  const toggleSelectWorkflow = (id: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: string) => {
    if (selectedWorkflows.length === 0) return
    if (action === "delete") {
      setWorkflows(prev => prev.filter(w => !selectedWorkflows.includes(w.id)))
      setToastMessage(`🗑️ Bulk deleted ${selectedWorkflows.length} workflows!`)
    } else if (action === "pause") {
      setWorkflows(prev => prev.map(w => selectedWorkflows.includes(w.id) ? { ...w, status: "Paused" } : w))
      setToastMessage(`⏸️ Bulk paused ${selectedWorkflows.length} workflows!`)
    }
    setSelectedWorkflows([])
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
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">All Enterprise Workflows</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Visual automation, AI agent orchestration pipelines, and live execution triggers across your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => router.push("/dashboard/workflows")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Create Workflow</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Workflow</span>
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
      {/* 4 KPI STAT CARDS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Total Pipelines</span>
            <h3 className="text-xl font-bold text-white">{workflows.length} Workflows</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Workflow className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Active Pipelines</span>
            <h3 className="text-xl font-bold text-emerald-400">
              {workflows.filter(w => w.status === "Active").length} Active
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Total Executions</span>
            <h3 className="text-xl font-bold text-blue-400">26,647 Runs</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 font-sans font-semibold">Avg Success Rate</span>
            <h3 className="text-xl font-bold text-purple-400">99.8%</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BULK ACTIONS TOOLBAR (Appears when items are selected) */}
      {/* ========================================================================= */}
      {selectedWorkflows.length > 0 && (
        <div className="bg-purple-600/90 text-white p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xl animate-fade-in">
          <span>{selectedWorkflows.length} Workflows Selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("pause")}
              className="bg-[#141620] hover:bg-black text-white px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Bulk Pause
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: SEARCH & WORKFLOW CARDS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* SEARCH & CATEGORY FILTER BAR WITH VIEW TOGGLE */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflow by name, model, or category..."
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Selectors & View Mode */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar font-medium">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat ? "bg-purple-600 text-white font-bold" : "bg-[#0d0e14] border border-[#262a3c] text-slate-300 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}

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
          {/* WORKFLOW CARDS GRID VIEW */}
          {/* ========================================================================= */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows
                .filter(w => selectedCategory === "All Categories" || w.category === selectedCategory)
                .filter(w => searchQuery === "" || w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((wf) => {
                  const Icon = wf.icon || Workflow
                  const isSelected = selectedWorkflows.includes(wf.id)
                  return (
                    <div key={wf.id} className={`p-5 bg-[#141620] border ${isSelected ? "border-purple-500 ring-2 ring-purple-500/30" : "border-[#232736] hover:border-purple-500/50"} rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group`}>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectWorkflow(wf.id)}
                            className="rounded border-[#262a3c] bg-[#0d0e14] text-purple-600 cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[150px]">{wf.name}</h3>
                            <span className="text-[10px] text-purple-300 font-mono">{wf.category}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          wf.status === "Active" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                        }`}>
                          {wf.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        {wf.desc}
                      </p>

                      {/* Telemetry Stats */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-400 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Executions:</span>
                          <span className="text-purple-400 font-bold">{wf.executions}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Runtime:</span>
                          <span className="text-emerald-400 font-bold">{wf.runtime}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Cost / Run:</span>
                          <span className="text-amber-400 font-bold">{wf.cost}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">AI Model:</span>
                          <span className="text-blue-400 font-bold">{wf.model.split(" ")[0]}</span>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                        <button
                          onClick={() => handleTestRun(wf.name)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Run</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePause(wf.id)}
                            className="bg-[#181a26] text-slate-300 p-1.5 rounded-xl hover:text-white border border-[#2d3248]"
                            title={wf.status === "Active" ? "Pause" : "Resume"}
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(wf)}
                            className="bg-[#181a26] text-slate-300 p-1.5 rounded-xl hover:text-white border border-[#2d3248]"
                            title="Duplicate Workflow"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleExport(wf.name)}
                            className="bg-[#181a26] text-slate-300 p-1.5 rounded-xl hover:text-white border border-[#2d3248]"
                            title="Export Spec"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(wf.id, wf.name)}
                            className="bg-[#181a26] text-rose-400 p-1.5 rounded-xl hover:bg-rose-600 hover:text-white border border-[#2d3248]"
                            title="Delete Workflow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}
            </div>
          ) : (
            /* WORKFLOW TABLE VIEW */
            <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0d0e14] text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-[#232736]">
                    <th className="p-4">Workflow Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Trigger</th>
                    <th className="p-4">Executions</th>
                    <th className="p-4">Model</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232736]">
                  {workflows.map((wf) => (
                    <tr key={wf.id} className="hover:bg-[#181a26] transition-colors font-mono">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-purple-400" />
                        <span>{wf.name}</span>
                      </td>
                      <td className="p-4 text-purple-300">{wf.category}</td>
                      <td className="p-4 text-slate-300">{wf.triggerType}</td>
                      <td className="p-4 text-emerald-400 font-bold">{wf.executions}</td>
                      <td className="p-4 text-blue-400">{wf.model}</td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => handleTestRun(wf.name)} className="text-purple-400 hover:underline font-bold">Run</button>
                        <button onClick={() => handleDuplicate(wf)} className="text-slate-400 hover:text-white">Duplicate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (WORKFLOW STATISTICS & TOP PIPELINES) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Workflow Statistics */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Workflow className="w-3.5 h-3.5 text-purple-400" /> Workflow Statistics</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Online</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Workflows:</span>
                <span className="text-white font-bold">{workflows.length} Pipelines</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Executions:</span>
                <span className="text-purple-400 font-bold">26,647 runs</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Avg Success Rate:</span>
                <span className="text-emerald-400 font-bold">99.8%</span>
              </div>
            </div>
          </div>

          {/* Top Workflows */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Top Executed Workflows</span>
              <span className="text-[10px] text-slate-400 font-mono">24h</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {workflows.slice(0, 3).map((w, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[150px]">{w.name}</span>
                  <span className="text-purple-400 font-mono text-[10px]">{w.executions}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Actions</span>
              <span className="text-[10px] text-slate-400 font-mono">Shortcuts</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Open Visual Canvas Builder", href: "/dashboard/workflows" },
                { name: "Import n8n / Zapier Workflow", href: "/dashboard/workflows" },
                { name: "Export Workflow JSON Spec", href: "/dashboard/workflows" },
              ].map((qa, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(qa.href)}
                  className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center gap-2 transition-all text-left cursor-pointer font-semibold"
                >
                  <Workflow className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{qa.name}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
