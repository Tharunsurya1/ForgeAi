"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bookmark,
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
  Code2,
  Database,
  ShieldCheck,
  Zap,
  BarChart3,
  Upload,
  Activity,
  Sliders,
  Globe,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  Layers,
  Lock,
  BookOpen,
  Heart,
  Terminal,
  Bot,
} from "lucide-react"

export default function PromptLibraryPage() {
  const router = useRouter()

  // Navigation & State
  const [activeTab, setActiveTab] = useState<
    "all" | "my" | "team" | "public" | "favorites" | "collections" | "templates" | "editor"
  >("all")

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedModel, setSelectedModel] = useState("All Models")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Editor Form State
  const [editorData, setEditorData] = useState({
    name: "",
    desc: "",
    category: "Development",
    tags: "react, typescript, optimization",
    systemPrompt: "You are an expert senior software engineer specializing in clean code and design patterns.",
    userPrompt: "Refactor the following {{language}} component to use modern async/await patterns and optimize render performance:\n\n{{code_snippet}}",
    exampleInput: "const data = fetch('/api').then(r => r.json());",
    expectedOutput: "export async function loadData() { ... }",
    model: "Claude 3.5 Sonnet",
    temperature: 0.7,
    maxTokens: 4096,
  })

  // Prompt Cards Data
  const [prompts, setPrompts] = useState([
    {
      id: "pr-1",
      title: "React 19 Server Actions & Optimistic Hook Generator",
      desc: "Generates production-ready React 19 Server Actions with optimistic UI updates & error boundary handlers.",
      preview: "Write a React 19 server action for handling {{entity_name}} mutation with useOptimistic hook...",
      category: "Frontend",
      models: ["Claude 3.5 Sonnet", "GPT-4o"],
      creator: "Tharun (Admin)",
      usageCount: 3420,
      rating: 4.9,
      updated: "10m ago",
      tokens: "~180 tokens",
      tags: ["react19", "typescript", "tailwind"],
      visibility: "Team",
      favorite: true,
      featured: true,
    },
    {
      id: "pr-2",
      title: "Rust Distributed Vector Indexing Architecture (HNSW)",
      desc: "Creates clean Rust code for lock-free multi-threaded cosine similarity KNN search nodes.",
      preview: "Implement an HNSW vector store index in Rust using tokio::sync::RwLock for {{vector_dimension}} dimensions...",
      category: "Backend",
      models: ["Claude 3.5 Sonnet", "DeepSeek V3"],
      creator: "Alex Developer",
      usageCount: 2150,
      rating: 4.9,
      updated: "1h ago",
      tokens: "~240 tokens",
      tags: ["rust", "vector-db", "hnsw"],
      visibility: "Public",
      favorite: true,
      featured: true,
    },
    {
      id: "pr-3",
      title: "SQL Slow Query EXPLAIN ANALYZE Optimizer",
      desc: "Analyzes PostgreSQL execution plans and recommends composite indexes & query rewrites.",
      preview: "Given the EXPLAIN ANALYZE log for table {{table_name}}, suggest multi-column B-tree indexes...",
      category: "Database",
      models: ["GPT-4o", "Llama 3.1 70B"],
      creator: "Sarah K.",
      usageCount: 1890,
      rating: 4.8,
      updated: "3h ago",
      tokens: "~150 tokens",
      tags: ["sql", "postgresql", "optimization"],
      visibility: "Team",
      favorite: false,
      featured: false,
    },
    {
      id: "pr-4",
      title: "Autonomous Web Scraping Agent System Prompt",
      desc: "System instructions for an AI agent crawling dynamic JavaScript SPAs with anti-bot bypass.",
      preview: "You are a Web Scraping Agent. Crawl the page at {{target_url}} and extract structured JSON schema...",
      category: "AI Agents",
      models: ["Claude 3.5 Sonnet", "GPT-4o"],
      creator: "Tharun (Admin)",
      usageCount: 4210,
      rating: 5.0,
      updated: "1d ago",
      tokens: "~320 tokens",
      tags: ["agents", "playwright", "scraping"],
      visibility: "Team",
      favorite: true,
      featured: true,
    },
    {
      id: "pr-5",
      title: "OWASP Top 10 Security Audit & Secret Scanner",
      desc: "Scans source code for hardcoded JWT secrets, SQL injection, XSS & broken authorization flaws.",
      preview: "Perform an OWASP security audit on the following {{language}} code file: {{source_code}}...",
      category: "Cyber Security",
      models: ["DeepSeek V3", "Claude 3.5 Sonnet"],
      creator: "Marcus V.",
      usageCount: 1240,
      rating: 4.8,
      updated: "2d ago",
      tokens: "~210 tokens",
      tags: ["security", "owasp", "audit"],
      visibility: "Private",
      favorite: false,
      featured: false,
    },
  ])

  // Categories list
  const categories = [
    "All Categories", "Development", "AI Agents", "Frontend", "Backend",
    "DevOps", "Data Science", "SQL", "Cyber Security", "Marketing",
    "Business", "Finance", "Productivity", "Research", "Design",
  ]

  // Copy Prompt Snippet
  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p))
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
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Enterprise Prompt Library</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Store, organize, discover and reuse professional AI prompts across your workspace.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab("editor")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Prompt</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Prompt</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TABS & SEARCH CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar text-xs font-semibold">
          {[
            { id: "all", label: "All Prompts", count: prompts.length },
            { id: "my", label: "My Prompts", count: prompts.filter(p => p.creator.startsWith("Tharun")).length },
            { id: "team", label: "Team Prompts", count: prompts.filter(p => p.visibility === "Team").length },
            { id: "public", label: "Public Library", count: prompts.filter(p => p.visibility === "Public").length },
            { id: "favorites", label: "Favorites", count: prompts.filter(p => p.favorite).length },
            { id: "collections", label: "Collections", count: 6 },
            { id: "editor", label: "Prompt Editor", count: null },
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

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="relative flex-1 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CATEGORY PILLS SCROLLER */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === c
                ? "bg-purple-600 text-white font-bold shadow-sm"
                : "bg-[#141620] border border-[#232736] text-slate-400 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN CONTENT COLUMN */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* SECTION 1 & 3: PROMPT CARDS GRID */}
          {/* ========================================================================= */}
          {activeTab !== "editor" && activeTab !== "collections" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prompts
                .filter(p => searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter(p => selectedCategory === "All Categories" || p.category === selectedCategory)
                .filter(p => activeTab !== "favorites" || p.favorite)
                .filter(p => activeTab !== "my" || p.creator.startsWith("Tharun"))
                .map((pr) => (
                  <div key={pr.id} className="p-5 bg-[#141620] border border-[#232736] hover:border-[#353c52] rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight">{pr.title}</h3>
                          {pr.featured && (
                            <span className="px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/20">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          By {pr.creator} • {pr.updated}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleFavorite(pr.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          pr.favorite ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-[#181a26] border-[#2d3248] text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${pr.favorite ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">{pr.desc}</p>

                    {/* Code Preview Box */}
                    <div className="bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232] font-mono text-[11px] text-slate-300 relative group/code">
                      <p className="line-clamp-2 leading-relaxed text-purple-300/90">{pr.preview}</p>
                      <button
                        onClick={() => handleCopyPrompt(pr.preview, pr.id)}
                        className="absolute right-2 top-2 p-1 bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white rounded text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === pr.id ? (
                          <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                        )}
                      </button>
                    </div>

                    {/* Model Badges & Tokens */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        {pr.models.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                            {m}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-400">{pr.tokens}</span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#232736] text-xs">
                      <button
                        onClick={() => router.push("/dashboard/ai/chat")}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Prompt</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="bg-[#181a26] text-slate-300 p-2 rounded-xl hover:text-white border border-[#2d3248]"><Share2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: COLLECTIONS VIEW */}
          {/* ========================================================================= */}
          {activeTab === "collections" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Development Collection", count: "24 Prompts", icon: Code2, desc: "React, Rust, SQL, and Architecture templates" },
                { title: "AI Agents Collection", count: "12 Prompts", icon: Bot, desc: "Autonomous agent system prompts & web crawlers" },
                { title: "Cyber Security Collection", count: "8 Prompts", icon: ShieldCheck, desc: "OWASP audits, secret scanners & vulnerability fixes" },
                { title: "Business & SaaS Collection", count: "18 Prompts", icon: BarChart3, desc: "TAM/SAM analysis, pitch deck outlines & unit economics" },
                { title: "Marketing & SEO Collection", count: "15 Prompts", icon: Zap, desc: "Copywriting, blog posts & landing page headlines" },
                { title: "Research & Data Science", count: "10 Prompts", icon: Database, desc: "Pandas data cleanups, chart scripts & ML fine-tuning" },
              ].map((col, idx) => {
                const Icon = col.icon || Code2
                return (
                  <div key={idx} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/40 rounded-2xl flex flex-col justify-between gap-3 shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e2232] text-purple-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{col.title}</h3>
                        <span className="text-[10px] text-emerald-400 font-mono">{col.count}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{col.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PROMPT EDITOR (INTERACTIVE EDITOR MODE) */}
          {/* ========================================================================= */}
          {activeTab === "editor" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-6 text-xs">
              <div className="flex items-center justify-between border-b border-[#232736] pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" /> Interactive Prompt Studio
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Draft Auto-Saved</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Prompt Title</label>
                  <input
                    type="text"
                    value={editorData.name}
                    onChange={(e) => setEditorData({ ...editorData, name: e.target.value })}
                    placeholder="e.g. React 19 Server Action Generator"
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Category</label>
                  <select
                    value={editorData.category}
                    onChange={(e) => setEditorData({ ...editorData, category: e.target.value })}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {categories.filter(c => c !== "All Categories").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* System Prompt & User Template */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">System Prompt (Persona & Constraints)</label>
                <textarea
                  rows={3}
                  value={editorData.systemPrompt}
                  onChange={(e) => setEditorData({ ...editorData, systemPrompt: e.target.value })}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">User Prompt Template (Use {"{{variable_name}}"} for inputs)</label>
                <textarea
                  rows={5}
                  value={editorData.userPrompt}
                  onChange={(e) => setEditorData({ ...editorData, userPrompt: e.target.value })}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 font-mono text-purple-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Save & Publish Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232736]">
                <button
                  onClick={() => setActiveTab("all")}
                  className="bg-[#181a26] border border-[#2d3248] text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPrompts([
                      {
                        id: `pr-${Date.now()}`,
                        title: editorData.name || "Custom Prompt Template",
                        desc: editorData.userPrompt.slice(0, 80) + "...",
                        preview: editorData.userPrompt,
                        category: editorData.category,
                        models: [editorData.model],
                        creator: "Tharun (Admin)",
                        usageCount: 0,
                        rating: 5.0,
                        updated: "Just now",
                        tokens: "~150 tokens",
                        tags: editorData.tags.split(","),
                        visibility: "Team",
                        favorite: false,
                        featured: false,
                      },
                      ...prompts,
                    ])
                    setActiveTab("all")
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg active:scale-95 cursor-pointer"
                >
                  🚀 Publish to Workspace Library
                </button>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (QUICK ACTIONS & TELEMETRY) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Prompt Analytics Summary */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Library Stats</span>
              <span className="text-[10px] text-emerald-400 font-mono">142 Total</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Runs Today:</span>
                <span className="text-white font-bold">1,840</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Avg Rating:</span>
                <span className="text-amber-400 font-bold">4.9 ⭐</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Tokens Saved:</span>
                <span className="text-purple-400 font-bold">4.2M</span>
              </div>
            </div>
          </div>

          {/* Favorites List */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-400" /> Favorites</span>
              <span className="text-[10px] text-amber-400 font-mono">{prompts.filter(p => p.favorite).length} Pinned</span>
            </h4>

            <div className="flex flex-col gap-2">
              {prompts.filter(p => p.favorite).map((p) => (
                <div key={p.id} className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex items-center justify-between text-xs cursor-pointer hover:border-amber-500/30">
                  <span className="font-bold text-white truncate max-w-[140px]">{p.title}</span>
                  <span className="text-[10px] text-purple-400 font-mono">{p.category}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
