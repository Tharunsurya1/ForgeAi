"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Workflow,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Terminal,
  Layers,
  ExternalLink,
  ShieldCheck,
  Bot,
  Database,
  Code2,
  Server,
  FileCode,
  Sliders,
  Cpu,
  FileText,
  Activity,
} from "lucide-react"

import { workflowsApi, projectsApi } from "@/lib/api"
import { Project, WorkflowExecution, WorkflowEvent } from "@/types"

function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Layers {...props} />
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Sparkles {...props} />
}

// The Canonical 14 Specialist Agents of ForgeAI in DAG execution order
export const AGENTS_LIST = [
  { id: "SupervisorAgent", name: "Supervisor", role: "Workflow Orchestrator", icon: Bot, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { id: "RequirementsAgent", name: "Requirements", role: "Scope & Constraints", icon: FileText, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { id: "BusinessAnalystAgent", name: "Business Analyst", role: "Stories & Domain Models", icon: Sliders, color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10" },
  { id: "DatabaseAgent", name: "Database", role: "PostgreSQL DDL & ERD", icon: Database, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { id: "APIAgent", name: "API", role: "OpenAPI 3.1 Contracts", icon: Activity, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
  { id: "UIUXAgent", name: "UI/UX", role: "Design Systems & Palettes", icon: Sparkles, color: "text-pink-400", border: "border-pink-500/30", bg: "bg-pink-500/10" },
  { id: "FrontendAgent", name: "Frontend", role: "Next.js 15 Architect", icon: LayoutDashboardIcon, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  { id: "BackendAgent", name: "Backend", role: "FastAPI REST Engine", icon: Server, color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  { id: "SecurityAgent", name: "Security", role: "STRIDE & OWASP Audit", icon: ShieldCheck, color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  { id: "DevOpsAgent", name: "DevOps", role: "Docker & CI/CD Pipelines", icon: Cpu, color: "text-teal-400", border: "border-teal-500/30", bg: "bg-teal-500/10" },
  { id: "TestingAgent", name: "Testing", role: "Pytest Suites & QA", icon: FileCode, color: "text-lime-400", border: "border-lime-500/30", bg: "bg-lime-500/10" },
  { id: "DocumentationAgent", name: "Documentation", role: "README & Technical Specs", icon: Layers, color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  { id: "CodeReviewAgent", name: "Code Review", role: "Quality Gate & Verdict", icon: Code2, color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/10" },
  { id: "OptimizationAgent", name: "Optimization", role: "Performance & Caching", icon: ZapIcon, color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
]

export type AgentStatus = "queued" | "running" | "completed" | "failed" | "retrying"

interface LiveWorkflowMonitorProps {
  initialExecutionId?: string | null
}

function LiveWorkflowMonitorContent({ initialExecutionId }: LiveWorkflowMonitorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlExecutionId = searchParams?.get("executionId") || initialExecutionId

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [activeExecution, setActiveExecution] = useState<WorkflowExecution | null>(null)

  // Live state
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({})
  const [progressPct, setProgressPct] = useState<number>(0)
  const [currentAgentName, setCurrentAgentName] = useState<string>("")
  const [reviewVerdict, setReviewVerdict] = useState<{ score?: number; verdict?: string } | null>(null)
  const [liveEvents, setLiveEvents] = useState<WorkflowEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle")

  // Trigger Form state
  const [promptInput, setPromptInput] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const socketRef = useRef<WebSocket | null>(null)
  const logTerminalRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll event log terminal to bottom
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight
    }
  }, [liveEvents])

  // Select an execution and derive initial agent statuses
  const selectExecution = useCallback((exec: WorkflowExecution | null) => {
    setActiveExecution(exec)
    if (!exec) {
      setProgressPct(0)
      setCurrentAgentName("")
      setLiveEvents([])
      setReviewVerdict(null)
      return
    }

    const initialStatuses: Record<string, AgentStatus> = {}
    AGENTS_LIST.forEach((ag) => {
      initialStatuses[ag.id] = "queued"
    })

    if (exec.status === "completed") {
      AGENTS_LIST.forEach((ag) => {
        initialStatuses[ag.id] = "completed"
      })
      setProgressPct(100)
    } else {
      if (exec.agent_runs) {
        exec.agent_runs.forEach((ar) => {
          if (ar.status === "completed" || ar.status === "failed" || ar.status === "running") {
            initialStatuses[ar.agent_name] = ar.status as AgentStatus
          }
        })
      }
      setProgressPct(exec.progress_percentage || 0)
    }

    setCurrentAgentName(exec.current_agent || "SupervisorAgent")
    setAgentStatuses(initialStatuses)
    setLiveEvents(exec.events || [])

    if (exec.metadata && exec.metadata.quality_score) {
      setReviewVerdict({
        score: exec.metadata.quality_score,
        verdict: exec.metadata.approval_verdict,
      })
    }
  }, [])

  // Initial Data Fetch: Projects and Workflows
  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        const projs = await projectsApi.list()
        if (!mounted) return
        setProjects(projs)
        if (projs.length > 0) {
          const firstProjId = projs[0].id
          setSelectedProjectId(firstProjId)
          const wfList = await workflowsApi.listForProject(firstProjId)
          if (!mounted) return
          setExecutions(wfList)

          if (urlExecutionId) {
            const found = wfList.find((w) => w.id === urlExecutionId)
            if (found) {
              selectExecution(found)
            } else {
              const directWf = await workflowsApi.get(urlExecutionId)
              if (mounted) selectExecution(directWf)
            }
          } else if (wfList.length > 0) {
            selectExecution(wfList[0])
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load workflow initial data:", err)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [urlExecutionId, selectExecution])

  // Re-fetch workflows when selected project changes
  const handleProjectSelect = async (projectId: string) => {
    setSelectedProjectId(projectId)
    try {
      const list = await workflowsApi.listForProject(projectId)
      setExecutions(list)
      if (list.length > 0) {
        selectExecution(list[0])
      } else {
        selectExecution(null)
      }
    } catch (err) {
      console.error("Failed to list workflows for project:", err)
    }
  }

  // Connect WebSocket to active execution
  useEffect(() => {
    if (!activeExecution?.id) {
      return
    }

    const executionId = activeExecution.id
    const streamUrl = workflowsApi.getStreamUrl(executionId)

    if (socketRef.current) {
      socketRef.current.close()
    }

    const ws = new WebSocket(streamUrl)
    socketRef.current = ws

    ws.onopen = () => {
      setConnectionStatus("connected")
    }

    ws.onmessage = (messageEvent) => {
      try {
        const eventData = JSON.parse(messageEvent.data)
        if (eventData.event_type === "heartbeat" || eventData.event_type === "ping") {
          return
        }

        setLiveEvents((prev) => [...prev, eventData])

        const { event_type, agent_name, progress, payload } = eventData

        if (progress !== undefined) {
          setProgressPct(progress)
        }
        if (agent_name) {
          setCurrentAgentName(agent_name)
        }

        if (event_type === "agent_started" && agent_name) {
          setAgentStatuses((prev) => ({ ...prev, [agent_name]: "running" }))
        } else if (event_type === "agent_completed" && agent_name) {
          setAgentStatuses((prev) => ({ ...prev, [agent_name]: "completed" }))
        } else if (event_type === "agent_failed" && agent_name) {
          setAgentStatuses((prev) => ({ ...prev, [agent_name]: "failed" }))
        } else if (event_type === "code_review_verdict") {
          setReviewVerdict({
            score: payload?.quality_score,
            verdict: payload?.approval_verdict,
          })
        } else if (event_type === "workflow_completed") {
          setProgressPct(100)
          AGENTS_LIST.forEach((ag) => {
            setAgentStatuses((prev) => ({ ...prev, [ag.id]: "completed" }))
          })
          setActiveExecution((prev) => (prev ? { ...prev, status: "completed", progress_percentage: 100 } : null))
        } else if (event_type === "workflow_failed") {
          setActiveExecution((prev) => (prev ? { ...prev, status: "failed" } : null))
        }
      } catch (err: unknown) {
        console.error("Failed to parse websocket message:", err)
      }
    }

    ws.onclose = () => {
      setConnectionStatus("disconnected")
    }

    ws.onerror = (err) => {
      console.warn("WebSocket stream notice:", err)
      setConnectionStatus("disconnected")
    }

    return () => {
      ws.close()
      setConnectionStatus("idle")
    }
  }, [activeExecution?.id])

  // Trigger New Workflow Execution
  const handleTriggerWorkflow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setErrorMsg("Please create or select an active project first.")
      return
    }
    if (!promptInput.trim()) {
      setErrorMsg("Please specify system requirements or architectural goal.")
      return
    }

    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const execution = await workflowsApi.execute(
        selectedProjectId,
        {
          prompt: promptInput.trim(),
          title: titleInput.trim() || undefined,
        },
        true // background execution: returns immediately
      )

      setIsSubmitting(false)
      setExecutions((prev) => [execution, ...prev])
      selectExecution(execution)
      setPromptInput("")
      setTitleInput("")
    } catch (err: unknown) {
      setIsSubmitting(false)
      const message = err instanceof Error ? err.message : "Failed to trigger workflow execution."
      setErrorMsg(message)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full text-slate-200">
      {/* Top Header Bar */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-purple-400 animate-pulse" /> Live Multi-Agent Streaming
            </span>
            {connectionStatus === "connected" && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" /> WebSocket Live
              </span>
            )}
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" /> Qdrant RAG Context Active
            </span>
            {connectionStatus === "connecting" && (
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Connecting...
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">
            14-Agent DAG Workflow Execution Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and state transitions streamed directly from LangGraph StateGraph orchestrator.
          </p>
        </div>

        {/* Project and Execution Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 whitespace-nowrap">Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="bg-[#0e1017] border border-[#2d3248] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {executions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-400 whitespace-nowrap">Execution:</label>
              <select
                value={activeExecution?.id || ""}
                onChange={(e) => {
                  const found = executions.find((ex) => ex.id === e.target.value)
                  selectExecution(found || null)
                }}
                className="bg-[#0e1017] border border-[#2d3248] text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-colors max-w-[190px] truncate"
              >
                {executions.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.status.toUpperCase()} - {new Date(ex.created_at).toLocaleTimeString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Workflow Form Card */}
      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" /> Trigger Autonomous 14-Agent Synthesis
        </h3>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleTriggerWorkflow} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. Real-time distributed healthcare telemetry platform with PostgreSQL, HL7 FHIR and FastAPI..."
            className="flex-1 bg-[#0e1017] border border-[#2d3248] text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
          />
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Blueprint Title (Optional)"
            className="w-full md:w-56 bg-[#0e1017] border border-[#2d3248] text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !promptInput.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white" />
            )}
            <span>Execute Workflow</span>
          </button>
        </form>
      </div>

      {/* Active Execution Status Banner */}
      {activeExecution && (
        <div className="bg-[#10121a] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Active Execution ID:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                  {activeExecution.id}
                </code>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeExecution.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : activeExecution.status === "failed"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse"
                  }`}
                >
                  {activeExecution.status}
                </span>
              </div>
            </div>

            {/* Quality Score Badge */}
            {reviewVerdict?.score && (
              <div className="flex items-center gap-2 bg-[#161824] border border-[#2d3248] px-3.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">Code Review:</span>
                <span className="text-xs font-bold text-emerald-400">{reviewVerdict.score}/100</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {reviewVerdict.verdict}
                </span>
              </div>
            )}

            {/* Blueprint Link Button if complete */}
            {activeExecution.blueprint_id && (
              <button
                onClick={() =>
                  router.push(`/dashboard/blueprint-ai/software-architecture?id=${activeExecution.blueprint_id}`)
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>View Architecture Blueprint</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Real Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="text-purple-400">Current Specialist:</span>
                <strong className="text-white">{currentAgentName}</strong>
              </span>
              <span className="font-bold text-purple-300">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#090a0f] rounded-full overflow-hidden border border-[#232736]">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: 14 Specialist Agents Grid & Live Event Stream Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 14 Specialist Agents Grid (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Workflow className="w-4 h-4 text-purple-400" /> 14 Specialist AI Agents
            </span>
            <span className="text-[11px] font-mono text-slate-400">StateGraph DAG Pipeline</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AGENTS_LIST.map((agent, index) => {
              const Icon = agent.icon
              const status: AgentStatus = agentStatuses[agent.id] || "queued"
              const isCurrent = currentAgentName === agent.id

              return (
                <div
                  key={agent.id}
                  className={`p-3.5 rounded-xl border bg-[#141620] transition-all flex flex-col gap-2 relative ${
                    isCurrent
                      ? "ring-2 ring-purple-500 border-purple-500/50 shadow-lg shadow-purple-500/10"
                      : "border-[#232736]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <div className={`w-7 h-7 rounded-lg ${agent.bg} border ${agent.border} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${agent.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{agent.name}</h4>
                        <span className="text-[10px] text-slate-400">{agent.role}</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {status === "completed" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                        </span>
                      )}
                      {status === "running" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1 animate-pulse font-bold">
                          <Sparkles className="w-3 h-3 text-purple-400 animate-spin" /> Running
                        </span>
                      )}
                      {status === "failed" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-bold">
                          <AlertCircle className="w-3 h-3 text-rose-400" /> Failed
                        </span>
                      )}
                      {status === "retrying" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-amber-400 animate-spin" /> Retrying
                        </span>
                      )}
                      {status === "queued" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> Queued
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Live Event Stream Terminal (5 Cols) */}
        <div className="lg:col-span-5 bg-[#090a0f] border border-[#232736] rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#232736]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-emerald-400" /> Live Event Stream Log
            </span>
            <span className="text-[10px] font-mono text-slate-400">{liveEvents.length} events logged</span>
          </div>

          <div
            ref={logTerminalRef}
            className="flex flex-col gap-2 max-h-[580px] min-h-[420px] overflow-y-auto custom-scrollbar font-mono text-[11px] p-2 bg-[#050608] rounded-xl border border-[#1b1e2c]"
          >
            {liveEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center text-slate-500 py-16 gap-2">
                <Radio className="w-6 h-6 text-slate-600 animate-pulse" />
                <span>Waiting for workflow stream events...</span>
              </div>
            )}

            {liveEvents.map((ev, idx) => {
              const isError = ev.event_type?.includes("failed")
              const isDone = ev.event_type?.includes("completed")
              const isReview = ev.event_type?.includes("code_review")
              const payload = ev.payload as Record<string, unknown> | undefined

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex flex-col gap-1 transition-all ${
                    isError
                      ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                      : isDone
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : isReview
                      ? "bg-purple-950/20 border-purple-500/30 text-purple-300"
                      : "bg-[#0d0e14] border-[#222536] text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-slate-400">
                      seq #{ev.sequence_number || idx + 1}
                    </span>
                    <span>
                      {ev.created_at || ev.timestamp
                        ? new Date(ev.created_at || (ev.timestamp as string)).toLocaleTimeString()
                        : "live"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{ev.event_type}</span>
                    {ev.agent_name && (
                      <span className="px-1.5 py-0.2 rounded bg-[#1e2234] text-purple-300 text-[10px]">
                        {ev.agent_name}
                      </span>
                    )}
                  </div>

                  {Boolean(payload?.message || ev.message) && (
                    <p className="text-[10.5px] text-slate-300">
                      {String(payload?.message || ev.message)}
                    </p>
                  )}
                  {Boolean(payload?.error) && (
                    <p className="text-[10.5px] text-rose-400 font-bold">{String(payload?.error)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LiveWorkflowMonitor(props: LiveWorkflowMonitorProps) {
  return (
    <React.Suspense fallback={<div className="p-8 text-slate-400 font-mono text-xs">Connecting to Workflow Stream...</div>}>
      <LiveWorkflowMonitorContent {...props} />
    </React.Suspense>
  )
}
