"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Sparkles,
  Command,
  Bell,
  Settings,
  Plus,
  MessageSquare,
  Folder,
  FileText,
  Code2,
  Palette,
  Database,
  Workflow,
  Zap,
  Users,
  BarChart3,
  Cpu,
  Clock,
  Pin,
  Share2,
  Bookmark,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Send,
  Edit3,
  MoreHorizontal,
  ChevronDown,
  Globe,
  Trash2,
  ExternalLink,
  Check,
  X,
  Sliders,
  HardDrive,
  File,
  Lock,
  ArrowRight,
  ShieldCheck,
  Terminal,
  BookOpen,
  Bot,
} from "lucide-react"

export default function AIChatWorkspacePage() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<"history" | "pinned" | "shared" | "templates" | "prompts">("history")
  const [selectedModel, setSelectedModel] = useState("Claude 3.5 Sonnet")
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [workspaceSelectorOpen, setWorkspaceSelectorOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState("⚡ Enterprise Workspace")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPromptCategory, setSelectedPromptCategory] = useState("All")

  const [inputMessage, setInputMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([])

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // Demo Messages
  const [messages, setMessages] = useState<
    {
      id: string
      sender: "user" | "ai"
      text: string
      code?: string
      language?: string
      timestamp: string
      model?: string
      likes?: number
      liked?: boolean
      disliked?: boolean
    }[]
  >([
    {
      id: "msg-1",
      sender: "user",
      text: "Can you design a high-performance Distributed Vector Search Index in Rust using HNSW and provide a React client snippet?",
      timestamp: "10:42 AM",
    },
    {
      id: "msg-2",
      sender: "ai",
      model: "Claude 3.5 Sonnet",
      text: "Certainly! Below is an architecture breakdown of a distributed HNSW (Hierarchical Navigable Small World) vector search node written in Rust, along with a production-grade React client hook.",
      code: `// rust_vector_search/src/hnsw.rs
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct VectorNode {
    pub id: u64,
    pub embedding: Vec<f32>,
    pub neighbors: Vec<u64>,
}

pub struct DistributedHNSWIndex {
    pub dimension: usize,
    pub nodes: Arc<RwLock<Vec<VectorNode>>>,
}

impl DistributedHNSWIndex {
    pub fn new(dimension: usize) -> Self {
        Self {
            dimension,
            nodes: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn search_knn(&self, query: &[f32], k: usize) -> Vec<(u64, f32)> {
        // High-speed cosine similarity calculation
        let nodes = self.nodes.read().await;
        let mut results: Vec<(u64, f32)> = nodes.iter().map(|n| {
            let score = cosine_similarity(query, &n.embedding);
            (n.id, score)
        }).collect();

        results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        results.truncate(k);
        results
    }
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    dot / (norm_a * norm_b + 1e-8)
}`,
      language: "rust",
      timestamp: "10:43 AM",
    },
  ])

  // Chat History Data
  const [chatHistory, setChatHistory] = useState([
    { id: "c1", title: "Distributed Vector Search in Rust", model: "Claude 3.5 Sonnet", time: "10m ago", count: 8, pinned: true },
    { id: "c2", title: "React 19 Server Actions & Optimistic UI", model: "GPT-4o", time: "1h ago", count: 14, pinned: fontCheck(true) },
    { id: "c3", title: "Kubernetes Cluster Auto-Scaler Script", model: "Llama 3.1 70B", time: "3h ago", count: 5, pinned: false },
    { id: "c4", title: "PostgreSQL Partitioning for 100M rows", model: "GPT-4o", time: "1d ago", count: 22, pinned: false },
    { id: "c5", title: "Deep Learning Model Quantization (INT8)", model: "DeepSeek V3", time: "2d ago", count: 11, pinned: false },
  ])

  function fontCheck(val: boolean) {
    return val
  }

  // Shared Chats Data
  const sharedChats = [
    { id: "s1", title: "Enterprise Security Audit Protocol", owner: "Sarah Jenkins", date: "Jul 22", permission: "Can View" },
    { id: "s2", title: "RAG Pipeline Performance Benchmarks", owner: "Alex Developer", date: "Jul 20", permission: "Can Edit" },
  ]

  // Prompt Templates
  const templates = [
    { title: "Software Architecture Design", category: "Development", desc: "Design scalable distributed microservices & C4 models" },
    { title: "Full Code Review & Refactor", category: "Bug Fixing", desc: "Scan code for memory leaks, security flaws & async bottlenecks" },
    { title: "SaaS Business Plan Generator", category: "Business", desc: "Generate TAM/SAM analysis, financial projections & unit economics" },
    { title: "Data Analysis & Charting", category: "Data Science", desc: "Write Python Pandas & SQL scripts for data cleanups" },
    { title: "High-Converting Copywriting", category: "Marketing", desc: "Craft landing page headlines, email sequences & ad copy" },
    { title: "Executive Email Writer", category: "Productivity", desc: "Draft crisp, persuasive emails for C-level stakeholders" },
  ]

  // Prompts Library
  const promptLibrary = [
    { id: "p1", category: "Coding", title: "React Component Generator", desc: "Generates clean TypeScript React components with Tailwind CSS & ARIA labels." },
    { id: "p2", category: "Coding", title: "SQL Query Optimizer", desc: "Optimizes slow EXPLAIN ANALYZE queries and suggests composite indexes." },
    { id: "p3", category: "AI Agents", title: "Autonomous Web Scraper Agent", desc: "Creates an agent prompt for crawling Javascript-heavy web apps." },
    { id: "p4", category: "Cyber Security", title: "OWASP Vulnerability Audit", desc: "Scans code snippets for XSS, SQLi, CSRF, and broken access controls." },
    { id: "p5", category: "Business", title: "Pitch Deck Slide Outline", desc: "Generates a 10-slide VC pitch deck structure with key talking points." },
    { id: "p6", category: "Design", title: "Design System Token Spec", desc: "Creates HSL color palettes, typography scales & component tokens." },
  ]

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  // Handle Send Message
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage
    if (!textToSend.trim()) return

    const newUserMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newUserMsg])
    if (!customText) setInputMessage("")
    setIsStreaming(true)

    // Simulate AI Streaming Response
    setTimeout(() => {
      const newAiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai" as const,
        model: selectedModel,
        text: `Here is the response from **${selectedModel}**:\n\nI have processed your request regarding "${textToSend.slice(0, 40)}...". Everything has been validated across the active workspace nodes.`,
        code: `// Generated snippet by ${selectedModel}\nexport async function handleExecution(payload: Record<string, unknown>) {\n  console.log("Processing payload with latency < 12ms", payload);\n  return { status: 200, success: true, timestamp: Date.now() };\n}`,
        language: "typescript",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, newAiMsg])
      setIsStreaming(false)
    }, 1200)
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setAttachedFiles((prev) => [
        ...prev,
        { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: file.type || "file" },
      ])
    }
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] text-slate-100 font-sans flex flex-col overflow-hidden bg-[#0c0d12]">

      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border-b border-[#222534] px-5 py-3 flex items-center justify-between gap-4 shrink-0 z-30">
        
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-lg shadow-purple-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">AI Workspace</h1>
              <span className="text-xs text-slate-500 font-mono">/</span>
              <span className="text-xs font-semibold text-purple-400">Intelligent Studio</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Collaborate with multiple AI models, organize conversations, and manage prompts.
            </p>
          </div>
        </div>

        {/* Workspace & Model Selectors + Search */}
        <div className="flex items-center gap-3">
          
          {/* Workspace Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => { setWorkspaceSelectorOpen(!workspaceSelectorOpen); setModelSelectorOpen(false) }}
              className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedWorkspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {workspaceSelectorOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#151722] border border-[#2d3248] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                {["⚡ Enterprise Workspace", "🚀 Production Cluster", "🧪 Staging Lab"].map((w) => (
                  <button
                    key={w}
                    onClick={() => { setSelectedWorkspace(w); setWorkspaceSelectorOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedWorkspace === w ? "bg-[#2563eb] text-white" : "text-slate-300 hover:bg-[#202332]"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setModelSelectorOpen(!modelSelectorOpen); setWorkspaceSelectorOpen(false) }}
              className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-xs font-medium text-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold">{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {modelSelectorOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#151722] border border-[#2d3248] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs">
                {["Claude 3.5 Sonnet", "GPT-4o", "Llama 3.1 70B", "DeepSeek V3"].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedModel(m); setModelSelectorOpen(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedModel === m ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-[#202332]"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global Search Bar */}
          <div className="relative hidden lg:block w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161822] border border-[#262a3c] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Notification Bell */}
          <button className="w-9 h-9 rounded-xl bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 flex items-center justify-center relative transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500"></span>
          </button>

          {/* User Profile */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs border border-purple-400/30 shrink-0 shadow-md">
            TH
          </div>

          {/* + New Chat Primary Button */}
          <button
            onClick={() => { setMessages([]); setInputMessage("") }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Chat</span>
          </button>

        </div>

      </header>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE BODY (3 PANELS: LEFT SIDEBAR, CENTER CHAT, RIGHT SIDEBAR) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* LEFT SIDEBAR (CHAT HISTORY, PINNED, SHARED, TEMPLATES, PROMPTS) */}
        {/* ========================================================================= */}
        <aside className="w-72 bg-[#10121a] border-r border-[#222534] flex flex-col shrink-0 select-none z-20">
          
          {/* Top Primary New Chat Button */}
          <div className="p-3 border-b border-[#222534]">
            <button
              onClick={() => { setMessages([]); setInputMessage("") }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 fill-current text-white" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Sidebar Navigation Tabs */}
          <div className="flex items-center justify-around border-b border-[#222534] p-1 bg-[#0d0e14] text-[11px] font-medium">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === "history" ? "bg-[#1f2232] text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Clock className="w-3 h-3" /> History
            </button>
            <button
              onClick={() => setActiveTab("pinned")}
              className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === "pinned" ? "bg-[#1f2232] text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Pin className="w-3 h-3 text-amber-400" /> Pinned
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === "shared" ? "bg-[#1f2232] text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Share2 className="w-3 h-3 text-blue-400" /> Shared
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === "templates" ? "bg-[#1f2232] text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <FileText className="w-3 h-3 text-emerald-400" /> Templates
            </button>
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === "prompts" ? "bg-[#1f2232] text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Bookmark className="w-3 h-3 text-purple-400" /> Prompts
            </button>
          </div>

          {/* Tab Content List Area */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">

            {/* TAB 1: HISTORY */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Recent Chats</span>
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 bg-[#161824] hover:bg-[#1f2234] border border-[#24283a] rounded-xl flex flex-col gap-1.5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[170px]">{chat.title}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white p-1 transition-opacity">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{chat.model}</span>
                      <span>{chat.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: PINNED CHATS */}
            {activeTab === "pinned" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-1 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned Favorites
                </span>
                {chatHistory.filter(c => c.pinned).map((chat) => (
                  <div key={chat.id} className="p-3 bg-[#181a28] border border-amber-500/20 rounded-xl flex flex-col gap-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{chat.title}</span>
                      <Pin className="w-3 h-3 text-amber-400 fill-current" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{chat.model} • {chat.count} messages</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SHARED CHATS */}
            {activeTab === "shared" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-1">Team Shared Conversations</span>
                {sharedChats.map((sc) => (
                  <div key={sc.id} className="p-3 bg-[#151724] border border-blue-500/20 rounded-xl flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight">{sc.title}</span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Owner: {sc.owner}</span>
                      <span className="text-blue-400 font-mono">{sc.permission}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: TEMPLATES */}
            {activeTab === "templates" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-1">Ready Templates</span>
                {templates.map((tpl, idx) => (
                  <div key={idx} className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex flex-col gap-1.5 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tpl.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">{tpl.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{tpl.desc}</p>
                    <button
                      onClick={() => handleSendMessage(`Use template: ${tpl.title}`)}
                      className="mt-1 w-full bg-[#1e2232] hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Use Template →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: PROMPT LIBRARY */}
            {activeTab === "prompts" && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-1">Prompt Library</span>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {["All", "Coding", "Business", "Cyber Security", "Design"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedPromptCategory(cat)}
                      className={`text-[9px] px-2 py-0.5 rounded-full transition-colors ${selectedPromptCategory === cat ? "bg-purple-600 text-white font-bold" : "bg-[#181a26] text-slate-400"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {promptLibrary
                  .filter(p => selectedPromptCategory === "All" || p.category === selectedPromptCategory)
                  .map((p) => (
                    <div key={p.id} className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex flex-col gap-1.5 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.title}</span>
                        <Bookmark className="w-3 h-3 text-purple-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                      <button
                        onClick={() => handleSendMessage(`Run prompt: ${p.title}\n\n${p.desc}`)}
                        className="mt-1 w-full bg-[#1e2232] hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Run Prompt
                      </button>
                    </div>
                  ))}
              </div>
            )}

          </div>

        </aside>

        {/* ========================================================================= */}
        {/* CENTER CHAT AREA (CANVAS, MESSAGES, STREAMING, & INPUT BAR) */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden relative bg-[#0c0d12]">
          
          {/* Scrollable Message History or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 custom-scrollbar">

            {/* EMPTY STATE (When no messages) */}
            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto py-12 px-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome to ForgeAI Workspace</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-md">
                  Ask anything or choose a template below to start collaborating with enterprise LLMs.
                </p>

                {/* Suggestion Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-8">
                  {[
                    { label: "Build Web Application", icon: Code2, desc: "React + Tailwind + Rust backend" },
                    { label: "Generate React UI", icon: Palette, desc: "Glassmorphic component spec" },
                    { label: "Create AI Agent", icon: Bot, desc: "Autonomous task execution worker" },
                    { label: "Analyze Dataset", icon: BarChart3, desc: "Pandas & SQL data analysis" },
                    { label: "Generate SQL Schema", icon: Database, desc: "PostgreSQL optimized tables" },
                    { label: "Write Documentation", icon: FileText, desc: "C4 model & API documentation" },
                    { label: "Fix Code Bugs", icon: Zap, desc: "Async deadlock & memory audit" },
                    { label: "Explain Complex Code", icon: BookOpen, desc: "Step-by-step code walkthrough" },
                  ].map((sug, idx) => {
                    const Icon = sug.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(`Help me ${sug.label.toLowerCase()} for my project.`)}
                        className="p-3.5 bg-[#141622] hover:bg-[#1d2030] border border-[#232738] hover:border-purple-500/40 rounded-2xl flex flex-col items-start text-left gap-1.5 transition-all group cursor-pointer shadow-sm active:scale-95"
                      >
                        <Icon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-white leading-tight">{sug.label}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{sug.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* MESSAGES LIST */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-3xl w-full ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                {/* Header Badge */}
                <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400 font-mono">
                  {msg.sender === "ai" ? (
                    <>
                      <span className="font-bold text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {msg.model || selectedModel}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-blue-400">You (Tharun)</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md transition-all ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-[#141622] border border-[#232738] text-slate-100 rounded-bl-none w-full"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Code Block if Present */}
                  {msg.code && (
                    <div className="mt-3 bg-[#0d0e14] border border-[#24283a] rounded-xl overflow-hidden text-xs">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141622] border-b border-[#24283a] font-mono text-[10px] text-slate-400">
                        <span>{msg.language || "code"}</span>
                        <button
                          onClick={() => copyCode(msg.code!, msg.id)}
                          className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>
                          ) : (
                            <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Code</span>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-slate-200 font-mono text-[11px] leading-relaxed">
                        <code>{msg.code}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* AI Action Buttons Footer */}
                {msg.sender === "ai" && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <button
                      onClick={() => copyCode(msg.text, msg.id)}
                      className="hover:text-white p-1 rounded transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button
                      onClick={() => handleSendMessage("Regenerate response")}
                      className="hover:text-white p-1 rounded transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Regenerate
                    </button>
                    <button className="hover:text-emerald-400 p-1 rounded transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button className="hover:text-rose-400 p-1 rounded transition-colors">
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

              </div>
            ))}

            {/* Streaming Typing Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-purple-400 font-mono bg-[#141622] p-3 rounded-2xl border border-purple-500/20 max-w-xs animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{selectedModel} is thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM INPUT BAR */}
          {/* ========================================================================= */}
          <div className="p-4 md:px-8 border-t border-[#222534] bg-[#10121a]/95 backdrop-blur-xl shrink-0">
            
            {/* Attached Files Pill Preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#181a26] border border-[#2d3248] text-xs text-slate-300 font-mono">
                    <Paperclip className="w-3 h-3 text-purple-400" />
                    <span>{file.name} ({file.size})</span>
                    <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Box Container */}
            <div className="relative bg-[#151724] border border-[#282c3f] focus-within:border-purple-500 rounded-2xl p-2 shadow-xl transition-all">
              
              <textarea
                rows={2}
                placeholder="Ask ForgeAI anything... (Shift + Enter for new line)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="w-full bg-transparent text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 pt-1"
              />

              {/* Bottom Action Bar inside Input */}
              <div className="flex items-center justify-between pt-2 border-t border-[#222534]">
                
                {/* Left Attachments & Templates Buttons */}
                <div className="flex items-center gap-1.5">
                  <label className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202334] transition-colors cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <label className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202334] transition-colors cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#202334] transition-colors cursor-pointer">
                    <Mic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("templates")}
                    className="px-2.5 py-1 rounded-lg bg-[#1c1e2e] hover:bg-[#25283c] text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3" /> Templates
                  </button>

                  <button
                    onClick={() => setActiveTab("prompts")}
                    className="px-2.5 py-1 rounded-lg bg-[#1c1e2e] hover:bg-[#25283c] text-xs font-semibold text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3" /> Prompts
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    inputMessage.trim()
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md active:scale-95"
                      : "bg-[#222536] text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

        </main>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (CONVERSATION DETAILS & METADATA) */}
        {/* ========================================================================= */}
        {rightSidebarOpen && (
          <aside className="w-72 bg-[#10121a] border-l border-[#222534] p-4 flex flex-col gap-6 shrink-0 select-none z-20 custom-scrollbar overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222534] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" /> Conversation Info
              </h3>
              <button onClick={() => setRightSidebarOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Model & Token Info */}
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex flex-col gap-1 text-xs">
                <span className="text-slate-400">Current AI Model</span>
                <span className="font-bold text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {selectedModel}
                </span>
              </div>

              <div className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Usage</span>
                  <span className="font-mono text-white">4,280 / 128k</span>
                </div>
                <div className="w-full h-1.5 bg-[#1e2232] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[24%]"></div>
                </div>
              </div>

              <div className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Cost</span>
                <span className="font-mono text-emerald-400 font-bold">$0.0084</span>
              </div>

              <div className="p-3 bg-[#151724] border border-[#24283a] rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Memory State</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Enabled
                </span>
              </div>
            </div>

            {/* Quick Conversation Actions */}
            <div className="flex flex-col gap-2 border-t border-[#222534] pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Actions</span>
              
              <button className="w-full bg-[#161826] hover:bg-[#202334] border border-[#24283a] text-xs font-semibold text-slate-200 py-2 px-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left">
                <Share2 className="w-3.5 h-3.5 text-blue-400" /> Share Conversation
              </button>

              <button className="w-full bg-[#161826] hover:bg-[#202334] border border-[#24283a] text-xs font-semibold text-slate-200 py-2 px-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left">
                <Copy className="w-3.5 h-3.5 text-purple-400" /> Duplicate Workspace
              </button>

              <button className="w-full bg-[#161826] hover:bg-[#202334] border border-[#24283a] text-xs font-semibold text-slate-200 py-2 px-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Export (PDF / JSON)
              </button>

              <button className="w-full bg-[#161826] hover:bg-rose-500/20 border border-[#24283a] hover:border-rose-500/30 text-xs font-semibold text-rose-400 py-2 px-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer text-left">
                <Trash2 className="w-3.5 h-3.5" /> Delete Chat
              </button>
            </div>

          </aside>
        )}

      </div>

    </div>
  )
}
