"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BarChart3,
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
  Users,
  Bot,
  Database,
  ShieldCheck,
  Zap,
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
  TerminalSquare,
  DollarSign,
  TrendingUp,
  HardDrive,
  CheckSquare,
  PieChart,
  LineChart,
  Shield,
  Palette,
  FileSpreadsheet,
  FileCheck,
  TrendingDown,
  HelpCircle,
  Maximize2,
  X,
} from "lucide-react"

export default function EnterpriseAnalyticsPage() {
  const router = useRouter()

  // Navigation Tab State (14 Tabs)
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "ai"
    | "projects"
    | "workflows"
    | "models"
    | "documents"
    | "code"
    | "ui"
    | "knowledge"
    | "files"
    | "team"
    | "security"
    | "cost"
    | "reports"
  >("overview")

  // Natural Language AI Search State
  const [nlQuery, setNlQuery] = useState("Show document generation growth during the last 30 days.")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isGeneratingAiInsights, setIsGeneratingAiInsights] = useState(false)

  // Demo Timeframe Filter
  const [timeRange, setTimeRange] = useState("Last 30 Days")

  // Handle Natural Language Query
  const handleNlQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlQuery) return
    setIsGeneratingAiInsights(true)
    setToastMessage(`🧠 AI Engine analyzing workspace telemetry for: "${nlQuery}"...`)

    setTimeout(() => {
      setIsGeneratingAiInsights(false)
      setToastMessage(`✅ Generated custom AI analytics report & charts for "${nlQuery}"!`)
      setTimeout(() => setToastMessage(null), 3500)
    }, 1200)
  }

  // Handle Export Report
  const handleExportReport = (format: string) => {
    setToastMessage(`📥 Exporting Enterprise Analytics report as ${format.toUpperCase()}...`)
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
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Enterprise Analytics Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor performance, AI usage, productivity, and business intelligence across the entire ForgeAI workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#181a26] border border-[#2d3248] text-slate-200 font-semibold text-xs px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer"
          >
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date (2026)</option>
          </select>

          <button
            onClick={() => handleExportReport("pdf")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => handleExportReport("excel")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={() => setToastMessage("⚡ Custom AI Dashboard generated & saved!")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate AI Insights</span>
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
      {/* 14 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "overview", label: "Overview" },
            { id: "ai", label: "AI Analytics" },
            { id: "projects", label: "Projects" },
            { id: "workflows", label: "Workflows" },
            { id: "models", label: "AI Models" },
            { id: "documents", label: "Documents" },
            { id: "code", label: "Code Studio" },
            { id: "ui", label: "UI Studio" },
            { id: "knowledge", label: "Knowledge Base" },
            { id: "files", label: "Files Storage" },
            { id: "team", label: "Team Productivity" },
            { id: "security", label: "Security & Audit" },
            { id: "cost", label: "Cost & Budget" },
            { id: "reports", label: "AI Report Generator" },
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
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NATURAL LANGUAGE AI DASHBOARD QUERY BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> Natural Language AI Business Intelligence Query Engine
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto Dashboard Generation</span>
        </div>

        <form onSubmit={handleNlQuery} className="relative">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder="Ask AI e.g., 'Show document generation growth during the last 30 days'..."
            className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-4 pr-40 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="submit"
            disabled={isGeneratingAiInsights}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            {isGeneratingAiInsights ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>Query AI</span>
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              
              {/* 10 TOP OVERVIEW KPI CARDS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
                {[
                  { label: "Active Users", val: "42 / 48", change: "+12%", color: "text-emerald-400", icon: Users },
                  { label: "Projects", val: "38 Active", change: "+8%", color: "text-purple-400", icon: Folder },
                  { label: "AI Requests", val: "142.5K", change: "+34%", color: "text-blue-400", icon: Sparkles },
                  { label: "Workflows", val: "26.6K Runs", change: "+18%", color: "text-indigo-400", icon: Workflow },
                  { label: "Gen Documents", val: "1,240 Docs", change: "+22%", color: "text-purple-300", icon: FileText },
                  { label: "Gen Code", val: "184.2K Lines", change: "+45%", color: "text-emerald-300", icon: Code2 },
                  { label: "Storage Used", val: "142.5 GB", change: "14.2%", color: "text-amber-400", icon: HardDrive },
                  { label: "Success Rate", val: "99.8%", change: "+0.4%", color: "text-emerald-400", icon: CheckCircle2 },
                  { label: "Monthly Growth", val: "+24.8%", change: "YoY", color: "text-blue-400", icon: TrendingUp },
                  { label: "System Health", val: "99.99%", change: "Optimal", color: "text-emerald-400", icon: Activity },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon
                  return (
                    <div key={idx} className="p-3.5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-2 shadow-md">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] font-sans">
                        <span>{kpi.label}</span>
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className={`text-base font-bold ${kpi.color}`}>{kpi.val}</h3>
                        <span className="text-[9px] text-slate-400">{kpi.change}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* OVERVIEW CHARTS ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* AI Requests & Token Consumption Trend Chart Mockup */}
                <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-purple-400" /> AI Requests & Token Velocity Trend
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">+34% vs Last Month</span>
                  </div>

                  <div className="h-44 w-full bg-[#0d0e14] rounded-xl border border-[#232736] p-4 flex items-end justify-between gap-2 font-mono text-[10px]">
                    {[35, 48, 62, 55, 78, 92, 110, 142.5].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-md group-hover:from-purple-500 group-hover:to-blue-400 transition-all" style={{ height: `${(h / 142.5) * 100}%` }} />
                        <span className="text-slate-500 text-[9px]">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow & Code Studio Performance Distribution */}
                <div className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-blue-400" /> Module Resource Distribution
                    </h3>
                    <span className="text-[10px] text-purple-300 font-mono font-bold">100% Balanced</span>
                  </div>

                  <div className="flex flex-col gap-2 font-mono text-xs">
                    {[
                      { name: "Code Studio Generation", pct: 35, color: "bg-purple-500" },
                      { name: "AI Workflows & Agents", pct: 28, color: "bg-blue-500" },
                      { name: "UI Studio Components", pct: 20, color: "bg-indigo-500" },
                      { name: "Document Generation", pct: 17, color: "bg-emerald-500" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-white font-bold">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-[#0d0e14] h-2 rounded-full overflow-hidden border border-[#232736]">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AI ANALYTICS */}
          {/* ========================================================================= */}
          {activeTab === "ai" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Usage Telemetry & Cost Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px]">Total AI Prompts:</span>
                  <h4 className="text-lg font-bold text-purple-400">142,500 Prompts</h4>
                </div>
                <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px]">Total Tokens Consumed:</span>
                  <h4 className="text-lg font-bold text-blue-400">14.2M Tokens</h4>
                </div>
                <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-1">
                  <span className="text-slate-400 text-[10px]">Avg Response Time:</span>
                  <h4 className="text-lg font-bold text-emerald-400">340ms</h4>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: AI MODELS ANALYTICS */}
          {/* ========================================================================= */}
          {activeTab === "models" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {[
                { name: "Claude 3.5 Sonnet", usage: "48.2%", avgTime: "290ms", tokens: "6.8M", score: "99.4%" },
                { name: "GPT-4o Engine", usage: "32.5%", avgTime: "340ms", tokens: "4.6M", score: "98.8%" },
                { name: "DeepSeek V3", usage: "12.1%", avgTime: "180ms", tokens: "1.8M", score: "99.1%" },
                { name: "Ollama Local Hardware", usage: "7.2%", avgTime: "120ms", tokens: "1.0M", score: "100%" },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-3 shadow-md">
                  <div className="flex justify-between border-b border-[#232736] pb-2">
                    <span className="font-bold text-white">{m.name}</span>
                    <span className="text-purple-400 font-bold">{m.usage} Share</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 bg-[#0d0e14] p-2.5 rounded-xl border border-[#232736]">
                    <div><span>Avg Latency:</span><span className="text-emerald-400 block font-bold">{m.avgTime}</span></div>
                    <div><span>Tokens:</span><span className="text-blue-400 block font-bold">{m.tokens}</span></div>
                    <div><span>Accuracy:</span><span className="text-purple-300 block font-bold">{m.score}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 13: COST & BUDGET ANALYTICS */}
          {/* ========================================================================= */}
          {activeTab === "cost" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs font-mono">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Enterprise Monthly Cost Breakdown & Forecast
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#0d0e14] rounded-xl border border-[#232736]"><span>AI LLM Tokens Cost:</span><h4 className="text-base font-bold text-emerald-400 mt-1">$28.40</h4></div>
                <div className="p-3.5 bg-[#0d0e14] rounded-xl border border-[#232736]"><span>Qdrant Vector DB:</span><h4 className="text-base font-bold text-purple-400 mt-1">$8.20</h4></div>
                <div className="p-3.5 bg-[#0d0e14] rounded-xl border border-[#232736]"><span>AWS S3 & Cloud Storage:</span><h4 className="text-base font-bold text-blue-400 mt-1">$6.20</h4></div>
                <div className="p-3.5 bg-[#0d0e14] rounded-xl border border-[#232736]"><span>Total Monthly Bill:</span><h4 className="text-base font-bold text-white mt-1">$42.80</h4></div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR: WORKSPACE HEALTH & ALERTS */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Workspace Telemetry */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-purple-400" /> Infrastructure Health</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Online</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">CPU Usage:</span>
                <span className="text-emerald-400 font-bold">14% Optimal</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Memory Allocation:</span>
                <span className="text-purple-400 font-bold">512 MB / 8 GB</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Storage Used:</span>
                <span className="text-blue-400 font-bold">142.5 GB / 1 TB</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Network IO:</span>
                <span className="text-amber-400 font-bold">1.2 Gbps</span>
              </div>
            </div>
          </div>

          {/* AI Providers Status */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-emerald-400" /> AI Gateway Status</span>
              <span className="text-[10px] text-slate-400 font-mono">Live API</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              {[
                { name: "Anthropic Claude API", status: "Operational 🟢" },
                { name: "OpenAI GPT-4o API", status: "Operational 🟢" },
                { name: "DeepSeek V3 API", status: "Operational 🟢" },
                { name: "Qdrant Vector Cluster", status: "Operational 🟢" },
              ].map((prov, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold">{prov.name}</span>
                  <span className="text-emerald-400">{prov.status}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
