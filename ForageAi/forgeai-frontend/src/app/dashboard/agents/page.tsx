"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Bot,
  Sparkles,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Play,
  Square,
  RotateCcw,
  Edit3,
  Copy,
  Trash2,
  Share2,
  Download,
  Star,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  HardDrive,
  BarChart3,
  TrendingUp,
  Database,
  Globe,
  Code2,
  Mail,
  Calendar,
  FileText,
  ShieldCheck,
  Zap,
  Users,
  Eye,
  ChevronDown,
  X,
  Upload,
  Activity,
  Sliders,
  Layers,
  ExternalLink,
} from "lucide-react"

export default function AIAgentsPage() {
  // Navigation Tabs State
  const [activeSection, setActiveSection] = useState<
    "all" | "my" | "marketplace" | "create" | "analytics" | "logs" | "memory" | "settings"
  >("all")

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [modelFilter, setModelFilter] = useState("All Models")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [sortOrder, setSortOrder] = useState("Most Active")

  // Wizard State (Step 1 to 5)
  const [wizardStep, setWizardStep] = useState(1)
  const [newAgentData, setNewAgentData] = useState({
    name: "",
    desc: "",
    category: "Development",
    avatar: "🤖",
    model: "Claude 3.5 Sonnet",
    instructions: "You are an expert autonomous AI software engineer...",
    memoryEnabled: true,
    contextLength: "128k",
    tools: ["Code Execution", "Database Access", "Browser Crawling"],
  })

  // Demo Agent List (Section 1 & 2)
  const [agents, setAgents] = useState([
    {
      id: "ag-1",
      name: "DevOps Copilot Alpha",
      avatar: "🚀",
      desc: "Monitors Kubernetes pod metrics, auto-scales clusters, & resolves CI/CD pipeline failures.",
      model: "Claude 3.5 Sonnet",
      status: "Active",
      lastRun: "2m ago",
      tasks: 1420,
      successRate: "99.4%",
      tokens: "18.4M",
      owner: "Tharun",
      created: "2026-06-15",
      visibility: "Team",
      running: true,
    },
    {
      id: "ag-2",
      name: "Data Synthesizer Pro",
      avatar: "⚡",
      desc: "Generates high-quality synthetic RLHF training dataset pairs for fine-tuning LLMs.",
      model: "GPT-4o",
      status: "Active",
      lastRun: "14m ago",
      tasks: 890,
      successRate: "98.8%",
      tokens: "42.1M",
      owner: "Tharun",
      created: "2026-07-01",
      visibility: "Public",
      running: true,
    },
    {
      id: "ag-3",
      name: "Security Vulnerability Auditor",
      avatar: "🛡️",
      desc: "Scans Git repos for hardcoded API keys, OWASP top 10 risks & dependency vulnerabilities.",
      model: "DeepSeek V3",
      status: "Idle",
      lastRun: "2h ago",
      tasks: 340,
      successRate: "100%",
      tokens: "6.2M",
      owner: "Alex D.",
      created: "2026-05-10",
      visibility: "Private",
      running: false,
    },
    {
      id: "ag-4",
      name: "Customer Support Agent v2",
      avatar: "🎧",
      desc: "Automates multi-turn customer inquiries, ticket triage, & refund approvals.",
      model: "Llama 3.1 70B",
      status: "Training",
      lastRun: "1d ago",
      tasks: 5210,
      successRate: "97.5%",
      tokens: "89.0M",
      owner: "Sarah K.",
      created: "2026-04-20",
      visibility: "Team",
      running: false,
    },
    {
      id: "ag-5",
      name: "RAG Vector Ingestion Worker",
      avatar: "📚",
      desc: "Indexes PDF documents, web pages, and markdown files into Qdrant & Pinecone vector stores.",
      model: "Gemini 1.5 Pro",
      status: "Active",
      lastRun: "45m ago",
      tasks: 2150,
      successRate: "99.1%",
      tokens: "31.5M",
      owner: "Tharun",
      created: "2026-07-10",
      visibility: "Team",
      running: true,
    },
    {
      id: "ag-6",
      name: "Market Intelligence Crawler",
      avatar: "🌐",
      desc: "Crawls competitor pricing pages, news API feeds, & social sentiment daily.",
      model: "GPT-4o-mini",
      status: "Offline",
      lastRun: "3d ago",
      tasks: 120,
      successRate: "92.0%",
      tokens: "1.8M",
      owner: "Marcus V.",
      created: "2026-07-18",
      visibility: "Private",
      running: false,
    },
  ])

  // Marketplace Pre-built Agents (Section 3)
  const marketplaceAgents = [
    {
      name: "Full-Stack Code Auditor",
      category: "Development",
      creator: "ForgeAI Labs",
      downloads: "14.2k",
      rating: 4.9,
      desc: "Automated PR code reviewer with inline GitHub comments & AST static analysis.",
      avatar: "👨‍💻",
    },
    {
      name: "24/7 Zendesk Support Bot",
      category: "Customer Support",
      creator: "Acme AI",
      downloads: "8.5k",
      rating: 4.8,
      desc: "Resolves customer support tickets with grounding in your Knowledge Base docs.",
      avatar: "💬",
    },
    {
      name: "SEO Content Generator",
      category: "Marketing",
      creator: "GrowthHacker Pro",
      downloads: "22.1k",
      rating: 4.7,
      desc: "Generates long-form SEO blog posts with target keywords & meta tags.",
      avatar: "✍️",
    },
    {
      name: "Financial Data Extractor",
      category: "Finance",
      creator: "FinTech AI",
      downloads: "6.1k",
      rating: 4.9,
      desc: "Parses PDF invoices, balance sheets & bank statements into structured CSV/JSON.",
      avatar: "📊",
    },
  ]

  // Logs Data (Section 6)
  const agentLogs = [
    { time: "18:48:12", agent: "DevOps Copilot Alpha", action: "Executed Pod Auto-Scaler script", status: "SUCCESS", duration: "1.2s", user: "System Cron" },
    { time: "18:32:05", agent: "Data Synthesizer Pro", action: "Generated 5,000 synthetic pairs", status: "SUCCESS", duration: "45.0s", user: "Tharun" },
    { time: "17:15:40", agent: "Security Vulnerability Auditor", action: "Scanned github.com/forgeai/core", status: "WARNING", duration: "12.4s", user: "Alex D." },
    { time: "16:02:11", agent: "RAG Vector Ingestion Worker", action: "Chunked & embedded 12 PDFs", status: "SUCCESS", duration: "8.7s", user: "Tharun" },
  ]

  // Toggle Agent Run/Pause Status
  const toggleAgentRunning = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const nextRunning = !a.running
        return {
          ...a,
          running: nextRunning,
          status: nextRunning ? "Active" : "Idle",
        }
      }
      return a
    }))
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Agents Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Build, deploy, monitor and manage intelligent AI agents from a centralized workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveSection("create")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Agent</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FILTER & CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
          {[
            { id: "all", label: "All Agents", count: agents.length },
            { id: "my", label: "My Agents", count: agents.filter(a => a.owner === "Tharun").length },
            { id: "marketplace", label: "Marketplace", count: marketplaceAgents.length },
            { id: "create", label: "Agent Wizard", count: null },
            { id: "analytics", label: "Analytics", count: null },
            { id: "logs", label: "Logs", count: agentLogs.length },
            { id: "memory", label: "Memory", count: null },
            { id: "settings", label: "Settings", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
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

        {/* Search & Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          
          {/* Search Box */}
          <div className="relative flex-1 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option>All Models</option>
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4o</option>
            <option>DeepSeek V3</option>
            <option>Llama 3.1 70B</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Idle</option>
            <option>Training</option>
            <option>Offline</option>
          </select>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY: SECTIONS 1-8 + RIGHT SIDEBAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (SECTIONS 1 TO 8) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* SECTION 1: ALL AGENTS GRID */}
          {/* ========================================================================= */}
          {activeSection === "all" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents
                .filter(a => searchQuery === "" || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(a => statusFilter === "All Statuses" || a.status === statusFilter)
                .filter(a => modelFilter === "All Models" || a.model === modelFilter)
                .map((ag) => (
                  <div key={ag.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-[#333a50] rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Header: Avatar, Name, Status Pill */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {ag.avatar}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight leading-tight">{ag.name}</h3>
                          <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3" /> {ag.model}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                        ag.status === "Active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        ag.status === "Idle" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        ag.status === "Training" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                        "bg-slate-500/10 border-slate-500/30 text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ag.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`}></span>
                        {ag.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      {ag.desc}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 text-[10px] font-mono border-y border-[#232736] py-2 text-slate-400">
                      <div><span className="block text-slate-500">LAST RUN</span><span className="text-white font-bold">{ag.lastRun}</span></div>
                      <div><span className="block text-slate-500">TASKS</span><span className="text-white font-bold">{ag.tasks}</span></div>
                      <div><span className="block text-slate-500 font-normal">SUCCESS</span><span className="text-emerald-400 font-bold">{ag.successRate}</span></div>
                      <div><span className="block text-slate-500">TOKENS</span><span className="text-purple-300 font-bold">{ag.tokens}</span></div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAgentRunning(ag.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            ag.running ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {ag.running ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                          <span>{ag.running ? "Pause" : "Run"}</span>
                        </button>

                        <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 p-2 rounded-xl transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 p-2 rounded-xl transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="bg-[#181a26] hover:bg-rose-500/20 border border-[#2d3248] text-rose-400 p-2 rounded-xl transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: MY AGENTS */}
          {/* ========================================================================= */}
          {activeSection === "my" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.owner === "Tharun").map((ag) => (
                <div key={ag.id} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2232] text-xl flex items-center justify-center">{ag.avatar}</div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{ag.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Created {ag.created} • Owner: {ag.owner}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      {ag.visibility}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">{ag.desc}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                    <button className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" /> Manage
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white"><Share2 className="w-3.5 h-3.5" /></button>
                      <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: MARKETPLACE */}
          {/* ========================================================================= */}
          {activeSection === "marketplace" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
                {["All Categories", "Development", "Customer Support", "Marketing", "Finance", "HR", "Cyber Security"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${categoryFilter === c ? "bg-purple-600 text-white font-bold" : "bg-[#141620] text-slate-400 hover:text-white"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplaceAgents
                  .filter(m => categoryFilter === "All Categories" || m.category === categoryFilter)
                  .map((m, idx) => (
                    <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md hover:border-[#383f58] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#1e2232] text-2xl flex items-center justify-center">{m.avatar}</div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{m.name}</h3>
                            <span className="text-[11px] text-slate-400 font-mono">By {m.creator}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Star className="w-3 h-3 fill-current" /> {m.rating}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">{m.desc}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">{m.downloads} installs</span>
                        <div className="flex items-center gap-2">
                          <button className="bg-[#181a26] border border-[#2d3248] text-slate-200 font-semibold px-3 py-1.5 rounded-xl hover:text-white">Preview</button>
                          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-md">Install</button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: CREATE AGENT (MULTI-STEP WIZARD) */}
          {/* ========================================================================= */}
          {activeSection === "create" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              
              {/* Wizard Steps Indicator */}
              <div className="flex items-center justify-between border-b border-[#232736] pb-4">
                {[
                  { step: 1, label: "Basic Info" },
                  { step: 2, label: "AI Model" },
                  { step: 3, label: "System Prompt" },
                  { step: 4, label: "Tools" },
                  { step: 5, label: "Review" },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setWizardStep(s.step)}
                    className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                      wizardStep === s.step ? "text-purple-400" : wizardStep > s.step ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      wizardStep === s.step ? "bg-purple-600 text-white" : wizardStep > s.step ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#1c1f2e] text-slate-400"
                    }`}>
                      {wizardStep > s.step ? "✓" : s.step}
                    </span>
                    <span className="hidden md:inline">{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4 text-xs">
                  <h3 className="text-sm font-bold text-white">Step 1: Basic Agent Profile</h3>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold">Agent Name</label>
                    <input
                      type="text"
                      value={newAgentData.name}
                      onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
                      placeholder="e.g. DevOps Auto-Scaler Bot"
                      className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold">Description</label>
                    <textarea
                      rows={3}
                      value={newAgentData.desc}
                      onChange={(e) => setNewAgentData({ ...newAgentData, desc: e.target.value })}
                      placeholder="What does this agent do?"
                      className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: AI Model Selection */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4 text-xs">
                  <h3 className="text-sm font-bold text-white">Step 2: Select Foundation Model</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Claude 3.5 Sonnet", "GPT-4o", "Gemini 1.5 Pro", "Grok 2", "Ollama / Llama 3", "Custom Fine-Tune"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setNewAgentData({ ...newAgentData, model: m })}
                        className={`p-4 rounded-xl border flex flex-col items-start text-left gap-1 transition-all cursor-pointer ${
                          newAgentData.model === m ? "bg-purple-600/20 border-purple-500 text-white font-bold" : "bg-[#0d0e14] border-[#262a3c] text-slate-400 hover:text-white"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: System Instructions */}
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4 text-xs">
                  <h3 className="text-sm font-bold text-white">Step 3: System Prompt & Instructions</h3>
                  <textarea
                    rows={6}
                    value={newAgentData.instructions}
                    onChange={(e) => setNewAgentData({ ...newAgentData, instructions: e.target.value })}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Step 4: Tools Enabled */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4 text-xs">
                  <h3 className="text-sm font-bold text-white">Step 4: Enable Agent Capabilities & Tools</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Browser Crawling", icon: Globe },
                      { name: "Code Execution", icon: Code2 },
                      { name: "Database Access", icon: Database },
                      { name: "Email Sending", icon: Mail },
                      { name: "Calendar Scheduling", icon: Calendar },
                      { name: "API Access", icon: Zap },
                      { name: "File Reader", icon: FileText },
                      { name: "Security Sandbox", icon: ShieldCheck },
                    ].map((t) => {
                      const Icon = t.icon
                      const enabled = newAgentData.tools.includes(t.name)
                      return (
                        <button
                          key={t.name}
                          onClick={() => {
                            const nextTools = enabled
                              ? newAgentData.tools.filter(x => x !== t.name)
                              : [...newAgentData.tools, t.name]
                            setNewAgentData({ ...newAgentData, tools: nextTools })
                          }}
                          className={`p-3.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                            enabled ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold" : "bg-[#0d0e14] border-[#262a3c] text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{t.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Deploy */}
              {wizardStep === 5 && (
                <div className="flex flex-col gap-4 text-xs bg-[#0d0e14] p-4 rounded-xl border border-[#262a3c]">
                  <h3 className="text-sm font-bold text-white">Step 5: Review & Deploy Agent</h3>
                  <div className="flex flex-col gap-2 font-mono text-slate-300">
                    <div>Name: <span className="text-white font-bold">{newAgentData.name || "DevOps Auto-Scaler"}</span></div>
                    <div>Model: <span className="text-purple-400 font-bold">{newAgentData.model}</span></div>
                    <div>Tools Enabled: <span className="text-emerald-400">{newAgentData.tools.join(", ")}</span></div>
                  </div>
                  <button
                    onClick={() => {
                      setAgents([
                        {
                          id: `ag-${Date.now()}`,
                          name: newAgentData.name || "New Custom Agent",
                          avatar: "🤖",
                          desc: newAgentData.desc || "Custom deployment agent",
                          model: newAgentData.model,
                          status: "Active",
                          lastRun: "Just now",
                          tasks: 0,
                          successRate: "100%",
                          tokens: "0k",
                          owner: "Tharun",
                          created: "2026-07-24",
                          visibility: "Private",
                          running: true,
                        },
                        ...agents,
                      ])
                      setActiveSection("all")
                    }}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 cursor-pointer text-center"
                  >
                    🚀 Deploy Agent to Production
                  </button>
                </div>
              )}

              {/* Wizard Nav Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(prev => prev - 1)}
                  className="bg-[#181a26] border border-[#2d3248] text-slate-300 font-bold px-4 py-2 rounded-xl text-xs disabled:opacity-50"
                >
                  Back
                </button>
                {wizardStep < 5 && (
                  <button
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className="bg-purple-600 text-white font-bold px-5 py-2 rounded-xl text-xs"
                  >
                    Next Step →
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: AGENT ANALYTICS */}
          {/* ========================================================================= */}
          {activeSection === "analytics" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Total Runs</span>
                  <h4 className="text-2xl font-bold text-white mt-1">14,290</h4>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Success Rate</span>
                  <h4 className="text-2xl font-bold text-emerald-400 mt-1">99.4%</h4>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400 font-normal">Avg Latency</span>
                  <h4 className="text-2xl font-bold text-blue-400 mt-1">1.2s</h4>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Total Cost</span>
                  <h4 className="text-2xl font-bold text-purple-400 mt-1">$412.50</h4>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-[#141620] border border-[#232736] p-6 rounded-2xl flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Daily Execution Performance
                </h4>
                <div className="w-full h-40 bg-[#0d0e14] rounded-xl border border-[#232736] relative flex items-end p-4 gap-2">
                  {[40, 65, 80, 55, 90, 70, 95, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: AGENT LOGS TABLE */}
          {/* ========================================================================= */}
          {activeSection === "logs" && (
            <div className="bg-[#141620] border border-[#232736] p-6 rounded-2xl shadow-md flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Real-time Execution Logs
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-[#232736]">
                      <th className="pb-2">TIME</th>
                      <th className="pb-2">AGENT</th>
                      <th className="pb-2">ACTION</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2">DURATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2230]">
                    {agentLogs.map((l, idx) => (
                      <tr key={idx} className="hover:bg-[#191c28]">
                        <td className="py-2.5 text-slate-400">{l.time}</td>
                        <td className="py-2.5 text-white font-bold">{l.agent}</td>
                        <td className="py-2.5 text-slate-300">{l.action}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${l.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">{l.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 7: AGENT MEMORY */}
          {/* ========================================================================= */}
          {activeSection === "memory" && (
            <div className="bg-[#141620] border border-[#232736] p-6 rounded-2xl shadow-md flex flex-col gap-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" /> Long-Term & Context Memory Store
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2 text-xs">
                  <span className="font-bold text-white">Vector Index Memory</span>
                  <span className="text-slate-400">12,450 Document Embeddings (1.2 GB)</span>
                  <div className="w-full h-2 bg-[#1c1f2e] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[65%]"></div>
                  </div>
                </div>

                <div className="p-4 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2 text-xs">
                  <span className="font-bold text-white">Conversation Memory</span>
                  <span className="text-slate-400">128k Tokens Buffer (Active)</span>
                  <div className="w-full h-2 bg-[#1c1f2e] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[40%]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 8: AGENT SETTINGS */}
          {/* ========================================================================= */}
          {activeSection === "settings" && (
            <div className="bg-[#141620] border border-[#232736] p-6 rounded-2xl shadow-md flex flex-col gap-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" /> Agent Environment Settings
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-[#0d0e14] rounded-xl border border-[#232736]">
                  <div>
                    <span className="font-bold text-white block">Auto-Recovery on Crash</span>
                    <span className="text-slate-400 text-[11px]">Restart pods automatically if memory limit is reached</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0d0e14] rounded-xl border border-[#232736]">
                  <div>
                    <span className="font-bold text-white block">API Execution Webhooks</span>
                    <span className="text-slate-400 text-[11px]">Send POST callbacks on task completion</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (STICKY DESKTOP COLUMN) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Active Running Workers */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-emerald-400" /> Active Workers</span>
              <span className="text-[10px] text-emerald-400 font-mono">3 Live</span>
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {agents.filter(a => a.running).map(a => (
                <div key={a.id} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white truncate max-w-[120px]">{a.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">{a.tokens}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks Queue */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Agent Health</span>
              <span className="text-[10px] text-emerald-400 font-mono">99.9% Uptime</span>
            </h4>
            <div className="flex flex-col gap-2 text-xs font-mono text-slate-300">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span>Active Clusters:</span>
                <span className="text-white font-bold">12 Nodes</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span>Deadlocks:</span>
                <span className="text-emerald-400 font-bold">0 Detected</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
