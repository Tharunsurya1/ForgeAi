"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  File,
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
  FileSpreadsheet,
  ImageIcon,
  Video,
  Music,
  Archive,
  HardDrive,
  FolderPlus,
  Grid,
  List,
  Zap,
} from "lucide-react"

export default function FilesPage() {
  const router = useRouter()

  // Navigation Tab State (8 Tabs)
  const [activeTab, setActiveTab] = useState<
    "all" | "recent" | "favorites" | "shared" | "starred" | "trash" | "versions" | "analytics"
  >("all")

  // View Mode State (Grid vs List)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Files")

  // Live Toast & Interactive State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isOrganizing, setIsOrganizing] = useState(false)

  // Demo Files List
  const [files, setFiles] = useState([
    {
      id: "f-1",
      name: "ForgeAI HNSW Vector Cluster Architecture.pdf",
      ext: ".pdf",
      size: "4.8 MB",
      type: "Documents",
      project: "Neural Engine v3",
      owner: "Tharun (Admin)",
      modified: "10m ago",
      starred: true,
      icon: FileSpreadsheet,
      aiSummary: "AI OCR Summary: Technical blueprint for 10M dense vector search cluster with < 12ms p99 SLA.",
      tags: ["architecture", "vector-db", "pdf"],
    },
    {
      id: "f-2",
      name: "vector_search_engine_v3.rs",
      ext: ".rs",
      size: "142 KB",
      type: "Code",
      project: "Vector DB Pipeline",
      owner: "Alex Developer",
      modified: "1h ago",
      starred: true,
      icon: FileCode,
      aiSummary: "AI Code Analysis: High-performance lock-free HNSW implementation in Rust using Tokio async runtime.",
      tags: ["rust", "vector-search", "backend"],
    },
    {
      id: "f-3",
      name: "Q4 2026 Enterprise Financial Forecast.xlsx",
      ext: ".xlsx",
      size: "2.4 MB",
      type: "Datasets",
      project: "Finance",
      owner: "Sarah K.",
      modified: "3h ago",
      starred: false,
      icon: FileSpreadsheet,
      aiSummary: "AI Data Analysis: Financial revenue projections model showing 142% MoM enterprise growth.",
      tags: ["finance", "excel", "q4-budget"],
    },
    {
      id: "f-4",
      name: "UI Glassmorphism Design Tokens.json",
      ext: ".json",
      size: "85 KB",
      type: "Code",
      project: "Support Agent Hub",
      owner: "Marcus V.",
      modified: "1d ago",
      starred: false,
      icon: FileCode,
      aiSummary: "AI Design Tokens: HSL color schemes, 20px rounded card borders, and blur gradient tokens for UI Studio.",
      tags: ["design-tokens", "tailwind", "ui"],
    },
    {
      id: "f-5",
      name: "OWASP Top 10 Audit Walkthrough.mp4",
      ext: ".mp4",
      size: "185 MB",
      type: "Video",
      project: "Security Audit",
      owner: "Marcus V.",
      modified: "2d ago",
      starred: true,
      icon: Video,
      aiSummary: "AI Video Transcript: Full screen recording detailing JWT token rotation, CORS configuration, & SQL sanitization.",
      tags: ["security", "owasp", "video"],
    },
    {
      id: "f-6",
      name: "ForgeAI Brand Guidelines Logo Asset.svg",
      ext: ".svg",
      size: "420 KB",
      type: "Images",
      project: "Design System",
      owner: "Alex Developer",
      modified: "3d ago",
      starred: false,
      icon: ImageIcon,
      aiSummary: "AI Vision Analysis: High-resolution vector emblem with purple/blue gradient accents and glassmorphism glow.",
      tags: ["logo", "svg", "branding"],
    },
  ])

  // Handle AI Organize Files
  const handleAIOrganize = () => {
    setIsOrganizing(true)
    setToastMessage("🤖 AI Agent is scanning file metadata, auto-tagging, & grouping into semantic folders...")

    setTimeout(() => {
      setIsOrganizing(false)
      setToastMessage("✨ 142 files automatically categorized into Projects & Tags!")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1500)
  }

  // Handle Toggle Starred
  const toggleStar = (id: string) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, starred: !f.starred } : f)))
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
              <File className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI File Management</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Store, organize, search and manage all project files in one intelligent workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleAIOrganize}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>AI Organize Files</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload Files</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <FolderPlus className="w-4 h-4 text-purple-400" />
            <span>New Folder</span>
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
      {/* 8 TOP NAVIGATION TABS & VIEW MODE TOGGLE */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar text-xs font-semibold">
          {[
            { id: "all", label: "All Files", count: files.length },
            { id: "recent", label: "Recent", count: null },
            { id: "favorites", label: "Starred", count: files.filter(f => f.starred).length },
            { id: "shared", label: "Shared With Me", count: 3 },
            { id: "trash", label: "Trash", count: 0 },
            { id: "versions", label: "Version History", count: null },
            { id: "analytics", label: "Storage Analytics", count: null },
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

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0d0e14] border border-[#262a3c] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: FILE CARDS GRID OR TABLE VIEW) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files by name, tags, or content..."
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar font-medium">
              {["All Files", "Documents", "Code", "Datasets", "Images", "Video"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat ? "bg-purple-600 text-white font-bold" : "bg-[#0d0e14] border border-[#262a3c] text-slate-300 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FILE CARDS GRID VIEW */}
          {/* ========================================================================= */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files
                .filter(f => activeTab === "all" || (activeTab === "favorites" && f.starred))
                .filter(f => selectedCategory === "All Files" || f.type === selectedCategory)
                .filter(f => searchQuery === "" || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((file) => {
                  const Icon = file.icon || FileText
                  return (
                    <div key={file.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-[160px]">{file.name}</h3>
                            <span className="text-[10px] text-purple-300 font-mono">{file.ext} • {file.size}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleStar(file.id)}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                        >
                          <Star className={`w-4 h-4 ${file.starred ? "text-amber-400 fill-amber-400" : ""}`} />
                        </button>
                      </div>

                      {/* AI Summary Box */}
                      <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                        {file.aiSummary}
                      </p>

                      {/* Tags & Project */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-purple-300">{file.project}</span>
                        <span>Modified {file.modified}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                        <button
                          onClick={() => {
                            setToastMessage(`Opening file preview for "${file.name}"...`)
                            setTimeout(() => setToastMessage(null), 3000)
                          }}
                          className="bg-[#181a26] hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Preview File
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Download className="w-3.5 h-3.5" /></button>
                          <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Share2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                    </div>
                  )
                })}
            </div>
          ) : (
            /* ========================================================================= */
            /* FILE TABLE VIEW */
            /* ========================================================================= */
            <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0d0e14] text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-[#232736]">
                    <th className="p-4">Filename</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Modified</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232736]">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-[#181a26] transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span>{file.name}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{file.project}</td>
                      <td className="p-4 text-slate-300">{file.owner}</td>
                      <td className="p-4 text-purple-300 font-mono">{file.size}</td>
                      <td className="p-4 text-slate-400 font-mono">{file.modified}</td>
                      <td className="p-4 text-right">
                        <button className="text-purple-400 hover:underline font-bold">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (STORAGE TELEMETRY & CLOUD INTEGRATIONS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Storage Telemetry */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> Storage Usage</span>
              <span className="text-[10px] text-emerald-400 font-mono">14.2% Used</span>
            </h4>

            {/* Storage Progress Bar */}
            <div className="w-full bg-[#0d0e14] h-2.5 rounded-full overflow-hidden border border-[#232736]">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full w-[14%]" />
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Used Storage:</span>
                <span className="text-purple-400 font-bold">142.5 GB</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Capacity:</span>
                <span className="text-white font-bold">1.0 TB</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Total Files:</span>
                <span className="text-emerald-400 font-bold">1,420 Files</span>
              </div>
            </div>
          </div>

          {/* Cloud Storage Integrations */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Cloud Integrations</span>
              <span className="text-[10px] text-slate-400 font-mono">Shortcuts</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Connect AWS S3 Bucket", icon: Database },
                { name: "Import Google Drive", icon: HardDrive },
                { name: "Connect Vercel Storage", icon: Globe },
                { name: "Connect Dropbox Enterprise", icon: Folder },
              ].map((qa, idx) => {
                const Icon = qa.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setToastMessage(`Connecting cloud storage: "${qa.name}"...`)
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
