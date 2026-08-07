"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Database,
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
  FileSpreadsheet,
  FileCheck,
  ImageIcon,
  Video,
  Link as LinkIcon,
  GitBranch,
  BookOpen,
  HelpCircle,
  HardDrive,
  FolderPlus,
} from "lucide-react"

export default function KnowledgeBasePage() {
  const router = useRouter()

  // Active Navigation Tab State (12 Tabs)
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "documents"
    | "pdfs"
    | "images"
    | "videos"
    | "urls"
    | "codebase"
    | "notes"
    | "wikis"
    | "collections"
    | "semantic"
    | "embeddings"
  >("all")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [semanticQuery, setSemanticQuery] = useState(
    "What is our system SLA for vector search latency at p99?"
  )
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Demo Knowledge Items List
  const [knowledgeItems, setKnowledgeItems] = useState([
    {
      id: "k-1",
      title: "ForgeAI HNSW Vector Architecture Spec.pdf",
      type: "PDF",
      category: "Engineering",
      size: "4.2 MB",
      chunks: "420 Chunks",
      updated: "10m ago",
      author: "Tharun (Admin)",
      indexed: true,
      icon: FileText,
      preview: "Technical specification for 10M vector search cluster with < 12ms p99 SLA and lock-free HNSW implementation.",
    },
    {
      id: "k-2",
      title: "github.com/forgeai/core-microservices",
      type: "Codebase",
      category: "Repository",
      size: "18.4 MB",
      chunks: "1,240 Files",
      updated: "1h ago",
      author: "Alex Developer",
      indexed: true,
      icon: GitBranch,
      preview: "Rust & Next.js 15 repository containing Tokio gRPC endpoints, Prisma database schemas, & Tailwind design tokens.",
    },
    {
      id: "k-3",
      title: "Sprint 24 Architectural Decision Records (ADR).docx",
      type: "Document",
      category: "Architecture",
      size: "1.8 MB",
      chunks: "180 Chunks",
      updated: "3h ago",
      author: "Sarah K.",
      indexed: true,
      icon: FileSpreadsheet,
      preview: "ADR-04: Decision to adopt Qdrant & Pinecone as dual hybrid vector databases with automatic failover.",
    },
    {
      id: "k-4",
      title: "https://docs.forgeai.dev/api/v1/vectors/search",
      type: "URL",
      category: "API Docs",
      size: "320 KB",
      chunks: "45 Chunks",
      updated: "1d ago",
      author: "System Sync",
      indexed: true,
      icon: LinkIcon,
      preview: "Auto-synced API documentation defining REST vector search endpoints, authentication headers, and response payloads.",
    },
    {
      id: "k-5",
      title: "OWASP Vulnerability Audit Video Demo.mp4",
      type: "Video",
      category: "Security",
      size: "142 MB",
      chunks: "85 Chapters",
      updated: "2d ago",
      author: "Marcus V.",
      indexed: true,
      icon: Video,
      preview: "Screen recording transcript detailing OWASP top 10 audit findings, JWT secret scanning, & mitigation steps.",
    },
    {
      id: "k-6",
      title: "Company Security Policy & Compliance Wiki",
      type: "Wiki",
      category: "Company Policies",
      size: "850 KB",
      chunks: "95 Pages",
      updated: "3d ago",
      author: "Tharun (Admin)",
      indexed: true,
      icon: BookOpen,
      preview: "Internal security guidelines, SOC2 compliance procedures, & employee data retention rules.",
    },
  ])

  // Handle AI Semantic Search Answer Generation
  const handleSemanticSearch = () => {
    setIsSearching(true)
    setAiAnswer(null)
    setToastMessage("🧠 Querying 1,420 indexed vector chunks in Qdrant & Pinecone...")

    setTimeout(() => {
      setIsSearching(false)
      setAiAnswer(
        "Based on document **ForgeAI HNSW Vector Architecture Spec.pdf** (Section 3.2), our SLA target for vector search latency is **< 12ms at p99** for 10,000,000 dense 1536-dimensional embeddings, backed by a 3-node lock-free Rust cluster."
      )
      setToastMessage("✅ Relevant knowledge retrieved from 4 sources in 85ms!")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1200)
  }

  // Handle Vector Re-Indexing
  const handleReindex = () => {
    setToastMessage("⚡ Re-indexing 142,850 vector embeddings across active workspace nodes...")
    setTimeout(() => {
      setToastMessage("✅ Vector index 100% updated & healthy!")
      setTimeout(() => setToastMessage(null), 3000)
    }, 1500)
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
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Knowledge Base</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Store, organize, search and reuse all your knowledge with AI-powered semantic search.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab("semantic")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>+ Upload Knowledge</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <FolderPlus className="w-4 h-4 text-purple-400" />
            <span>Create Collection</span>
          </button>

          <button
            onClick={handleReindex}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>AI Index</span>
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
      {/* 12 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "all", label: "All Knowledge", icon: Database },
            { id: "documents", label: "Documents", icon: FileText },
            { id: "pdfs", label: "PDFs", icon: FileSpreadsheet },
            { id: "images", label: "Images", icon: ImageIcon },
            { id: "videos", label: "Videos", icon: Video },
            { id: "urls", label: "URLs & Web", icon: LinkIcon },
            { id: "codebase", label: "Codebase Repos", icon: GitBranch },
            { id: "notes", label: "Notes", icon: Edit3 },
            { id: "wikis", label: "Company Wikis", icon: BookOpen },
            { id: "collections", label: "Collections", icon: Folder },
            { id: "semantic", label: "Semantic Search", icon: Sparkles },
            { id: "embeddings", label: "Embeddings Status", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: SEMANTIC SEARCH PANEL & KNOWLEDGE CARDS) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* AI SEMANTIC VECTOR SEARCH PANEL */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#232736]">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Natural Language Vector Search
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Hybrid Vector Indexing Active
              </span>
            </div>

            {/* Semantic Query Box */}
            <div className="relative">
              <input
                type="text"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                placeholder="Ask your Knowledge Base anything (e.g. 'What is our SLA for vector search latency?')..."
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-4 pr-24 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
              />
              <button
                disabled={isSearching}
                onClick={handleSemanticSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
              >
                {isSearching ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </div>

            {/* AI Generated Answer Card */}
            {aiAnswer && (
              <div className="p-4 bg-[#0d0e14] border border-purple-500/30 rounded-xl flex flex-col gap-2 leading-relaxed text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  💡 AI Retrieved Answer:
                </span>
                <p className="text-slate-200">{aiAnswer}</p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* KNOWLEDGE ITEMS CARDS GRID */}
          {/* ========================================================================= */}
          {activeTab !== "embeddings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeItems
                .filter(k => searchQuery === "" || k.title.toLowerCase().includes(searchQuery.toLowerCase()) || k.preview.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(k => activeTab === "all" || activeTab === "semantic" || k.type.toLowerCase().includes(activeTab.slice(0, 4)))
                .map((item) => {
                  const Icon = item.icon || FileText
                  return (
                    <div key={item.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">{item.title}</h3>
                            <span className="text-[10px] text-purple-300 font-mono">{item.type} • {item.category}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Indexed
                        </span>
                      </div>

                      {/* Preview Box */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        {item.preview}
                      </p>

                      {/* Footer Specs */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-[#232736] pt-3">
                        <span>{item.chunks}</span>
                        <span>Size: {item.size}</span>
                        <span>Updated: {item.updated}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button className="bg-[#181a26] hover:bg-purple-600 border border-[#2d3248] text-slate-200 hover:text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer">
                          Preview & Insights
                        </button>
                        <div className="flex items-center gap-2">
                          <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Copy className="w-3.5 h-3.5" /></button>
                          <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Download className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                    </div>
                  )
                })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: EMBEDDINGS & VECTOR INDEXING STATUS */}
          {/* ========================================================================= */}
          {activeTab === "embeddings" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> Vector Database & Embedding Status
                </h3>
                <button
                  onClick={handleReindex}
                  className="bg-purple-600 text-white font-bold px-4 py-1.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Index All Vectors
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2">
                  <span className="text-slate-400">Total Chunks Processed</span>
                  <h4 className="text-xl font-bold text-white">142,850 Chunks</h4>
                </div>
                <div className="p-4 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2">
                  <span className="text-slate-400">Vector Storage Size</span>
                  <h4 className="text-xl font-bold text-purple-400">1.2 GB (Qdrant)</h4>
                </div>
                <div className="p-4 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-2">
                  <span className="text-slate-400">Index Health</span>
                  <h4 className="text-xl font-bold text-emerald-400">100% Healthy</h4>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (KNOWLEDGE TELEMETRY & QUICK ACTIONS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Knowledge Statistics */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-purple-400" /> Knowledge Telemetry</span>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Documents:</span>
                <span className="text-white font-bold">1,420 Files</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Indexed Vectors:</span>
                <span className="text-purple-400 font-bold">142,850</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Storage Used:</span>
                <span className="text-blue-400 font-bold">4.8 GB</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Integrations</span>
              <span className="text-[10px] text-slate-400 font-mono">Shortcuts</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Connect GitHub Repo", icon: GitBranch },
                { name: "Connect Google Drive", icon: HardDrive },
                { name: "Import Notion Workspace", icon: FileText },
                { name: "Import Confluence Wiki", icon: BookOpen },
                { name: "Auto-Sync Website Docs", icon: LinkIcon },
              ].map((qa, idx) => {
                const Icon = qa.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setToastMessage(`Connecting integration source for ${qa.name}...`)
                      setTimeout(() => setToastMessage(null), 3000)
                    }}
                    className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center gap-2 transition-all text-left cursor-pointer font-semibold"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{qa.name}</span>
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
