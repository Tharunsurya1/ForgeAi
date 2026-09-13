"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import LiveWorkflowMonitor from "@/components/workflows/LiveWorkflowMonitor"
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
  Users,
  Bot,
  Database,
  ShieldCheck,
  Zap,
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
  TerminalSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Minimize2,
  Pause,
  StopCircle,
  Bug,
  RotateCcw,
  Calendar,
  History,
  Store,
  DollarSign,
  TrendingUp,
  HardDrive,
  CheckSquare,
} from "lucide-react"

function WorkflowsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get("tab") || (searchParams?.get("executionId") ? "executions" : "all")

  // Navigation Tab State (8 Tabs)
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "draft" | "scheduled" | "templates" | "history" | "executions" | "analytics"
  >(tabParam as any)

  // Canvas Zoom Level & Fullscreen State
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Workflow Execution State
  const [isRunning, setIsRunning] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-2")

  // Modals & Drawers State
  const [showImportModal, setShowImportModal] = useState(false)
  const [importJson, setImportJson] = useState("")

  // Filter States
  const [scheduledFilter, setScheduledFilter] = useState("All")
  const [marketplaceCategory, setMarketplaceCategory] = useState("All Categories")
  const [historyFilter, setHistoryFilter] = useState("Today")

  // Node Library Categories & Items
  const nodeCategories = [
    { title: "Triggers", icon: Zap, color: "text-amber-400", nodes: ["Webhook Trigger", "Cron Scheduler", "GitHub Push", "Email Received"] },
    { title: "Logic & Control", icon: GitBranch, color: "text-blue-400", nodes: ["IF / Else Condition", "Switch Router", "Loop For Each", "Delay Wait"] },
    { title: "AI Agents", icon: Sparkles, color: "text-purple-400", nodes: ["Claude 3.5 Summarizer", "RAG Vector Search", "Code Generator", "Multi-Agent System"] },
    { title: "Database & Storage", icon: Database, color: "text-emerald-400", nodes: ["PostgreSQL Query", "Redis Cache Put", "S3 File Storage", "Qdrant Vector DB"] },
    { title: "Messaging & Email", icon: Mail, color: "text-indigo-400", nodes: ["Send Slack Alert", "Gmail Send Email", "Discord Webhook", "Telegram Bot"] },
  ]

  // Dynamic Canvas Node Graph State
  const [canvasNodes, setCanvasNodes] = useState<any[]>([
    {
      id: "node-1",
      name: "1. Webhook Event Trigger",
      category: "Trigger",
      type: "Webhook",
      status: "Success",
      desc: "POST /api/v1/workflows/lead-ingest",
      icon: Radio,
      color: "border-amber-500/50 bg-amber-500/10 text-amber-300",
      params: "Endpoint: /api/v1/workflows/lead-ingest, Method: POST, Auth: Bearer JWT",
    },
    {
      id: "node-2",
      name: "2. Qdrant RAG Vector Search",
      category: "AI & Database",
      type: "Vector Search",
      status: "Success",
      desc: "Top 5 embedding search matches in 42ms",
      icon: Database,
      color: "border-purple-500/50 bg-purple-500/10 text-purple-300",
      params: "Collection: enterprise_docs, Top_K: 5, Score Threshold: 0.85",
    },
    {
      id: "node-3",
      name: "3. Claude 3.5 Sonnet Reasoning",
      category: "AI Node",
      type: "LLM Agent",
      status: "Running",
      desc: "Extract action items & customer intent",
      icon: Sparkles,
      color: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300",
      params: "Model: Claude 3.5 Sonnet, Max Tokens: 1024, Temperature: 0.2",
    },
    {
      id: "node-4",
      name: "4. Slack & Email Dispatch",
      category: "Messaging",
      type: "Slack / Email",
      status: "Pending",
      desc: "Post structured summary to #leads channel",
      icon: MessageSquare,
      color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
      params: "Channel: #enterprise-leads, Email Template: Lead Notification",
    },
  ])

  // Selected Node Object
  const selectedNodeObj = canvasNodes.find(n => n.id === selectedNodeId) || canvasNodes[0]

  // Live Execution Console Logs State
  const [consoleLogs, setConsoleLogs] = useState([
    `[${new Date().toLocaleTimeString()}] ⚡ Webhook Trigger received payload from Stripe API (200 OK)`,
    `[${new Date().toLocaleTimeString()}] 🧠 Qdrant Vector DB: Processed 1,536-dim embedding query (42ms)`,
    `[${new Date().toLocaleTimeString()}] 🤖 Claude 3.5 Sonnet: Generating structured JSON summary (480 tokens)`,
    `[${new Date().toLocaleTimeString()}] 💬 Slack Bot: Notification dispatched to #enterprise-sales`,
  ])

  // Handle Add Node from Library
  const handleAddNodeToCanvas = (nodeName: string, categoryName: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      name: `${canvasNodes.length + 1}. ${nodeName}`,
      category: categoryName,
      type: nodeName,
      status: "Pending",
      desc: `Configured ${nodeName} action for pipeline execution`,
      icon: Sparkles,
      color: "border-purple-500/50 bg-purple-500/10 text-purple-300",
      params: `Custom parameters for ${nodeName}`,
    }
    setCanvasNodes([...canvasNodes, newNode])
    setSelectedNodeId(newNode.id)
    setToastMessage(`✨ Added "${nodeName}" node to visual canvas graph!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Delete Node
  const handleDeleteNode = (id: string) => {
    if (canvasNodes.length <= 1) {
      setToastMessage("⚠️ Cannot delete all nodes. Workflow requires at least 1 node.")
      setTimeout(() => setToastMessage(null), 3000)
      return
    }
    const filtered = canvasNodes.filter(n => n.id !== id)
    setCanvasNodes(filtered)
    setSelectedNodeId(filtered[0]?.id || null)
    setToastMessage("🗑️ Node removed from workflow canvas.")
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Test Run Execution Simulation
  const handleDeployOrRun = () => {
    setIsRunning(true)
    setToastMessage("🚀 Executing Workflow pipeline across all canvas nodes...")

    const timestamp = new Date().toLocaleTimeString()
    const newLogs = [
      `[${timestamp}] ⚡ Manual Trigger initiated workflow execution...`,
      `[${timestamp}] 🧠 Running node 1 -> node ${canvasNodes.length} graph traversal`,
      `[${timestamp}] 🤖 Claude 3.5 Sonnet & Vector search finished in 380ms`,
      `[${timestamp}] ✅ Pipeline finished cleanly with 100% success rate!`,
      ...consoleLogs,
    ]
    setConsoleLogs(newLogs)

    setTimeout(() => {
      setIsRunning(false)
      setToastMessage(`✅ Workflow executed successfully in 380ms across ${canvasNodes.length} nodes!`)
      setTimeout(() => setToastMessage(null), 3500)
    }, 1200)
  }

  // Handle Load Template
  const handleLoadTemplate = (templateName: string, templateNodes: any[]) => {
    setCanvasNodes(templateNodes)
    setSelectedNodeId(templateNodes[0]?.id || null)
    setActiveTab("all")
    setToastMessage(`🎉 Loaded pre-built template: "${templateName}"!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Import JSON Workflow
  const handleImportWorkflow = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importJson) return
    setToastMessage("📥 Workflow JSON imported and loaded to canvas graph!")
    setShowImportModal(false)
    setImportJson("")
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className={`w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6 ${isFullscreen ? "fixed inset-0 z-50 bg-[#0B0F17] p-6 overflow-y-auto" : ""}`}>

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
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Workflow Builder Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Create powerful AI workflows using visual automation, intelligent agents, and live monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            disabled={isRunning}
            onClick={handleDeployOrRun}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            {isRunning ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white text-white" />}
            <span>Test Run Workflow</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Workflow</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/workflows/all")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Workflow className="w-4 h-4 text-purple-400" />
            <span>View All Workflows</span>
          </button>

          <button
            onClick={() => setToastMessage("🚀 Workflow deployed live to production cluster!")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Deploy Production</span>
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
            { id: "all", label: "Visual Canvas Builder" },
            { id: "active", label: "Active Pipelines" },
            { id: "draft", label: "Workflow Drafts" },
            { id: "scheduled", label: "Scheduled Jobs" },
            { id: "templates", label: "Workflow Marketplace" },
            { id: "history", label: "Execution History" },
            { id: "executions", label: "Live Executions" },
            { id: "analytics", label: "Workflow Analytics" },
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
      {/* TAB 1: VISUAL CANVAS BUILDER */}
      {/* ========================================================================= */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

          {/* LEFT PANEL: NODE LIBRARY (1 COLUMN) */}
          <div className="xl:col-span-1 bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-xs max-h-[720px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#232736]">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" /> Node Library
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">1-Click Add</span>
            </div>

            {nodeCategories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <div key={idx} className="flex flex-col gap-2">
                  <span className={`font-bold flex items-center gap-1.5 ${cat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {cat.title}
                  </span>

                  <div className="grid grid-cols-1 gap-1.5 pl-2">
                    {cat.nodes.map((nodeName, nIdx) => (
                      <button
                        key={nIdx}
                        onClick={() => handleAddNodeToCanvas(nodeName, cat.title)}
                        className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-all cursor-pointer font-medium text-[11px] text-left"
                      >
                        <span className="truncate">{nodeName}</span>
                        <Plus className="w-3.5 h-3.5 text-purple-400 group-hover:text-white shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* CENTER PANEL: VISUAL CANVAS GRAPH & NODE CONFIG (3 COLUMNS) */}
          <div className="xl:col-span-3 flex flex-col gap-4 w-full">

            {/* Visual Canvas Container */}
            <div className="w-full min-h-[480px] bg-[#090a0f] border border-[#232736] rounded-2xl p-6 shadow-2xl relative overflow-x-auto custom-scrollbar">
              <div className="absolute inset-0 bg-[radial-gradient(#232736_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Canvas Toolbar Header */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#141620]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#232736]">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 10, 150))}
                  className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1f2234] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 10, 70))}
                  className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1f2234] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg text-slate-300 hover:bg-[#1f2234] cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] text-purple-300 font-mono px-2 font-bold">Zoom: {zoomLevel}%</span>
              </div>

              {/* Interactive Node Cards Row */}
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top left" }}
                className="flex items-center gap-10 pt-14 pb-8 min-w-[1100px] relative z-10 transition-transform"
              >
                {canvasNodes.map((node, index) => {
                  const Icon = node.icon || Sparkles
                  const isSelected = selectedNodeId === node.id
                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-64 p-4 rounded-2xl border ${node.color} backdrop-blur-xl shadow-xl flex flex-col gap-3 transition-all cursor-pointer relative hover:scale-105 ${
                          isSelected ? "ring-2 ring-purple-500 shadow-purple-500/20" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{node.category}</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            node.status === "Success" ? "bg-emerald-500/20 text-emerald-400" : node.status === "Running" ? "bg-purple-500/20 text-purple-400 animate-pulse" : "bg-slate-700 text-slate-300"
                          }`}>
                            {node.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0d0e14] border border-[#262a3c] flex items-center justify-center font-bold">
                            <Icon className="w-4 h-4 text-purple-400" />
                          </div>
                          <h4 className="text-xs font-bold text-white tracking-tight truncate">{node.name}</h4>
                        </div>

                        <p className="text-[11px] text-slate-300 font-mono bg-[#0d0e14]/80 p-2 rounded-xl border border-[#232736]">
                          {node.desc}
                        </p>
                      </div>

                      {index < canvasNodes.length - 1 && (
                        <div className="flex items-center text-purple-400 animate-pulse">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* NODE CONFIGURATION DRAWER */}
            {selectedNodeObj && (
              <div className="bg-[#141620] border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#232736] pb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" /> Node Inspector & Configuration: {selectedNodeObj.name}
                  </span>

                  <button
                    onClick={() => handleDeleteNode(selectedNodeObj.id)}
                    className="text-rose-400 hover:text-white font-bold flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Node
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                    <span className="text-slate-400">Node Category:</span>
                    <span className="text-purple-300 font-bold">{selectedNodeObj.category}</span>
                  </div>
                  <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                    <span className="text-slate-400">Execution Status:</span>
                    <span className="text-emerald-400 font-bold">{selectedNodeObj.status}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] font-mono text-[11px] text-slate-300">
                  <strong className="text-slate-400 block mb-1">Configuration Specs:</strong>
                  {selectedNodeObj.params || "Standard node execution parameters."}
                </div>
              </div>
            )}

            {/* EXECUTION CONSOLE */}
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-xl flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#232736] pb-2 font-mono">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <TerminalSquare className="w-4 h-4 text-emerald-400" /> Live Execution Console & Payload Logs
                </span>
                <button
                  onClick={() => setConsoleLogs([`[${new Date().toLocaleTimeString()}] Console cleared.`])}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear Console
                </button>
              </div>

              <div className="p-3 bg-[#0a0b10] border border-[#232736] rounded-xl font-mono text-[11px] text-slate-300 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="py-0.5">{log}</div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: WORKFLOW TELEMETRY & TEMPLATES (1 COLUMN) */}
          <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> Workflow Telemetry</span>
                <span className="text-[10px] text-emerald-400 font-mono">Active</span>
              </h4>

              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                  <span className="text-slate-400">Total Nodes:</span>
                  <span className="text-white font-bold">{canvasNodes.length} Nodes</span>
                </div>
                <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                  <span className="text-slate-400">Total Runs:</span>
                  <span className="text-white font-bold">12,450 runs</span>
                </div>
                <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                  <span className="text-slate-400">Success Rate:</span>
                  <span className="text-emerald-400 font-bold">99.8%</span>
                </div>
                <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                  <span className="text-slate-400">Avg Runtime:</span>
                  <span className="text-purple-400 font-bold">380ms</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Pre-built Templates</span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click</span>
              </h4>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  {
                    name: "AI Customer Support Pipeline",
                    nodes: [
                      { id: "t1-1", name: "1. Ticket Webhook", category: "Trigger", status: "Success", desc: "Zendesk API Hook", icon: Radio, color: "border-amber-500/50 bg-amber-500/10 text-amber-300" },
                      { id: "t1-2", name: "2. Claude 3.5 Triage", category: "AI Agent", status: "Success", desc: "Urgency sentiment classifier", icon: Sparkles, color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
                    ],
                  },
                  {
                    name: "RAG Knowledge Search Pipeline",
                    nodes: [
                      { id: "t2-1", name: "1. Vector Query Hook", category: "Trigger", status: "Success", desc: "User Query API", icon: Radio, color: "border-amber-500/50 bg-amber-500/10 text-amber-300" },
                      { id: "t2-2", name: "2. Qdrant Vector Search", category: "Database", status: "Success", desc: "1,536-dim search", icon: Database, color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" },
                    ],
                  },
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadTemplate(tmpl.name, tmpl.nodes)}
                    className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center justify-between transition-all text-left cursor-pointer font-semibold"
                  >
                    <span className="truncate">{tmpl.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE PIPELINES DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Stripe Webhook RAG Customer Ingestion", currNode: "Qdrant Vector Embedding Search", progress: 78, execTime: "1.4s", mem: "420 MB", cpu: "18%", queue: "#1", tokens: "1,240 tokens" },
            { name: "GitHub Repository CI/CD Security Audit", currNode: "OWASP Secret Vulnerability Scan", progress: 45, execTime: "2.1s", mem: "680 MB", cpu: "32%", queue: "#2", tokens: "890 tokens" },
            { name: "Zendesk Support Auto-Reply Bot", currNode: "Claude 3.5 Sentiment Classifier", progress: 92, execTime: "340ms", mem: "250 MB", cpu: "9%", queue: "#1", tokens: "480 tokens" },
          ].map((pipeline, idx) => (
            <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <span className="font-bold text-white text-xs truncate max-w-[200px]">{pipeline.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  RUNNING 🟢
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Current Step:</span>
                  <span className="text-purple-300 font-bold">{pipeline.currNode}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#0d0e14] h-2 rounded-full overflow-hidden border border-[#262a3c] my-1">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pipeline.progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Progress: {pipeline.progress}%</span>
                  <span>Queue Position: {pipeline.queue}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232] mt-2">
                  <div><span className="text-slate-500 block text-[10px]">Exec Time:</span><span className="text-emerald-400 font-bold">{pipeline.execTime}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Tokens Used:</span><span className="text-purple-400 font-bold">{pipeline.tokens}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Memory:</span><span className="text-blue-400 font-bold">{pipeline.mem}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">CPU Usage:</span><span className="text-amber-400 font-bold">{pipeline.cpu}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#232736]">
                <button onClick={() => setToastMessage(`Paused pipeline "${pipeline.name}"`)} className="bg-[#181a26] text-amber-400 hover:bg-amber-600 hover:text-white p-2 rounded-xl border border-[#2d3248] text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-pointer"><Pause className="w-3.5 h-3.5" /> Pause</button>
                <button onClick={() => setToastMessage(`Stopped pipeline "${pipeline.name}"`)} className="bg-[#181a26] text-rose-400 hover:bg-rose-600 hover:text-white p-2 rounded-xl border border-[#2d3248] text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-pointer"><StopCircle className="w-3.5 h-3.5" /> Stop</button>
                <button onClick={() => setToastMessage(`Opening debug inspector for "${pipeline.name}"`)} className="bg-[#181a26] text-purple-400 hover:bg-purple-600 hover:text-white p-2 rounded-xl border border-[#2d3248] text-xs font-bold flex-1 flex items-center justify-center gap-1 cursor-pointer"><Bug className="w-3.5 h-3.5" /> Debug</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKFLOW DRAFTS PAGE */}
      {/* ========================================================================= */}
      {activeTab === "draft" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "PostgreSQL Migration & WAL Archiver", created: "2d ago", edited: "10m ago", comp: 65, missing: "S3 Bucket Credentials", estRun: "~2.4s", autosave: "Saved 1m ago", aiSuggestion: "Add retry block for database connection timeout." },
            { name: "Multi-Agent Code Review & Refactor Bot", created: "4d ago", edited: "1h ago", comp: 80, missing: "GitHub Webhook Secret", estRun: "~1.1s", autosave: "Saved 5m ago", aiSuggestion: "Use Claude 3.5 Sonnet instead of GPT-4o for 30% speedup." },
            { name: "Customer Churn Prediction Engine", created: "1w ago", edited: "2d ago", comp: 40, missing: "Qdrant Vector Index", estRun: "~3.8s", autosave: "Saved 2d ago", aiSuggestion: "Connect Redis cache for top queries." },
          ].map((draft, idx) => (
            <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-[#232736] pb-2">
                  <h3 className="text-sm font-bold text-white">{draft.name}</h3>
                  <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{draft.comp}% Complete</span>
                </div>

                <div className="flex flex-col gap-2 mt-3 text-xs font-mono text-slate-300">
                  <div className="flex justify-between text-[11px]"><span>Missing Setup:</span><span className="text-rose-400 font-bold">{draft.missing}</span></div>
                  <div className="flex justify-between text-[11px]"><span>Estimated Runtime:</span><span className="text-purple-300 font-bold">{draft.estRun}</span></div>
                  <div className="flex justify-between text-[10px] text-slate-400"><span>Edited {draft.edited}</span><span className="text-emerald-400 font-bold">{draft.autosave}</span></div>

                  <div className="p-3 bg-[#0d0e14] rounded-xl border border-purple-500/30 text-[11px] text-purple-300 flex items-start gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span><strong>AI Suggestion:</strong> {draft.aiSuggestion}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#232736]">
                <button onClick={() => { setActiveTab("all"); setToastMessage(`Editing draft "${draft.name}"`); }} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex-1 text-center cursor-pointer">Continue Editing</button>
                <button onClick={() => setToastMessage(`Deleted draft "${draft.name}"`)} className="bg-[#181a26] text-rose-400 p-2 rounded-xl border border-[#2d3248]"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SCHEDULED JOBS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "scheduled" && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {["All", "Hourly", "Daily", "Weekly", "Monthly", "Custom Cron"].map(f => (
                <button key={f} onClick={() => setScheduledFilter(f)} className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer ${scheduledFilter === f ? "bg-purple-600 text-white" : "bg-[#0d0e14] text-slate-400 hover:text-white"}`}>{f}</button>
              ))}
            </div>
            <span className="text-slate-400 font-mono text-[11px]">Timezone: UTC (Coordinated Universal Time)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "PostgreSQL Database Backup", cron: "0 0 * * *", nextRun: "In 5 hours", prevRun: "19 hours ago", avgRuntime: "3.1s", success: "100%" },
              { name: "Weekly Executive Revenue Digest", cron: "0 9 * * 1", nextRun: "In 2 days", prevRun: "5 days ago", avgRuntime: "2.4s", success: "99.2%" },
              { name: "Cache Invalidation & Cleanup", cron: "*/30 * * * *", nextRun: "In 12 minutes", prevRun: "18 minutes ago", avgRuntime: "140ms", success: "100%" },
            ].map((sched, idx) => (
              <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center justify-between border-b border-[#232736] pb-2">
                    <h3 className="text-sm font-bold text-white">{sched.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">{sched.cron}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-3 text-xs font-mono text-slate-300 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                    <div className="flex justify-between"><span>Next Execution:</span><span className="text-emerald-400 font-bold">{sched.nextRun}</span></div>
                    <div className="flex justify-between"><span>Previous Run:</span><span className="text-slate-400">{sched.prevRun}</span></div>
                    <div className="flex justify-between"><span>Avg Runtime:</span><span className="text-purple-400 font-bold">{sched.avgRuntime}</span></div>
                    <div className="flex justify-between"><span>Success Rate:</span><span className="text-blue-400 font-bold">{sched.success}</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                  <button onClick={() => setToastMessage(`Triggered manual run for "${sched.name}"`)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer">Run Now</button>
                  <button onClick={() => setToastMessage(`Paused schedule "${sched.name}"`)} className="bg-[#181a26] text-amber-400 px-3 py-1.5 rounded-xl border border-[#2d3248] text-xs font-bold cursor-pointer">Pause</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WORKFLOW MARKETPLACE */}
      {/* ========================================================================= */}
      {activeTab === "templates" && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
              {["All Categories", "AI", "DevOps", "CRM", "Marketing", "HR", "Finance", "Customer Support", "Engineering", "Security", "Data Science"].map(cat => (
                <button key={cat} onClick={() => setMarketplaceCategory(cat)} className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap cursor-pointer ${marketplaceCategory === cat ? "bg-purple-600 text-white" : "bg-[#0d0e14] text-slate-400 hover:text-white"}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "AI Customer Support Triage Pipeline", cat: "Customer Support", diff: "Intermediate", est: "380ms", author: "ForgeAI Team", downloads: "4.8k", rating: "4.9 ⭐", desc: "Auto-triages support tickets with Claude 3.5 Sonnet & dispatches resolution alerts to Slack." },
              { name: "GitHub CI/CD & OWASP Vulnerability Scan", cat: "DevOps", diff: "Advanced", est: "1.2s", author: "Marcus V.", downloads: "3.2k", rating: "4.8 ⭐", desc: "Compiles Rust/Next.js code and executes automated security vulnerability scanning." },
              { name: "Qdrant RAG Vector Knowledge Ingestion", cat: "AI & Data Science", diff: "Beginner", est: "420ms", author: "Alex R.", downloads: "6.1k", rating: "5.0 ⭐", desc: "Parses PDF & Markdown documents into 1,536-dim embeddings for vector DB retrieval." },
            ].map((tmpl, idx) => (
              <div key={idx} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-xl transition-all">
                <div>
                  <div className="flex items-center justify-between border-b border-[#232736] pb-2">
                    <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{tmpl.name}</h3>
                    <span className="text-[10px] text-purple-300 font-mono font-bold">{tmpl.rating}</span>
                  </div>

                  <p className="text-xs text-slate-300 my-3 bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232] leading-relaxed">{tmpl.desc}</p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Downloads: <strong className="text-emerald-400">{tmpl.downloads}</strong></span>
                    <span>Level: <strong className="text-purple-300">{tmpl.diff}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#232736]">
                  <button onClick={() => setToastMessage(`Installed template "${tmpl.name}"`)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex-1 text-center cursor-pointer">Install Template</button>
                  <button onClick={() => setToastMessage(`Cloned template "${tmpl.name}"`)} className="bg-[#181a26] text-slate-300 p-2 rounded-xl border border-[#2d3248]"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: EXECUTION HISTORY DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#232736] flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2"><History className="w-4 h-4 text-purple-400" /> Audit Execution History</span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              {["Today", "Yesterday", "Week", "Month"].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} className={`px-2.5 py-1 rounded-lg ${historyFilter === f ? "bg-purple-600 text-white font-bold" : "text-slate-400"}`}>{f}</button>
              ))}
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0d0e14] text-slate-400 uppercase text-[10px] border-b border-[#232736]">
                <th className="p-3">Exec ID</th>
                <th className="p-3">Workflow Name</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Status</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Tokens</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232736]">
              {[
                { id: "exec-9421", name: "Stripe Webhook RAG Ingestion", dur: "420ms", status: "Success 🟢", cost: "$0.004", tokens: "480 tokens" },
                { id: "exec-9420", name: "GitHub Automated CI/CD Audit", dur: "1.2s", status: "Success 🟢", cost: "$0.002", tokens: "890 tokens" },
                { id: "exec-9419", name: "Zendesk Support Auto-Reply Bot", dur: "340ms", status: "Success 🟢", cost: "$0.006", tokens: "1,240 tokens" },
              ].map((h) => (
                <tr key={h.id} className="hover:bg-[#181a26]">
                  <td className="p-3 font-bold text-purple-300">{h.id}</td>
                  <td className="p-3 font-sans font-bold text-white">{h.name}</td>
                  <td className="p-3 text-emerald-400">{h.dur}</td>
                  <td className="p-3 text-emerald-400">{h.status}</td>
                  <td className="p-3 text-amber-400">{h.cost}</td>
                  <td className="p-3 text-blue-400">{h.tokens}</td>
                  <td className="p-3 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setToastMessage(`Replayed execution ${h.id}`)} className="text-purple-400 hover:underline font-bold">Replay</button>
                    <button onClick={() => setToastMessage(`Downloaded logs for ${h.id}`)} className="text-slate-400 hover:text-white">Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: LIVE EXECUTIONS STREAMING DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "executions" && (
        <LiveWorkflowMonitor />
      )}

      {/* ========================================================================= */}
      {/* TAB 8: WORKFLOW ANALYTICS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-1 shadow-md"><span className="text-slate-400 font-sans">Total Workflows</span><h3 className="text-2xl font-bold text-white">48 Pipelines</h3></div>
          <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-1 shadow-md"><span className="text-slate-400 font-sans">Total Executions</span><h3 className="text-2xl font-bold text-purple-400">142.5K Runs</h3></div>
          <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-1 shadow-md"><span className="text-slate-400 font-sans">Success Rate</span><h3 className="text-2xl font-bold text-emerald-400">99.8%</h3></div>
          <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-1 shadow-md"><span className="text-slate-400 font-sans">Monthly Cost</span><h3 className="text-2xl font-bold text-amber-400">$42.80</h3></div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT WORKFLOW JSON */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleImportWorkflow} className="bg-[#141620] border border-[#232736] rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" /> Import Workflow JSON Specification
              </h3>
              <button onClick={() => setShowImportModal(false)} type="button" className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={6}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste n8n, Zapier, or ForgeAI Workflow JSON schema here..."
              className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
            />

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              Import and Load to Canvas
            </button>
          </form>
        </div>
      )}

    </div>
  )
}

export default function WorkflowsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-slate-400 font-mono text-xs">Loading Workflows Studio...</div>}>
      <WorkflowsPageContent />
    </React.Suspense>
  )
}
