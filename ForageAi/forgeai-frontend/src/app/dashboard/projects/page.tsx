"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Folder,
  Sparkles,
  Plus,
  Search,
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
  Loader2,
  RefreshCw,
} from "lucide-react"
import { projectsApi } from "@/lib/api"
import { Project } from "@/types"

export default function ProjectsPage() {
  const router = useRouter()

  // Live Projects State
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [starredIds, setStarredIds] = useState<Record<string, boolean>>({})

  // Modal State for New Project Creation
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")
  const [newProjectBackend, setNewProjectBackend] = useState("FastAPI (Python)")
  const [newProjectFrontend, setNewProjectFrontend] = useState("Next.js 15 (TypeScript)")
  const [newProjectDb, setNewProjectDb] = useState("PostgreSQL 16")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Modal State for Delete Confirmation
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Active View Tab State
  const [activeTab, setActiveTab] = useState<
    "grid" | "my" | "starred" | "kanban" | "timeline" | "tasks" | "templates" | "analytics"
  >("grid")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")

  // Load Projects from Backend
  const loadProjects = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await projectsApi.list()
      setProjects(data)
    } catch (err: any) {
      console.error("Failed to load projects:", err)
      setErrorMsg(err.message || "Failed to load projects from server.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // Handle Project Creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setIsCreating(true)
    setCreateError(null)

    try {
      const created = await projectsApi.create({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        tech_stack: {
          backend: newProjectBackend,
          frontend: newProjectFrontend,
          database: newProjectDb,
        },
      })

      setProjects(prev => [created, ...prev])
      setShowCreateModal(false)
      setNewProjectName("")
      setNewProjectDesc("")
    } catch (err: any) {
      console.error("Failed to create project:", err)
      setCreateError(err.message || "Failed to create project.")
    } finally {
      setIsCreating(false)
    }
  }

  // Handle Project Deletion
  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)

    try {
      await projectsApi.delete(projectToDelete.id)
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
      setProjectToDelete(null)
    } catch (err: any) {
      console.error("Failed to delete project:", err)
      setErrorMsg(err.message || "Failed to delete project.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Toggle Project Star Status
  const toggleStar = (id: string) => {
    setStarredIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Tasks List Data for Kanban / Table View
  const tasks = [
    { id: "t1", title: "Optimize HNSW index vector search latency", column: "In Progress", priority: "Urgent", assignee: "Tharun", due: "Today", aiAssist: "GPT-4o Copilot" },
    { id: "t2", title: "Configure Kubernetes auto-scaler metrics server", column: "To Do", priority: "High", assignee: "Alex D.", due: "Tomorrow", aiAssist: "Claude 3.5 Sonnet" },
    { id: "t3", title: "Audit OWASP vulnerabilities on auth-service", column: "Testing", priority: "High", assignee: "Marcus V.", due: "Jul 26", aiAssist: "Security Auditor Bot" },
    { id: "t4", title: "Setup fine-tuning dataset pipeline v3", column: "Completed", priority: "Medium", assignee: "Sarah K.", due: "Jul 20", aiAssist: "Data Synthesizer" },
    { id: "t5", title: "Implement Stripe webhook idempotent handler", column: "Backlog", priority: "Medium", assignee: "Tharun", due: "Jul 30", aiAssist: "None" },
    { id: "t6", title: "Draft API documentation & OpenAPI specs", column: "Review", priority: "Low", assignee: "Alex D.", due: "Jul 28", aiAssist: "GPT-4o" },
  ]

  const totalCount = projects.length
  const activeCount = projects.filter(p => p.status === "active" || p.status === "Active").length
  const completedCount = projects.filter(p => p.status === "completed" || p.status === "Completed").length

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
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <Link
            href="/dashboard/blueprint-ai/new"
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Generate Blueprint</span>
          </Link>

          <button
            onClick={loadProjects}
            disabled={isLoading}
            className="p-2.5 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Refresh Projects"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadProjects}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: KPI OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Projects", val: isLoading ? "..." : totalCount.toString(), color: "text-white", icon: Folder },
          { label: "Active Projects", val: isLoading ? "..." : activeCount.toString(), color: "text-emerald-400", icon: Play },
          { label: "Completed", val: isLoading ? "..." : completedCount.toString(), color: "text-blue-400", icon: CheckCircle2 },
          { label: "In Pipeline", val: isLoading ? "..." : (totalCount - completedCount).toString(), color: "text-purple-400", icon: Workflow },
          { label: "Workspace Members", val: "12", color: "text-purple-400", icon: Users },
          { label: "AI Workers", val: "7 Live", color: "text-amber-400", icon: Bot },
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
            { id: "grid", label: `All Projects (${totalCount})`, icon: LayoutGrid },
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
            <option>active</option>
            <option>completed</option>
            <option>archived</option>
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN CONTENT COLUMN */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* LOADING SKELETON */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#1e2232]"></div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="w-32 h-4 bg-[#1e2232] rounded"></div>
                      <div className="w-24 h-3 bg-[#1e2232] rounded"></div>
                    </div>
                  </div>
                  <div className="w-full h-16 bg-[#0d0e14] rounded-xl"></div>
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && projects.length === 0 && (
            <div className="p-12 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                <Folder className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Projects Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Get started by creating a new software workspace or generating a full-stack blueprint with AI agents.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  Create New Project
                </button>
                <Link
                  href="/dashboard/blueprint-ai/new"
                  className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl"
                >
                  Generate Blueprint
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: PROJECT CARDS GRID */}
          {/* ========================================================================= */}
          {!isLoading && projects.length > 0 && (activeTab === "grid" || activeTab === "my" || activeTab === "starred") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects
                .filter(p => searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())))
                .filter(p => statusFilter === "All Statuses" || p.status.toLowerCase() === statusFilter.toLowerCase())
                .filter(p => activeTab !== "starred" || starredIds[p.id])
                .map((proj) => {
                  const isStarred = !!starredIds[proj.id]
                  const backendTech = proj.tech_stack?.backend || "FastAPI"
                  const frontendTech = proj.tech_stack?.frontend || "Next.js"
                  const dbTech = proj.tech_stack?.database || "PostgreSQL"

                  return (
                    <div key={proj.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/40 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                      
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">{proj.name}</h3>
                            <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3" /> {backendTech} + {frontendTech}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            proj.status.toLowerCase() === "active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            proj.status.toLowerCase() === "completed" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>
                            {proj.status.toUpperCase()}
                          </span>

                          <button onClick={() => toggleStar(proj.id)} className="text-slate-500 hover:text-amber-400 transition-colors p-1 cursor-pointer">
                            <Star className={`w-4 h-4 ${isStarred ? "text-amber-400 fill-current" : ""}`} />
                          </button>

                          <button
                            onClick={() => setProjectToDelete(proj)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        {proj.description || "Full-stack cloud-native software application with microservices and PostgreSQL persistence."}
                      </p>

                      {/* Tech Stack Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                        <span className="px-2 py-0.5 bg-[#181a26] border border-[#2d3248] text-purple-300 rounded-md">{backendTech}</span>
                        <span className="px-2 py-0.5 bg-[#181a26] border border-[#2d3248] text-blue-300 rounded-md">{frontendTech}</span>
                        <span className="px-2 py-0.5 bg-[#181a26] border border-[#2d3248] text-emerald-300 rounded-md">{dbTech}</span>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                        <Link
                          href={`/dashboard/blueprint-ai/software-architecture`}
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              localStorage.setItem("forgeai_active_project_id", proj.id)
                            }
                          }}
                          className="bg-[#2563eb] hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View Blueprint</span>
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push("/dashboard/ai/chat")}
                            className="bg-[#181a26] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-[#2d3248] text-xs font-semibold cursor-pointer"
                          >
                            AI Assistant
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}
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
                {(projects.length > 0 ? projects : [
                  { id: "1", name: "AI Blueprint Engine", status: "active" },
                ]).map((proj, idx) => (
                  <div key={idx} className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between text-white font-sans font-bold">
                      <span>{proj.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Live Sprint</span>
                    </div>
                    <div className="w-full h-3 bg-[#1e2232] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${Math.min(100, 45 + idx * 25)}%` }}></div>
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
          {/* SECTION 6: PROJECT TEMPLATES */}
          {/* ========================================================================= */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Software Development", icon: Code2, desc: "Full-stack React, FastAPI & PostgreSQL boilerplate" },
                { title: "AI Application Stack", icon: Sparkles, desc: "LangChain, RAG Vector Search & OpenAI API" },
                { title: "Machine Learning Pipeline", icon: Sparkles, desc: "Dataset creation, PyTorch trainer & INT8 quantization" },
                { title: "Cyber Security Audit", icon: ShieldCheck, desc: "OWASP vulnerability scanner & API key auditor" },
                { title: "Data Science Pipeline", icon: Database, desc: "ETL scripts, Pandas cleanups & Superset charts" },
                { title: "Autonomous Agent Bot", icon: Bot, desc: "CrewAI & LangGraph multi-agent swarm architecture" },
              ].map((tpl, idx) => {
                const Icon = tpl.icon
                return (
                  <div key={idx} className="p-5 bg-[#141620] border border-[#232736] hover:border-blue-500/40 rounded-2xl flex flex-col justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2232] text-blue-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{tpl.desc}</p>
                    <button
                      onClick={() => {
                        setNewProjectName(`${tpl.title} Workspace`)
                        setNewProjectDesc(tpl.desc)
                        setShowCreateModal(true)
                      }}
                      className="w-full bg-[#1e2232] hover:bg-blue-600 text-slate-200 hover:text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
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
              <span className="text-[10px] text-emerald-400 font-mono">PostgreSQL</span>
            </h4>

            <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-1.5 text-xs font-mono">
              <span className="font-bold text-white font-sans truncate">
                {projects[0]?.name || "No active project"}
              </span>
              <div className="flex justify-between text-slate-400">
                <span>Projects Count:</span>
                <span className="text-emerald-400 font-bold">{projects.length} Total</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-purple-400 font-bold">{projects[0]?.status || "Ready"}</span>
              </div>
            </div>
          </div>

          {/* Assigned AI Workers List */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-amber-400" /> AI Domain Agents</span>
              <span className="text-[10px] text-amber-400 font-mono">7 Ready</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {[
                "RequirementsAgent",
                "ArchitectureAgent",
                "DatabaseAgent",
                "BackendApiAgent",
                "FrontendAgent",
                "SecurityAgent",
                "DeploymentAgent",
              ].map((w, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                  <span className="font-bold text-white font-mono text-[11px]">{w}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PROJECT */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="bg-[#141620] border border-[#262a3c] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#232736] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create New Project</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Initialize a software repository workspace in PostgreSQL.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-semibold">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Neural Engine v4"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-sans text-xs"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-semibold">Description</label>
              <textarea
                rows={2}
                placeholder="Describe project objectives and scope..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-sans text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold text-[11px]">Backend Framework</label>
                <select
                  value={newProjectBackend}
                  onChange={(e) => setNewProjectBackend(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option>FastAPI (Python)</option>
                  <option>Rust (Actix-web)</option>
                  <option>Node.js (Express)</option>
                  <option>Go (Gin)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold text-[11px]">Frontend Stack</label>
                <select
                  value={newProjectFrontend}
                  onChange={(e) => setNewProjectFrontend(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option>Next.js 15 (TypeScript)</option>
                  <option>React 19 (Vite)</option>
                  <option>Vue 3 (Nuxt)</option>
                  <option>SvelteKit</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#232736]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
                className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !newProjectName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141620] border border-[#262a3c] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#232736] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Project?</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Are you sure you want to permanently delete <strong className="text-white">{projectToDelete.name}</strong>?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#232736]">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] text-slate-300 font-semibold rounded-xl border border-[#2d3248] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

