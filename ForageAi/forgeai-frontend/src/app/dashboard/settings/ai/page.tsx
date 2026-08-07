"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bot,
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
  DollarSign,
  TrendingUp,
  HardDrive,
  SlidersHorizontal,
} from "lucide-react"

export default function AiConfigurationPage() {
  const router = useRouter()

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // AI Controls State
  const [defaultModel, setDefaultModel] = useState("Claude 3.5 Sonnet")
  const [fallbackModel, setFallbackModel] = useState("GPT-4o Engine")
  const [temperature, setTemperature] = useState(0.2)
  const [topP, setTopP] = useState(0.9)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [reasoningLevel, setReasoningLevel] = useState("High Precision")
  const [streaming, setStreaming] = useState(true)
  const [visionEnabled, setVisionEnabled] = useState(true)

  // Handle Save
  const handleSaveAiConfig = () => {
    setToastMessage("🤖 AI Configuration & Model Routing parameters saved!")
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Engine & Model Configuration</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Tune LLM models, temperature, context windows, fallback routing, and safety parameters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSaveAiConfig}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Save AI Settings</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* MODEL ROUTING & HYPERPARAMETERS (2 COLUMNS) */}
        <div className="xl:col-span-2 flex flex-col gap-6 w-full">
          
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" /> Foundation Model Routing & Fallback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Primary Default Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer font-sans"
                >
                  <option>Claude 3.5 Sonnet</option>
                  <option>GPT-4o Engine</option>
                  <option>DeepSeek V3</option>
                  <option>Gemini 1.5 Pro</option>
                  <option>Ollama Local Hardware</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Automatic Fallback Model</label>
                <select
                  value={fallbackModel}
                  onChange={(e) => setFallbackModel(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer font-sans"
                >
                  <option>GPT-4o Engine</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>DeepSeek V3</option>
                  <option>Ollama Local</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#232736]">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Temperature (Creativity): {temperature}</label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="accent-purple-500 cursor-pointer mt-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Top P Nucleus Sampling: {topP}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(Number(e.target.value))}
                  className="accent-purple-500 cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

        </div>

        {/* LIVE COST ESTIMATOR SIDEBAR (1 COLUMN) */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3 text-xs font-mono">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] border-b border-[#232736] pb-2 flex justify-between">
              <span>Live Cost Estimator</span>
              <span className="text-emerald-400">Calculated</span>
            </h4>

            <div className="p-3 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-2">
              <div className="flex justify-between text-slate-400"><span>Model:</span><span className="text-purple-300 font-bold">{defaultModel.split(" ")[0]}</span></div>
              <div className="flex justify-between text-slate-400"><span>Est. Cost / Request:</span><span className="text-emerald-400 font-bold">$0.004</span></div>
              <div className="flex justify-between text-slate-400"><span>Context Window:</span><span className="text-blue-400 font-bold">128K Tokens</span></div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  )
}
