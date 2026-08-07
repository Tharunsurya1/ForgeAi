"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
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
  ShieldCheck,
  Zap,
  Users,
  Eye,
  ChevronDown,
  X,
  Upload,
  Activity,
  Sliders,
  ExternalLink,
  Key,
  RefreshCw,
  Server,
  DollarSign,
  FileText,
  Terminal,
} from "lucide-react"

export default function AIModelsPage() {
  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "available" | "apis" | "local" | "finetuned" | "comparison" | "limits"
  >("available")

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("")
  const [providerFilter, setProviderFilter] = useState("All Providers")
  const [statusFilter, setStatusFilter] = useState("All Statuses")

  // Modal / Action States
  const [activeDefaultModel, setActiveDefaultModel] = useState("Claude 3.5 Sonnet")
  const [localModelRunning, setLocalModelRunning] = useState<Record<string, boolean>>({
    "loc-1": true,
    "loc-2": false,
  })

  // SECTION 1: Available Cloud & Foundation Models
  const availableModels = [
    {
      id: "m1",
      provider: "Anthropic",
      logo: "🟣",
      name: "Claude 3.5 Sonnet",
      version: "v2.0 (20241022)",
      context: "200k tokens",
      inputCost: "$3.00",
      outputCost: "$15.00",
      speed: "Very Fast (115 t/s)",
      quality: 4.9,
      multimodal: true,
      functions: true,
      status: "Live & Active",
      category: "Reasoning & Coding",
    },
    {
      id: "m2",
      provider: "OpenAI",
      logo: "🟢",
      name: "GPT-4o",
      version: "2024-08-06",
      context: "128k tokens",
      inputCost: "$2.50",
      outputCost: "$10.00",
      speed: "Fast (98 t/s)",
      quality: 4.9,
      multimodal: true,
      functions: true,
      status: "Connected",
      category: "Multimodal General",
    },
    {
      id: "m3",
      provider: "DeepSeek",
      logo: "🔵",
      name: "DeepSeek V3 / R1",
      version: "v3.1-671B",
      context: "128k tokens",
      inputCost: "$0.55",
      outputCost: "$2.19",
      speed: "Fast (85 t/s)",
      quality: 4.8,
      multimodal: false,
      functions: true,
      status: "Connected",
      category: "Math & Deep Reasoning",
    },
    {
      id: "m4",
      provider: "Google",
      logo: "🔴",
      name: "Gemini 1.5 Pro",
      version: "002 Stable",
      context: "2,000k tokens (2M)",
      inputCost: "$1.25",
      outputCost: "$5.00",
      speed: "Moderate (62 t/s)",
      quality: 4.7,
      multimodal: true,
      functions: true,
      status: "Connected",
      category: "Long Context & Video",
    },
    {
      id: "m5",
      provider: "Meta",
      logo: "🔷",
      name: "Llama 3.1 405B",
      version: "Instruct FP8",
      context: "128k tokens",
      inputCost: "$1.00",
      outputCost: "$3.00",
      speed: "Blazing (140 t/s on Groq)",
      quality: 4.8,
      multimodal: false,
      functions: true,
      status: "Available",
      category: "Open Weights Flagship",
    },
    {
      id: "m6",
      provider: "Groq",
      logo: "⚡",
      name: "Llama 3.3 70B Versatile",
      version: "Groq LPU Acceleration",
      context: "128k tokens",
      inputCost: "$0.59",
      outputCost: "$0.79",
      speed: "Ultra-Fast (380 t/s)",
      quality: 4.7,
      multimodal: false,
      functions: true,
      status: "Connected",
      category: "Ultra-Low Latency",
    },
  ]

  // SECTION 2: Connected Provider API Keys & Status
  const connectedAPIs = [
    {
      provider: "Anthropic Console",
      logo: "🟣",
      status: "HEALTHY",
      keyStatus: "Active (sk-ant-api03...)",
      region: "us-east-1 (Global)",
      modelsCount: 4,
      requestsToday: "142,850",
      lastSynced: "Just now",
    },
    {
      provider: "OpenAI Platform",
      logo: "🟢",
      status: "HEALTHY",
      keyStatus: "Active (sk-proj-992...)",
      region: "global-auto",
      modelsCount: 8,
      requestsToday: "98,400",
      lastSynced: "2m ago",
    },
    {
      provider: "DeepSeek Cloud API",
      logo: "🔵",
      status: "HEALTHY",
      keyStatus: "Active (sk-ds-3829...)",
      region: "asia-east",
      modelsCount: 2,
      requestsToday: "41,200",
      lastSynced: "5m ago",
    },
    {
      provider: "Google AI Studio / Vertex",
      logo: "🔴",
      status: "DEGRADED",
      keyStatus: "Active (AIzaSyD8...)",
      region: "us-central1",
      modelsCount: 3,
      requestsToday: "12,100",
      lastSynced: "12m ago",
    },
  ]

  // SECTION 3: Local Hardware Models (Ollama / vLLM)
  const localModels = [
    {
      id: "loc-1",
      name: "Llama 3.1 70B Instruct",
      provider: "Ollama Local",
      size: "39.4 GB",
      ramUsage: "42.1 GB",
      vram: "48 GB (2x RTX 4090)",
      port: "http://localhost:11434",
      progress: "100% Downloaded",
    },
    {
      id: "loc-2",
      name: "DeepSeek R1 Distill Qwen 14B",
      provider: "vLLM Server",
      size: "8.8 GB",
      ramUsage: "0.0 GB (Stopped)",
      vram: "12 GB VRAM",
      port: "http://localhost:8000",
      progress: "100% Downloaded",
    },
    {
      id: "loc-3",
      name: "Mistral NeMo 12B Instruct",
      provider: "Ollama Local",
      size: "7.1 GB",
      ramUsage: "0.0 GB (Stopped)",
      vram: "8 GB VRAM",
      port: "http://localhost:11434",
      progress: "100% Downloaded",
    },
  ]

  // SECTION 4: Custom Fine-tuned Models
  const finetunedModels = [
    {
      name: "ForgeAI-CodeRefactor-v2",
      baseModel: "Llama 3.1 70B Instruct",
      dataset: "12,500 Rust/TS code pairs",
      date: "2026-07-18",
      accuracy: "98.6%",
      owner: "Tharun",
      status: "Deployed (Prod)",
    },
    {
      name: "Legal-Compliance-Analyzer-v1",
      baseModel: "GPT-4o Mini",
      dataset: "4,200 NDA & SLA contracts",
      date: "2026-06-28",
      accuracy: "97.2%",
      owner: "Sarah K.",
      status: "Staging Evaluation",
    },
  ]

  // Toggle local model running
  const toggleLocalModel = (id: string) => {
    setLocalModelRunning(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Models Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage cloud models, local models, fine-tuned models and AI provider integrations from one centralized workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer">
            <Key className="w-4 h-4" />
            <span>Connect Provider</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Add Local Model</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TOP TABS & FILTERS BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar text-xs font-semibold">
          {[
            { id: "available", label: "Available Models", count: availableModels.length },
            { id: "apis", label: "Connected APIs", count: connectedAPIs.length },
            { id: "local", label: "Local Models", count: localModels.length },
            { id: "finetuned", label: "Fine-tuned Models", count: finetunedModels.length },
            { id: "comparison", label: "Model Comparison", count: null },
            { id: "limits", label: "Usage Limits", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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

        {/* Search & Provider Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="relative flex-1 lg:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option>All Providers</option>
            <option>Anthropic</option>
            <option>OpenAI</option>
            <option>DeepSeek</option>
            <option>Google</option>
            <option>Meta</option>
            <option>Groq</option>
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY: SECTIONS 1-6 + RIGHT TELEMETRY SIDEBAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (SECTIONS 1 TO 6) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* SECTION 1: AVAILABLE MODELS CARDS */}
          {/* ========================================================================= */}
          {activeTab === "available" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModels
                .filter(m => searchQuery === "" || m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(m => providerFilter === "All Providers" || m.provider === providerFilter)
                .map((mod) => (
                  <div
                    key={mod.id}
                    className={`p-5 bg-[#141620] border rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group ${
                      activeDefaultModel === mod.name ? "border-purple-500/80 bg-[#161826]" : "border-[#232736] hover:border-[#343b50]"
                    }`}
                  >
                    {/* Model Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-2xl flex items-center justify-center shrink-0">
                          {mod.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-tight">{mod.name}</h3>
                            {activeDefaultModel === mod.name && (
                              <span className="px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/30">
                                Default Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{mod.provider} • {mod.version}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {mod.status}
                      </span>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      <div>
                        <span className="text-slate-500 block">CONTEXT</span>
                        <span className="text-white font-bold">{mod.context}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">INPUT / OUTPUT</span>
                        <span className="text-purple-300 font-bold">{mod.inputCost} / {mod.outputCost}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SPEED</span>
                        <span className="text-emerald-400 font-bold">{mod.speed.split(" ")[0]}</span>
                      </div>
                    </div>

                    {/* Features Badges */}
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                      {mod.multimodal && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          👁️ Vision / Multimodal
                        </span>
                      )}
                      {mod.functions && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          ⚡ Function Calling
                        </span>
                      )}
                      <span className="ml-auto font-bold text-amber-400 flex items-center gap-1">
                        ⭐ {mod.quality}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                      <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 font-semibold px-3 py-1.5 rounded-xl hover:text-white transition-colors">
                        View Details
                      </button>

                      <button
                        onClick={() => setActiveDefaultModel(mod.name)}
                        className={`font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                          activeDefaultModel === mod.name
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md active:scale-95"
                        }`}
                      >
                        {activeDefaultModel === mod.name ? "Currently Active" : "Set as Default"}
                      </button>
                    </div>

                  </div>
                ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: CONNECTED APIS */}
          {/* ========================================================================= */}
          {activeTab === "apis" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedAPIs.map((api, idx) => (
                <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2232] text-xl flex items-center justify-center">{api.logo}</div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{api.provider}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{api.region} • Synced {api.lastSynced}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      api.status === "HEALTHY" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    }`}>
                      {api.status}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#1e2232] flex flex-col gap-1.5 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">API Key:</span><span className="text-slate-200">{api.keyStatus}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Models Available:</span><span className="text-purple-400 font-bold">{api.modelsCount} Models</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Requests Today:</span><span className="text-white font-bold">{api.requestsToday}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                    <button className="bg-[#181a26] border border-[#2d3248] text-slate-300 font-semibold px-3 py-1.5 rounded-xl hover:text-white">Configure</button>
                    <div className="flex items-center gap-2">
                      <button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-xl">Test Connection</button>
                      <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white"><RotateCcw className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: LOCAL MODELS (OLLAMA / VLLM) */}
          {/* ========================================================================= */}
          {activeTab === "local" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {localModels.map((loc) => {
                const isRunning = localModelRunning[loc.id]
                return (
                  <div key={loc.id} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                        <span className="text-[10px] text-purple-400 font-mono">{loc.provider}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRunning ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-slate-500/10 border border-slate-500/30 text-slate-400"
                      }`}>
                        {isRunning ? "Running" : "Stopped"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#1e2232] text-xs font-mono flex flex-col gap-1">
                      <div className="flex justify-between"><span className="text-slate-500">Size:</span><span className="text-white">{loc.size}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">RAM/VRAM:</span><span className="text-purple-300">{loc.ramUsage}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Endpoint:</span><span className="text-blue-400">{loc.port}</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                      <button
                        onClick={() => toggleLocalModel(loc.id)}
                        className={`font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                          isRunning ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isRunning ? "Stop" : "Run"}</span>
                      </button>

                      <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white">
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: FINE-TUNED MODELS */}
          {/* ========================================================================= */}
          {activeTab === "finetuned" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finetunedModels.map((ft, idx) => (
                <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col justify-between gap-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{ft.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Base: {ft.baseModel}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      {ft.status}
                    </span>
                  </div>

                  <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#1e2232] text-xs font-mono flex flex-col gap-1">
                    <div className="flex justify-between"><span className="text-slate-500">Dataset:</span><span className="text-slate-200">{ft.dataset}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Trained On:</span><span className="text-white">{ft.date}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Accuracy:</span><span className="text-emerald-400 font-bold">{ft.accuracy}</span></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                    <button className="bg-purple-600 text-white font-bold px-4 py-1.5 rounded-xl">Deploy Model</button>
                    <button className="bg-[#181a26] border border-[#2d3248] text-slate-300 font-semibold px-3 py-1.5 rounded-xl hover:text-white">Evaluate</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: MODEL COMPARISON TABLE */}
          {/* ========================================================================= */}
          {activeTab === "comparison" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Side-by-Side Model Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-[#232736]">
                      <th className="pb-3 px-2">Model</th>
                      <th className="pb-3 px-2">Context</th>
                      <th className="pb-3 px-2">Input / Output</th>
                      <th className="pb-3 px-2">Speed</th>
                      <th className="pb-3 px-2">Reasoning</th>
                      <th className="pb-3 px-2">Coding</th>
                      <th className="pb-3 px-2">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2230] font-mono">
                    {[
                      { name: "Claude 3.5 Sonnet", ctx: "200k", cost: "$3 / $15", speed: "115 t/s", reasoning: "96.4", coding: "98.2", rating: "4.9 ⭐" },
                      { name: "GPT-4o", ctx: "128k", cost: "$2.5 / $10", speed: "98 t/s", reasoning: "95.1", coding: "96.0", rating: "4.9 ⭐" },
                      { name: "DeepSeek V3", ctx: "128k", cost: "$0.55 / $2.19", speed: "85 t/s", reasoning: "94.8", coding: "95.5", rating: "4.8 ⭐" },
                      { name: "Gemini 1.5 Pro", ctx: "2,000k", cost: "$1.25 / $5", speed: "62 t/s", reasoning: "92.0", coding: "91.4", rating: "4.7 ⭐" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#191c28]">
                        <td className="py-3 px-2 font-semibold text-white font-sans">{row.name}</td>
                        <td className="py-3 px-2 text-slate-300">{row.ctx}</td>
                        <td className="py-3 px-2 text-purple-300">{row.cost}</td>
                        <td className="py-3 px-2 text-emerald-400">{row.speed}</td>
                        <td className="py-3 px-2 text-slate-200">{row.reasoning}</td>
                        <td className="py-3 px-2 text-blue-400">{row.coding}</td>
                        <td className="py-3 px-2 font-bold text-amber-400">{row.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: USAGE LIMITS & DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "limits" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Monthly Spend</span>
                  <h4 className="text-2xl font-bold text-white mt-1">$1,248.50</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Budget: $2,000.00</span>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Remaining Tokens</span>
                  <h4 className="text-2xl font-bold text-purple-400 mt-1">115.8M</h4>
                  <span className="text-[10px] text-emerald-400 font-mono">quota status: OK</span>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Rate Limit (RPM)</span>
                  <h4 className="text-2xl font-bold text-blue-400 mt-1">10,000 req/m</h4>
                </div>
                <div className="bg-[#141620] border border-[#232736] p-4 rounded-2xl">
                  <span className="text-xs text-slate-400">Active API Keys</span>
                  <h4 className="text-2xl font-bold text-emerald-400 mt-1">4 Connected</h4>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (STICKY TELEMETRY COLUMN) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Currently Active Default Model */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> Active Model</span>
              <span className="text-[10px] text-emerald-400 font-mono">Primary</span>
            </h4>
            <div className="p-3 bg-[#0d0e14] rounded-xl border border-purple-500/30 flex flex-col gap-1 text-xs">
              <span className="font-bold text-white">{activeDefaultModel}</span>
              <span className="text-[11px] text-slate-400 font-mono">Routing 78% workspace queries</span>
            </div>
          </div>

          {/* Connected Providers Telemetry */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-blue-400" /> Provider Status</span>
              <span className="text-[10px] text-slate-400 font-mono">4 Online</span>
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { name: "Anthropic", latency: "115ms", status: "Optimal" },
                { name: "OpenAI", latency: "98ms", status: "Optimal" },
                { name: "DeepSeek", latency: "140ms", status: "Optimal" },
                { name: "Google Vertex", latency: "210ms", status: "Degraded" },
              ].map((p, idx) => (
                <div key={idx} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between font-mono">
                  <span className="text-white font-sans font-semibold">{p.name}</span>
                  <span className={`text-[10px] ${p.status === "Optimal" ? "text-emerald-400" : "text-amber-400"}`}>{p.latency}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
