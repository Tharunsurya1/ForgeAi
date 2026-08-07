"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  Sparkles,
  Plus,
  Search,
  Filter,
  Folder,
  BookOpen,
  Pin,
  Share2,
  Copy,
  Trash2,
  Edit3,
  Star,
  Clock,
  Check,
  CheckCircle2,
  Tag,
  Upload,
  Activity,
  Sliders,
  Globe,
  ChevronDown,
  Users,
  Bot,
  Code2,
  Database,
  ShieldCheck,
  Zap,
  BarChart3,
  AlignLeft,
  Bold,
  Italic,
  List,
  CheckSquare,
  Heading,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Paperclip,
  Smile,
  AtSign,
  Wand2,
  File,
  MessageSquare,
  Layers,
  Lock,
  Eye,
  RefreshCw,
  FileCode,
} from "lucide-react"

export default function DocumentsPage() {
  const router = useRouter()

  // Navigation & State
  const [selectedFolder, setSelectedFolder] = useState("All Notes")
  const [activeTab, setActiveTab] = useState<"grid" | "editor" | "favorites" | "recent">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // AI Assist Toast / Loading State
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null)

  // Editor Content State
  const [editorData, setEditorData] = useState({
    title: "Distributed Vector Store Indexing Architecture",
    category: "Architecture",
    tags: "rust, vector-db, hnsw, performance",
    content: `# Distributed Vector Store Indexing Architecture

## 1. System Overview
This document specifies the technical architecture for the **ForgeAI Distributed Vector Search Cluster**. The system utilizes a lock-free HNSW (Hierarchical Navigable Small World) algorithm implemented in Rust with Tokio async runtime.

> [!NOTE]
> Latency SLA target is **< 12ms** at p99 for 10,000,000 dense 1536-dimensional embeddings.

### Key Metrics & Scaling Target
- **Dimension**: 1536 (OpenAI / Cohere compatible)
- **Concurrency**: 50,000 queries per second (QPS)
- **Replication**: 3-node raft cluster with automatic leader failover

\`\`\`rust
// Lock-free node search implementation
pub async fn search_knn(&self, query: &[f32], k: usize) -> Vec<(u64, f32)> {
    let nodes = self.nodes.read().await;
    let mut results: Vec<(u64, f32)> = nodes.iter().map(|n| {
        (n.id, cosine_similarity(query, &n.embedding))
    }).collect();
    results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    results.truncate(k);
    results
}
\`\`\`
`,
  })

  // Demo Notes List
  const [notes, setNotes] = useState([
    {
      id: "n-1",
      title: "Distributed Vector Store Indexing Architecture",
      category: "Architecture",
      author: "Tharun (Admin)",
      updated: "10m ago",
      tags: ["rust", "vector-db", "hnsw"],
      readingTime: "4 min read",
      pinned: true,
      collabs: ["TH", "AD", "SK"],
      preview: "Technical specification for the lock-free HNSW vector search cluster with < 12ms p99 latency SLA...",
      folder: "Architecture",
    },
    {
      id: "n-2",
      title: "Sprint 24 Planning & AI Agent Workflows",
      category: "Meeting Notes",
      author: "Sarah K.",
      updated: "1h ago",
      tags: ["sprint24", "agile", "crewai"],
      readingTime: "3 min read",
      pinned: true,
      collabs: ["SK", "TH"],
      preview: "Key takeaways from Monday sprint sync regarding autonomous crawler deployment & error boundaries...",
      folder: "Meeting Notes",
    },
    {
      id: "n-3",
      title: "OpenAPI 3.1 REST & gRPC API Specs",
      category: "API Documentation",
      author: "Alex Developer",
      updated: "3h ago",
      tags: ["openapi", "grpc", "protobuf"],
      readingTime: "7 min read",
      pinned: false,
      collabs: ["AD", "MV"],
      preview: "Complete endpoint definitions for model inference routing, token metering, and webhook callbacks...",
      folder: "API Documentation",
    },
    {
      id: "n-4",
      title: "OWASP Top 10 Security Audit Checklist",
      category: "Requirements",
      author: "Marcus V.",
      updated: "1d ago",
      tags: ["security", "owasp", "audit"],
      readingTime: "5 min read",
      pinned: false,
      collabs: ["MV", "TH"],
      preview: "Mandatory compliance checklist for secret scanning, JWT rotation, and SQL injection sanitization...",
      folder: "Requirements",
    },
    {
      id: "n-5",
      title: "LLM Fine-Tuning Hyperparameters & Benchmarks",
      category: "Research",
      author: "Tharun (Admin)",
      updated: "2d ago",
      tags: ["lora", "rlhf", "benchmarks"],
      readingTime: "8 min read",
      pinned: true,
      collabs: ["TH", "SK", "AD"],
      preview: "Comparative analysis of LoRA vs QLoRA rank adapters across 12,500 domain-specific training pairs...",
      folder: "Research",
    },
  ])

  // Folder List (Left Sidebar)
  const folders = [
    { name: "All Notes", count: notes.length, icon: FileText },
    { name: "Architecture", count: 2, icon: Code2 },
    { name: "Meeting Notes", count: 1, icon: Users },
    { name: "API Documentation", count: 1, icon: FileCode },
    { name: "Requirements", count: 1, icon: ShieldCheck },
    { name: "Research", count: 1, icon: Database },
    { name: "Ideas & Brainstorming", count: 4, icon: Zap },
    { name: "Daily Logs", count: 12, icon: Clock },
    { name: "Archived", count: 0, icon: Lock },
  ]

  // Simulate AI Writing Action
  const triggerAIAction = (actionName: string) => {
    setAiGenerating(true)
    setAiActionMessage(`AI Writing Assistant: Executing "${actionName}"...`)
    setTimeout(() => {
      setAiGenerating(false)
      setAiActionMessage(`Successfully executed "${actionName}"! Note updated.`)
      setTimeout(() => setAiActionMessage(null), 3000)
    }, 1200)
  }

  // Toggle Pinned Status
  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Project Knowledge Notes</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Capture ideas, meeting notes, documentation and project knowledge in one organized workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => router.push("/dashboard/documents/generator")}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>⚡ AI Doc Generator</span>
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>New Note</span>
          </button>
        </div>
      </header>

      {/* Toast Notification for AI Actions */}
      {aiActionMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{aiActionMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN BODY LAYOUT (LEFT FOLDERS SIDEBAR + MAIN CONTENT + RIGHT SIDEBAR) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

        {/* ========================================================================= */}
        {/* LEFT FOLDER NAVIGATION PANEL (1 COLUMN) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col gap-4 shadow-md select-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Folder className="w-3.5 h-3.5 text-purple-400" /> Folders</span>
            <button onClick={() => setActiveTab("editor")} className="hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
          </h3>

          <div className="flex flex-col gap-1 text-xs">
            {folders.map((f) => {
              const Icon = f.icon
              const isSelected = selectedFolder === f.name
              return (
                <button
                  key={f.name}
                  onClick={() => { setSelectedFolder(f.name); setActiveTab("grid") }}
                  className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md" : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80">{f.count}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* CENTER CONTENT COLUMN (3 COLUMNS: GRID VS EDITOR) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* TABS & SEARCH BAR */}
          <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
            
            {/* View Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar text-xs font-semibold">
              {[
                { id: "grid", label: "Note Cards", icon: FileText },
                { id: "editor", label: "Rich Note Editor", icon: Edit3 },
                { id: "favorites", label: "Pinned Favorites", icon: Star },
                { id: "recent", label: "Recently Edited", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.id
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

            {/* Search Input */}
            <div className="relative flex-1 lg:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: NOTE CARDS GRID */}
          {/* ========================================================================= */}
          {activeTab !== "editor" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes
                .filter(n => searchQuery === "" || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.preview.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(n => selectedFolder === "All Notes" || n.folder === selectedFolder)
                .filter(n => activeTab !== "favorites" || n.pinned)
                .map((n) => (
                  <div key={n.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-[#353d56] rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight">{n.title}</h3>
                        </div>
                        <span className="text-[11px] text-purple-400 font-mono mt-0.5 block">
                          {n.category} • Updated {n.updated}
                        </span>
                      </div>

                      <button
                        onClick={() => togglePin(n.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          n.pinned ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-[#181a26] border-[#2d3248] text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${n.pinned ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Preview Box */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      {n.preview}
                    </p>

                    {/* Meta: Collaborators & Tags */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        {n.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex -space-x-1.5">
                        {n.collabs.map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center border border-[#141620]">
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                      <button
                        onClick={() => {
                          setEditorData({
                            title: n.title,
                            category: n.category,
                            tags: n.tags.join(", "),
                            content: `# ${n.title}\n\n${n.preview}`,
                          })
                          setActiveTab("editor")
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Open Note
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
          {/* SECTION 2: INTERACTIVE RICH NOTE EDITOR */}
          {/* ========================================================================= */}
          {activeTab === "editor" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              
              {/* Note Title Input */}
              <input
                type="text"
                value={editorData.title}
                onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                placeholder="Untitled Note..."
                className="w-full bg-transparent text-xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight border-b border-[#232736] pb-3"
              />

              {/* EDITOR FORMATTING TOOLBAR */}
              <div className="flex items-center gap-1.5 flex-wrap bg-[#0d0e14] p-2 rounded-xl border border-[#232736]">
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><Bold className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><Italic className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><Heading className="w-3.5 h-3.5" /></button>
                <div className="w-px h-4 bg-[#232736] mx-1"></div>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><List className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><CheckSquare className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><Quote className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded hover:bg-[#1a1d2e] text-slate-300 hover:text-white"><TableIcon className="w-3.5 h-3.5" /></button>
                <div className="w-px h-4 bg-[#232736] mx-1"></div>

                {/* AI WRITING ASSISTANT TOOLBAR BUTTONS */}
                <button
                  onClick={() => triggerAIAction("Summarize Note")}
                  className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3 h-3 text-purple-400" /> Summarize
                </button>

                <button
                  onClick={() => triggerAIAction("Generate API Specs")}
                  className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-blue-400" /> Generate Docs
                </button>

                <button
                  onClick={() => triggerAIAction("Convert to Tasks")}
                  className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tasks
                </button>
              </div>

              {/* Textarea Workspace */}
              <textarea
                rows={14}
                value={editorData.content}
                onChange={(e) => setEditorData({ ...editorData, content: e.target.value })}
                className="w-full bg-[#0d0e14] border border-[#232736] rounded-xl p-4 font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed text-xs"
              />

              {/* Save & Publish Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#232736]">
                <span className="text-[11px] text-slate-400 font-mono">Word count: 342 words • 4 min read</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveTab("grid")} className="bg-[#181a26] border border-[#2d3248] text-slate-300 font-bold px-4 py-2 rounded-xl">
                    Back to Grid
                  </button>
                  <button
                    onClick={() => {
                      setNotes([
                        {
                          id: `n-${Date.now()}`,
                          title: editorData.title || "Untitled Document",
                          category: editorData.category,
                          author: "Tharun (Admin)",
                          updated: "Just now",
                          tags: ["custom"],
                          readingTime: "2 min read",
                          pinned: false,
                          collabs: ["TH"],
                          preview: editorData.content.slice(0, 80) + "...",
                          folder: "Architecture",
                        },
                        ...notes,
                      ])
                      setActiveTab("grid")
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-5 py-2 rounded-xl shadow-lg cursor-pointer"
                  >
                    Save & Publish Note
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (NOTE TELEMETRY & LINKED RESOURCES) (1 COLUMN) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Note Metadata Widget */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-purple-400" /> Document Info</span>
              <span className="text-[10px] text-emerald-400 font-mono">Synced</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Author:</span>
                <span className="text-white font-bold">Tharun (Admin)</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Word Count:</span>
                <span className="text-purple-400 font-bold">342 words</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Reading Time:</span>
                <span className="text-blue-400 font-bold">4 min read</span>
              </div>
            </div>
          </div>

          {/* Linked AI Agents & Projects */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-amber-400" /> Linked AI Workers</span>
              <span className="text-[10px] text-emerald-400 font-mono">2 Linked</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs">
              {["DevOps Copilot Alpha", "Security Auditor Bot"].map((w, idx) => (
                <div key={idx} className="p-2 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between">
                  <span className="font-bold text-white">{w}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
