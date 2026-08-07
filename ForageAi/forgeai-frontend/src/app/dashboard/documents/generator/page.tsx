"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  FileText,
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
  Wand2,
  FileCode,
  Download,
  Layers,
  FileCheck,
  Network,
  Presentation,
  FileSpreadsheet,
  Cpu,
  ExternalLink,
  Lock,
  RefreshCw,
  Play,
} from "lucide-react"

export default function AIDocumentGeneratorPage() {
  const router = useRouter()

  // Generator Inputs State
  const [docTitle, setDocTitle] = useState("ForgeAI Microservice Core PRD")
  const [selectedDocType, setSelectedDocType] = useState("📄 PRD (Product Requirement Document)")
  const [selectedProject, setSelectedProject] = useState("Neural Engine v3")
  const [selectedModel, setSelectedModel] = useState("Claude 3.5 Sonnet")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedAudience, setSelectedAudience] = useState("Engineering & Product Team")
  const [writingStyle, setWritingStyle] = useState("Technical & Formal")
  const [customPrompt, setCustomPrompt] = useState(
    "Include system architecture diagram specs, REST endpoint schemas, error handling matrices, and SLO/SLA targets."
  )

  // Document View / Generation State
  const [activeTab, setActiveTab] = useState<"types" | "generator" | "editor" | "recent">("types")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDocContent, setGeneratedDocContent] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 14 Document Types Cards Data
  const docTypes = [
    { name: "📄 PRD", label: "Product Requirement Document", category: "Product", desc: "User stories, acceptance criteria, & feature specifications.", icon: FileText },
    { name: "📄 BRD", label: "Business Requirement Document", category: "Business", desc: "Executive business goals, TAM/SAM, & financial ROI models.", icon: FileSpreadsheet },
    { name: "📄 SRS", label: "Software Requirement Spec", category: "Engineering", desc: "Functional requirements, non-functional constraints & interfaces.", icon: FileCheck },
    { name: "🏗️ Architecture", label: "Architecture Documentation", category: "Engineering", desc: "C4 model diagrams, microservices flow & tech stack specs.", icon: Layers },
    { name: "🔌 API Specs", label: "API Documentation", category: "Engineering", desc: "REST/gRPC endpoint definitions, payload schemas & status codes.", icon: Code2 },
    { name: "📘 Swagger / OpenAPI", label: "OpenAPI 3.1 Specification", category: "Engineering", desc: "Machine-readable YAML/JSON OpenAPI 3.1 definitions.", icon: FileCode },
    { name: "🗄️ Database Schema", label: "Database ER Schema", category: "Database", desc: "PostgreSQL/MySQL table schemas, foreign keys & indexes.", icon: Database },
    { name: "🧪 Test Cases", label: "QA & Unit Test Cases", category: "QA & Testing", desc: "Automated test suits, edge cases & integration assertions.", icon: ShieldCheck },
    { name: "📖 User Manual", label: "User & Admin Guide", category: "Documentation", desc: "Step-by-step user onboarding & administrator guides.", icon: BookOpen },
    { name: "📋 SOP Document", label: "Standard Operating Procedure", category: "Operations", desc: "Incident response runbooks & deployment procedures.", icon: Activity },
    { name: "💼 Business Proposal", label: "Enterprise Business Proposal", category: "Sales", desc: "SaaS commercial proposal, pricing tiers & SLA commitments.", icon: Zap },
    { name: "📝 Meeting Minutes", label: "AI Meeting Summary", category: "Productivity", desc: "Automated transcript summary, action items & assignees.", icon: Users },
    { name: "📊 Reports", label: "Executive Analytics Report", category: "Analytics", desc: "Weekly performance summaries & KPI metric breakdowns.", icon: BarChart3 },
    { name: "📽️ Presentation", label: "Pitch Deck & Slide Generator", category: "Presentation", desc: "10-slide VC pitch deck outline & key talking points.", icon: Presentation },
  ]

  // Handle AI Document Generation
  const handleGenerateDocument = (docTypeName?: string) => {
    if (docTypeName) setSelectedDocType(docTypeName)
    setActiveTab("generator")
    setIsGenerating(true)
    setToastMessage("🤖 AI Agent is analyzing context & generating technical document...")

    setTimeout(() => {
      setIsGenerating(false)
      setToastMessage("✅ Document successfully generated with Claude 3.5 Sonnet!")
      setGeneratedDocContent(`# ${docTitle || "Technical Documentation"}
## Executive Summary
This document provides the technical and functional specification for **${selectedProject}** generated using **${selectedModel}**.

### 1. Functional Requirements & SLA
- **Target Latency**: < 12ms at p99
- **Availability Target**: 99.99% Uptime
- **Concurrency**: 50,000 requests per second

\`\`\`mermaid
graph TD
    A[Client Request] --> B[API Gateway / Envoy]
    B --> C{Authentication}
    C -->|Valid| D[Distributed Vector Search Node]
    C -->|Invalid| E[401 Unauthorized]
    D --> F[PostgreSQL / Qdrant Database]
\`\`\`

### 2. REST Endpoint Specification
\`\`\`typescript
// POST /api/v1/vectors/search
export interface VectorSearchRequest {
  query_embedding: number[];
  top_k: number;
  filter_metadata?: Record<string, string>;
}
\`\`\`

---
*Generated by ForgeAI Enterprise Document Generator • Version 1.0.4*
`)
      setActiveTab("editor")
      setTimeout(() => setToastMessage(null), 4000)
    }, 1800)
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
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI Document Generator</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate professional software, business and technical documentation using AI.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => handleGenerateDocument()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Document</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Upload References</span>
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
      {/* TABS CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar text-xs font-semibold">
          {[
            { id: "types", label: "Document Templates", count: docTypes.length },
            { id: "generator", label: "AI Generator Wizard", count: null },
            { id: "editor", label: "Document Editor", count: null },
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

        {/* Model & Project Selectors */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end text-xs">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-medium"
          >
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4o</option>
            <option>DeepSeek V3</option>
            <option>Gemini 1.5 Pro</option>
          </select>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-medium"
          >
            <option>Neural Engine v3</option>
            <option>Support Agent Hub</option>
            <option>Vector DB Pipeline</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN CONTENT COLUMN */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* ========================================================================= */}
          {/* TAB 1: 14 DOCUMENT TYPE CARDS GRID */}
          {/* ========================================================================= */}
          {activeTab === "types" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docTypes.map((dt, idx) => {
                const Icon = dt.icon || FileText
                return (
                  <div key={idx} className="p-5 bg-[#141620] border border-[#232736] hover:border-purple-500/50 rounded-2xl flex flex-col justify-between gap-4 shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{dt.name}</h3>
                          <span className="text-[10px] text-purple-300 font-mono">{dt.category}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-3 rounded-xl border border-[#1e2232]">
                      {dt.desc}
                    </p>

                    <button
                      onClick={() => handleGenerateDocument(dt.name)}
                      className="w-full bg-[#1e2232] hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 text-slate-200 hover:text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate {dt.name.split(" ")[1] || "Doc"} →</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AI GENERATOR WIZARD FORM */}
          {/* ========================================================================= */}
          {activeTab === "generator" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
                <Wand2 className="w-4 h-4 text-purple-400" /> AI Document Generation Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Document Type</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {docTypes.map((dt) => (
                      <option key={dt.name}>{dt.name} - {dt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Target Audience</label>
                  <input
                    type="text"
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option>Technical & Formal</option>
                    <option>Executive Summary Style</option>
                    <option>Concise & Bulleted</option>
                    <option>Detailed & Academic</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>German</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Custom Prompt / Specific Requirements</label>
                <textarea
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <button
                disabled={isGenerating}
                onClick={() => handleGenerateDocument()}
                className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>AI Agent Generating Document...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>⚡ Generate Full Document with AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: RICH DOCUMENT EDITOR CANVAS */}
          {/* ========================================================================= */}
          {activeTab === "editor" && (
            <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-5 text-xs">
              <div className="flex items-center justify-between border-b border-[#232736] pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" /> Generated Document Canvas
                </h3>

                {/* Export Buttons */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <button className="px-2.5 py-1 rounded bg-[#1c1f2e] border border-[#2d3248] text-slate-300 hover:text-white flex items-center gap-1">
                    <Download className="w-3 h-3 text-purple-400" /> PDF
                  </button>
                  <button className="px-2.5 py-1 rounded bg-[#1c1f2e] border border-[#2d3248] text-slate-300 hover:text-white flex items-center gap-1">
                    <Download className="w-3 h-3 text-blue-400" /> Markdown
                  </button>
                  <button className="px-2.5 py-1 rounded bg-[#1c1f2e] border border-[#2d3248] text-slate-300 hover:text-white flex items-center gap-1">
                    <Download className="w-3 h-3 text-emerald-400" /> DOCX
                  </button>
                </div>
              </div>

              {/* Editor Workspace */}
              <textarea
                rows={16}
                value={generatedDocContent || `# ${docTitle}\n\n## Overview\nGenerated technical document canvas...`}
                onChange={(e) => setGeneratedDocContent(e.target.value)}
                className="w-full bg-[#0d0e14] border border-[#232736] rounded-xl p-4 font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed text-xs"
              />
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (DOCUMENT TELEMETRY & ACTIONS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-purple-400" /> Document Info</span>
              <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Model Used:</span>
                <span className="text-purple-400 font-bold">{selectedModel}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="text-white font-bold">{selectedProject}</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Word Count:</span>
                <span className="text-emerald-400 font-bold">1,480 words</span>
              </div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  )
}
