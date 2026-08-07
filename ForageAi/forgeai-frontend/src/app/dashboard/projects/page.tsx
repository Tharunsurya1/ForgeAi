"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Folder,
  Sparkles,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Kanban,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Bot,
  BarChart3,
  TrendingUp,
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  Share2,
  Download,
  FileText,
  Code2,
  Database,
  Workflow,
  Zap,
  Star,
  Check,
  X,
  Upload,
  Activity,
  Sliders,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Layers,
  LayoutGrid,
} from "lucide-react"

export default function ProjectsPage() {
  const router = useRouter()

  // Active View Tab State
  const [activeTab, setActiveTab] = useState<
    "grid" | "my" | "starred" | "kanban" | "timeline" | "tasks" | "templates" | "analytics"
  >("grid")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [priorityFilter, setPriorityFilter] = useState("All Priorities")

  // Demo Projects Data
  const [projects, setProjects] = useState([
    {
      id: "proj-1",
      name: "Neural Engine v3",
      icon: "🧠",
      desc: "Distributed microservice cluster for ultra-low latency LLM inference & RAG vector search.",
      owner: "Tharun",
      team: ["AD", "SK", "MV"],
      priority: "Urgent",
      status: "Active",
      progress: 92,
      created: "2026-06-01",
      dueDate: "2026-08-15",
      model: "Claude 3.5 Sonnet",
      agents: ["Crawler-Bot Alpha", "Data Synthesizer"],
      starred: true,
      category: "AI Application",
    },
    {
      id: "proj-2",
      name: "Automated Support Agent Hub",
      icon: "🎧",
      desc: "24/7 customer support bot integrated with Zendesk, Slack, & Intercom webhooks.",
      owner: "Sarah K.",
      team: ["SK", "AD"],
      priority: "High",
      status: "Deploying",
      progress: 78,
      created: "2026-06-15",
      dueDate: "2026-08-01",
      model: "GPT-4o",
      agents: ["DevOps Copilot"],
      starred: true,
      category: "Automation",
    },
    {
      id: "proj-3",
      name: "Vector DB Pipeline (10M Vectors)",
      icon: "⚡",
      desc: "Qdrant & Pinecone indexing pipeline with automatic document chunking & embeddings.",
      owner: "Alex D.",
      team: ["AD", "MV"],
      priority: "High",
      status: "Active",
      progress: 64,
      created: "2026-07-01",
      dueDate: "2026-08-20",
      model: "DeepSeek V3",
      agents: ["RAG Ingestion Worker"],
      starred: false,
      category: "Data Science",
    },
    {
      id: "proj-4",
      name: "Vision OCR Document Processor",
      icon: "👁️",
      desc: "Extracts structured financial JSON schema from scanned invoices & PDF contracts.",
      owner: "Tharun",
      team: ["TH", "SK"],
      priority: "Medium",
      status: "Completed",
      progress: 100,
      created: "2026-05-10",
      dueDate: "2026-07-15",
      model: "Gemini 1.5 Pro",
      agents: ["OCR Extractor"],
      starred: false,
      category: "Software Development",
    },
    {
      id: "proj-5",
      name: "CodeRefactor Bot (Rust & TS)",
      icon: "🛠️",
      desc: "Automated PR reviewer scanning codebases for async deadlocks & memory leaks.",
      owner: "Marcus V.",
      team: ["MV", "AD", "TH"],
      priority: "Medium",
      status: "Paused",
      progress: 45,
      created: "2026-06-20",
      dueDate: "2026-09-01",
      model: "Claude 3.5 Sonnet",
      agents: ["Security Auditor"],
      starred: false,
      category: "Cyber Security",
    },
  ])

  // Tasks List Data for Kanban / Table View
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Optimize HNSW index vector search latency", column: "In Progress", priority: "Urgent", assignee: "Tharun", due: "Today", aiAssist: "GPT-4o Copilot" },
    { id: "t2", title: "Configure Kubernetes auto-scaler metrics server", column: "To Do", priority: "High", assignee: "Alex D.", due: "Tomorrow", aiAssist: "Claude 3.5 Sonnet" },
    { id: "t3", title: "Audit OWASP vulnerabilities on auth-service", column: "Testing", priority: "High", assignee: "Marcus V.", due: "Jul 26", aiAssist: "Security Auditor Bot" },
    { id: "t4", title: "Setup fine-tuning dataset pipeline v3", column: "Completed", priority: "Medium", assignee: "Sarah K.", due: "Jul 20", aiAssist: "Data Synthesizer" },
    { id: "t5", title: "Implement Stripe webhook idempotent handler", column: "Backlog", priority: "Medium", assignee: "Tharun", due: "Jul 30", aiAssist: "None" },
    { id: "t6", title: "Draft API documentation & OpenAPI specs", column: "Review", priority: "Low", assignee: "Alex D.", due: "Jul 28", aiAssist: "GPT-4o" },
  ])

  // Toggle Project Star Status
  const toggleStar = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p))
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Projects Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage AI projects, collaborate with your team, track progress and organize every resource from one intelligent workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Import Project</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: KPI OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Projects", val: "14", color: "text-white", icon: Folder },
          { label: "Active Projects", val: "8", color: "text-emerald-400", icon: Play },
          { label: "Completed", val: "5", color: "text-blue-400", icon: CheckCircle2 },
          { label: "Overdue", val: "1", color: "text-rose-400", icon: AlertCircle },
          { label: "Team Members", val: "12", color: "text-purple-400", icon: Users },
          { label: "AI Workers", val: "9 Live", color: "text-amber-400", icon: Bot },
        ].map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div key={idx} className="bg-[#141620] border border-[#232736] p-4 rounded-2xl flex flex-col gap-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>{kpi.label}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <h4 className={`text-xl font-extrabold mt-1 ${kpi.color}`}>{kpi.val}</h4>
            </div>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* TABS & VIEWS CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar text-xs font-semibold">
          {[
            { id: "grid", label: "All Projects", icon: LayoutGrid },
            { id: "my", label: "My Projects", icon: Folder },
            { id: "starred", label: "Starred", icon: Star },
            { id: "kanban", label: "Kanban Board", icon: Kanban },
            { id: "timeline", label: "Gantt Timeline", icon: Calendar },
            { id: "tasks", label: "Tasks Table", icon: List },
            { id: "templates", label: "Templates", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="relative flex-1 lg:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Deploying</option>
            <option>Completed</option>
            <option>Paused</option>
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN CONTENT COLUMN */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* SECTION 2: PROJECT CARDS GRID */}
          {/* ========================================================================= */}
          {(activeTab === "grid" || activeTab === "my" || activeTab === "starred") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects
                .filter(p => searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(p => statusFilter === "All Statuses" || p.status === statusFilter)
                .filter(p => activeTab !== "starred" || p.starred)
                .filter(p => activeTab !== "my" || p.owner === "Tharun")
                .map((proj) => (
                  <div key={proj.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-[#343c54] rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-2xl flex items-center justify-center shrink-0">
                          {proj.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{proj.name}</h3>
                          <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3" /> {proj.model}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          proj.status === "Active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                          proj.status === "Deploying" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                          proj.status === "Completed" ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                          "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          {proj.status}
                        </span>

                        <button onClick={() => toggleStar(proj.id)} className="text-slate-500 hover:text-amber-400 transition-colors">
                          <Star className={`w-4 h-4 ${proj.starred ? "text-amber-400 fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      {proj.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-white font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1c1f2e] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>

                    {/* Team & Assigned AI Agents */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-[#232736] pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono">Assigned Agents:</span>
                        <span className="text-emerald-400 font-bold font-mono">{proj.agents.length} Workers</span>
                      </div>

                      <div className="flex -space-x-1.5">
                        {proj.team.map((mem, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center border border-[#141620]">
                            {mem}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => router.push("/dashboard/ai/chat")}
                        className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        Open Workspace
                      </button>

                      <div className="flex items-center gap-2">
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Copy className="w-3.5 h-3.5" /></button>
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Share2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: KANBAN BOARD VIEW */}
          {/* ========================================================================= */}
          {activeTab === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {["Backlog", "To Do", "In Progress", "Review", "Testing", "Completed"].map((col) => {
                const colTasks = tasks.filter(t => t.column === col)
                return (
                  <div key={col} className="bg-[#141620] border border-[#232736] rounded-2xl p-3 flex flex-col gap-3 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-[#232736] pb-2 text-xs font-bold text-white">
                      <span>{col}</span>
                      <span className="px-2 py-0.2 rounded bg-[#0d0e14] text-[10px] font-mono text-slate-400">{colTasks.length}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {colTasks.map((t) => (
                        <div key={t.id} className="p-3 bg-[#0d0e14] border border-[#232736] hover:border-blue-500/40 rounded-xl flex flex-col gap-2 text-xs cursor-pointer shadow-sm">
                          <span className="font-bold text-white leading-snug">{t.title}</span>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-purple-400">{t.aiAssist}</span>
                            <span className="text-emerald-400">{t.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: GANTT TIMELINE VIEW */}
          {/* ========================================================================= */}
          {activeTab === "timeline" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Interactive Gantt Roadmap & Milestones
              </h3>
              
              <div className="flex flex-col gap-3 font-mono text-xs">
                {[
                  { name: "Neural Engine v3", bar: "w-[85%]", color: "bg-blue-500", date: "Jun 01 - Aug 15" },
                  { name: "Support Agent Hub", bar: "w-[65%]", color: "bg-purple-500", date: "Jun 15 - Aug 01" },
                  { name: "Vector DB Pipeline", bar: "w-[45%]", color: "bg-emerald-500", date: "Jul 01 - Aug 20" },
                ].map((row, idx) => (
                  <div key={idx} className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-white font-sans font-bold">
                      <span>{row.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{row.date}</span>
                    </div>
                    <div className="w-full h-3 bg-[#1e2232] rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: row.bar.replace("w-[", "").replace("]", "") }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: TASKS TABLE VIEW */}
          {/* ========================================================================= */}
          {activeTab === "tasks" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <List className="w-4 h-4 text-blue-400" /> Workspace Task Queue
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 border-b border-[#232736]">
                      <th className="pb-2">TASK TITLE</th>
                      <th className="pb-2">STATUS</th>
                      <th className="pb-2">PRIORITY</th>
                      <th className="pb-2">ASSIGNEE</th>
                      <th className="pb-2">AI ASSIST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2230]">
                    {tasks.map((t) => (
                      <tr key={t.id} className="hover:bg-[#191c28]">
                        <td className="py-3 font-semibold text-white font-sans">{t.title}</td>
                        <td className="py-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">{t.column}</span></td>
                        <td className="py-3"><span className="text-emerald-400 font-bold">{t.priority}</span></td>
                        <td className="py-3 text-slate-300">{t.assignee}</td>
                        <td className="py-3 text-purple-400">{t.aiAssist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 10: PROJECT TEMPLATES */}
          {/* ========================================================================= */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Software Development", icon: Code2, desc: "Full-stack React, Rust & PostgreSQL boilerplate" },
                { title: "AI Application Stack", icon: Sparkles, desc: "LangChain, RAG Vector Search & OpenAI API" },
                { title: "Machine Learning Fine-Tune", icon: BrainIcon, desc: "Dataset creation, PyTorch trainer & INT8 quantization" },
                { title: "Cyber Security Audit", icon: ShieldCheck, desc: "OWASP vulnerability scanner & API key auditor" },
                { title: "Data Science Pipeline", icon: Database, desc: "ETL scripts, Pandas cleanups & Superset charts" },
                { title: "Autonomous Agent Bot", icon: Bot, desc: "CrewAI & LangGraph multi-agent swarm architecture" },
              ].map((tpl, idx) => {
                const Icon = tpl.icon || Code2
                return (
                  <div key={idx} className="p-5 bg-[#141620] border border-[#232736] hover:border-blue-500/40 rounded-2xl flex flex-col justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2232] text-blue-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{tpl.desc}</p>
                    <button className="w-full bg-[#1e2232] hover:bg-blue-600 text-slate-200 hover:text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer">
                      Use Template →
                    </button>
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (STICKY TELEMETRY & SUMMARY COLUMN) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Current Active Project Summary */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-blue-400" /> Active Summary</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </h4>

            <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-1.5 text-xs font-mono">
              <span className="font-bold text-white font-sans">Neural Engine v3</span>
              <div className="flex justify-between text-slate-400"><span>Sprint:</span><span className="text-emerald-400 font-bold">Week 4 of 6</span></div>
              <div className="flex justify-between text-slate-400"><span>API Calls 24h:</span><span className="text-purple-400 font-bold">142.5k</span></div>
            </div>
          </div>

          {/* Assigned AI Workers List */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-amber-400" /> Active AI Workers</span>
              <span className="text-[10px] text-amber-400 font-mono">3 Running</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {["Crawler-Bot Alpha", "Data Synthesizer", "DevOps Copilot"].map((w, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                  <span className="font-bold text-white">{w}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Sparkles {...props} />
}
