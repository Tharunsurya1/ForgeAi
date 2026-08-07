"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Zap,
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
  Users,
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
  Bell,
} from "lucide-react"

export default function AutomationsPage() {
  const router = useRouter()

  // Navigation Tab State (8 Tabs)
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "paused" | "drafts" | "templates" | "executions" | "history" | "analytics"
  >("all")

  // Category Filter State
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [searchQuery, setSearchQuery] = useState("")
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState(
    "When a customer submits a form, analyze it with AI, save to database, notify Slack, send confirmation email and generate a PDF report."
  )

  // Live Toast & Execution State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

  // Demo Automations List
  const [automations, setAutomations] = useState([
    {
      id: "auto-1",
      name: "Stripe Invoice OCR & QuickBooks Sync",
      desc: "Automatically extracts PDF invoice totals using Claude 3.5 OCR & syncs line items to QuickBooks accounting.",
      trigger: "Cron (Hourly) + Stripe Webhook",
      status: "Active",
      runs: "14,850 runs",
      lastRun: "2m ago",
      nextRun: "in 58m",
      owner: "Tharun (Admin)",
      runtime: "180ms",
      successRate: "99.9%",
      category: "Finance",
      icon: Zap,
    },
    {
      id: "auto-2",
      name: "Customer Support AI Triage & Ticket Router",
      desc: "Reads Zendesk & Email tickets, analyzes urgency with LLM sentiment, and routes high-priority tickets to Slack.",
      trigger: "Email Received / Webhook",
      status: "Active",
      runs: "8,420 runs",
      lastRun: "12m ago",
      nextRun: "Real-time",
      owner: "Alex Developer",
      runtime: "320ms",
      successRate: "99.8%",
      category: "AI Automation",
      icon: Bot,
    },
    {
      id: "auto-3",
      name: "GitHub Repository Vulnerability Scan & Alert",
      desc: "Performs hourly OWASP & secret scanning on core-microservices repo and dispatches security alerts.",
      trigger: "GitHub Event / Webhook",
      status: "Active",
      runs: "1,240 runs",
      lastRun: "45m ago",
      nextRun: "in 15m",
      owner: "Marcus V.",
      runtime: "850ms",
      successRate: "100%",
      category: "DevOps",
      icon: ShieldCheck,
    },
    {
      id: "auto-4",
      name: "Weekly Executive AI Performance Digest",
      desc: "Compiles weekly revenue, vector DB query latencies, & user signups into an executive PDF & sends via Gmail.",
      trigger: "Cron (Weekly on Monday 9 AM)",
      status: "Active",
      runs: "48 runs",
      lastRun: "4d ago",
      nextRun: "in 3d",
      owner: "Sarah K.",
      runtime: "1.4s",
      successRate: "100%",
      category: "Reports",
      icon: BarChart3,
    },
    {
      id: "auto-5",
      name: "PostgreSQL Database Automated Backup & S3 Sync",
      desc: "Triggers midnight WAL archive backup of production vector PostgreSQL DB and pushes compressed file to AWS S3.",
      trigger: "Cron (Daily at 00:00 UTC)",
      status: "Paused",
      runs: "365 runs",
      lastRun: "1d ago",
      nextRun: "Paused",
      owner: "Tharun (Admin)",
      runtime: "2.1s",
      successRate: "99.5%",
      category: "Scheduled Jobs",
      icon: Database,
    },
  ])

  // Handle AI Auto-Building Automation
  const handleAIBuild = () => {
    setIsBuilding(true)
    setToastMessage("🤖 AI Automation Assistant is synthesizing triggers, AI nodes, & integration endpoints...")

    setTimeout(() => {
      setIsBuilding(false)
      const newAuto = {
        id: `auto-${Date.now()}`,
        name: "AI Generated End-to-End Customer Ingestion Pipeline",
        desc: aiAssistantPrompt,
        trigger: "Webhook + AI LLM Decision Node",
        status: "Active",
        runs: "1 run",
        lastRun: "Just now",
        nextRun: "Real-time",
        owner: "Tharun (Admin)",
        runtime: "240ms",
        successRate: "100%",
        category: "AI Automation",
        icon: Sparkles,
      }
      setAutomations([newAuto, ...automations])
      setToastMessage("✨ Automation successfully built & deployed!")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1600)
  }

  // Handle Trigger Manual Run Now
  const handleRunNow = (name: string) => {
    setToastMessage(`⚡ Triggered manual execution for "${name}"...`)
    setTimeout(() => {
      setToastMessage(`✅ Execution completed cleanly in 180ms!`)
      setTimeout(() => setToastMessage(null), 3000)
    }, 1000)
  }

  // Handle Toggle Active/Pause
  const togglePause = (id: string) => {
    setAutomations(prev =>
      prev.map(a => (a.id === id ? { ...a, status: a.status === "Active" ? "Paused" : "Active" } : a))
    )
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
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Automation Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Automate repetitive business tasks, AI workflows and enterprise operations from one unified platform.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleAIBuild}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>+ New Automation</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Automation</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Templates</span>
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
            { id: "all", label: "All Automations", count: automations.length },
            { id: "active", label: "Active", count: automations.filter(a => a.status === "Active").length },
            { id: "paused", label: "Paused", count: automations.filter(a => a.status === "Paused").length },
            { id: "drafts", label: "Drafts", count: 0 },
            { id: "templates", label: "Templates", count: 12 },
            { id: "executions", label: "Live Executions", count: null },
            { id: "history", label: "Run History", count: null },
            { id: "analytics", label: "Analytics", count: null },
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
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: AI ASSISTANT & AUTOMATION CARDS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* AI AUTOMATION ASSISTANT PROMPT BAR */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#232736]">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-purple-400" /> AI Automation Assistant (Natural Language Builder)
              </span>
              <span className="text-[10px] text-purple-300 font-mono font-bold">
                Powered by Claude 3.5 Sonnet
              </span>
            </div>

            {/* Prompt Input Box */}
            <div className="relative">
              <input
                type="text"
                value={aiAssistantPrompt}
                onChange={(e) => setAiAssistantPrompt(e.target.value)}
                placeholder="Describe your automation in natural language..."
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-4 pr-36 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
              <button
                disabled={isBuilding}
                onClick={handleAIBuild}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {isBuilding ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Auto-Build AI</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AUTOMATION CARDS GRID */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automations
              .filter(a => activeTab === "all" || (activeTab === "active" && a.status === "Active") || (activeTab === "paused" && a.status === "Paused"))
              .map((auto) => {
                const Icon = auto.icon || Zap
                return (
                  <div key={auto.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">{auto.name}</h3>
                          <span className="text-[10px] text-purple-300 font-mono">{auto.category}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        auto.status === "Active" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      }`}>
                        {auto.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      {auto.desc}
                    </p>

                    {/* Trigger & Telemetry */}
                    <div className="flex flex-col gap-1.5 text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="text-slate-200 font-bold">{auto.trigger}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Executions:</span>
                        <span className="text-purple-400 font-bold">{auto.runs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="text-emerald-400 font-bold">{auto.successRate}</span>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                      <button
                        onClick={() => handleRunNow(auto.name)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Run Now</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePause(auto.id)}
                          className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"
                          title={auto.status === "Active" ? "Pause" : "Resume"}
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (AUTOMATION HEALTH & QUICK TEMPLATES) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Automation Health */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> Automation Health</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Online</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Running Automations:</span>
                <span className="text-emerald-400 font-bold">28 Active</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Today's Executions:</span>
                <span className="text-purple-400 font-bold">14,250 runs</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">API Calls:</span>
                <span className="text-blue-400 font-bold">124,500</span>
              </div>
            </div>
          </div>

          {/* Automation Templates Grid */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Pre-built Templates</span>
              <span className="text-[10px] text-slate-400 font-mono">1-Click</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Employee Onboarding Pipeline", icon: Users },
                { name: "Invoice OCR & Accounting Sync", icon: FileText },
                { name: "Customer Support AI Triage", icon: Bot },
                { name: "Email Follow-up Automation", icon: Mail },
                { name: "Lead Qualification & CRM Sync", icon: TrendingUp },
              ].map((tmpl, idx) => {
                const Icon = tmpl.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setToastMessage(`Imported template: "${tmpl.name}"`)
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center gap-2 transition-all text-left cursor-pointer font-semibold"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{tmpl.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
