"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft, Loader2, AlertCircle, ShoppingCart, Users, Bot, Layers, Server, Database, Code2 } from "lucide-react"
import { projectsApi } from "@/lib/api"

export default function NewProjectPage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [requirements, setRequirements] = useState("")
  const [frontendTech, setFrontendTech] = useState("Next.js 15")
  const [backendTech, setBackendTech] = useState("FastAPI")
  const [databaseTech, setDatabaseTech] = useState("PostgreSQL 16")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleTemplateSelect = (tmpl: {
    idea: string
    requirements: string
    frontend: string
    backend: string
    database: string
  }) => {
    setIdea(tmpl.idea)
    setRequirements(tmpl.requirements)
    setFrontendTech(tmpl.frontend)
    setBackendTech(tmpl.backend)
    setDatabaseTech(tmpl.database)
  }

  const handleCreateBlueprint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!idea.trim()) {
      setErrorMsg("Please provide a software idea.")
      return
    }

    setErrorMsg(null)
    setIsGenerating(true)

    try {
      // 1. Get or create active project
      const existingProjects = await projectsApi.list()
      let activeProject = existingProjects[0]

      if (!activeProject) {
        const words = idea.trim().split(" ")
        const projectName = words.length <= 4 ? idea.trim() : words.slice(0, 4).join(" ") + " App"
        activeProject = await projectsApi.create({
          name: projectName,
          description: idea.slice(0, 200),
          tech_stack: {
            frontend: frontendTech || "Next.js 15",
            backend: backendTech || "FastAPI",
            database: databaseTech || "PostgreSQL 16",
          },
        })
      }

      // 2. Trigger Standardized Asynchronous Multi-Agent AI Blueprint Creation
      const response = await projectsApi.createBlueprint(activeProject.id, {
        idea: idea.trim(),
        requirements: requirements.trim(),
        tech_preferences: {
          frontend: frontendTech.trim() || "Next.js 15",
          backend: backendTech.trim() || "FastAPI",
          database: databaseTech.trim() || "PostgreSQL 16",
        },
      })

      // Store active blueprint and execution IDs for seamless navigation
      if (typeof window !== "undefined") {
        if (response.blueprint_id) {
          localStorage.setItem("forgeai_active_blueprint_id", response.blueprint_id)
        }
        localStorage.setItem("forgeai_active_project_id", activeProject.id)
        if (response.workflow_id) {
          localStorage.setItem("forgeai_active_execution_id", response.workflow_id)
        }
      }

      setIsGenerating(false)
      // Navigate to LiveWorkflowMonitor
      router.push(`/dashboard/workflows?tab=executions&executionId=${response.workflow_id}`)
    } catch (err: unknown) {
      setIsGenerating(false)
      const errorText = err instanceof Error ? err.message : "Failed to create blueprint. Please verify backend connectivity."
      setErrorMsg(errorText)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col xl:flex-row gap-6 p-4 md:p-6">
      {/* Left Column: Core Generation Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/projects"
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Projects
            </Link>
          </div>
          <h2 className="font-display-xl text-3xl font-bold text-on-surface mb-2">New Blueprint</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Provide your structured software specification. Our 14-agent AI DAG orchestrator will synthesize full-stack architecture, database models, API contracts, security profiles, and DevOps manifests.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Structured Input Form */}
        <form onSubmit={handleCreateBlueprint} className="flex flex-col gap-4">
          {/* Software Idea */}
          <div className="glass-card rounded-xl p-4 border border-outline-variant/40 bg-[#0F0F0F] flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Software Idea <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#161616] border border-outline-variant/50 rounded-lg px-4 py-2.5 text-on-surface placeholder-on-surface-variant/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 outline-none text-sm font-medium transition-all"
              placeholder="e.g., Enterprise multi-tenant e-commerce platform for handmade goods"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              required
            />
          </div>

          {/* Requirements */}
          <div className="glass-card rounded-xl p-4 border border-outline-variant/40 bg-[#0F0F0F] flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              Requirements & Key Features
            </label>
            <textarea
              className="w-full bg-[#161616] border border-outline-variant/50 rounded-lg p-4 text-on-surface placeholder-on-surface-variant/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 outline-none text-sm leading-relaxed resize-y transition-all"
              placeholder="e.g., Users should browse products, add products to cart, and place orders with Stripe. Admin dashboard with real-time stock sync, inventory analytics, and audit logging."
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>

          {/* Tech Stack Preferences */}
          <div className="glass-card rounded-xl p-4 border border-outline-variant/40 bg-[#0F0F0F] flex flex-col gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
              <Server className="w-4 h-4 text-tertiary" />
              Tech Stack Preferences
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Frontend */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Frontend
                </span>
                <input
                  type="text"
                  className="bg-[#161616] border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 outline-none transition-all font-mono"
                  placeholder="e.g. Next.js 15"
                  value={frontendTech}
                  onChange={(e) => setFrontendTech(e.target.value)}
                />
              </div>

              {/* Backend */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Backend
                </span>
                <input
                  type="text"
                  className="bg-[#161616] border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 outline-none transition-all font-mono"
                  placeholder="e.g. FastAPI"
                  value={backendTech}
                  onChange={(e) => setBackendTech(e.target.value)}
                />
              </div>

              {/* Database */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-amber-400" />
                  Database
                </span>
                <input
                  type="text"
                  className="bg-[#161616] border border-outline-variant/50 rounded-lg px-3 py-2 text-xs text-on-surface placeholder-on-surface-variant/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 outline-none transition-all font-mono"
                  placeholder="e.g. PostgreSQL 16"
                  value={databaseTech}
                  onChange={(e) => setDatabaseTech(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-between items-center bg-[#0F0F0F] rounded-xl p-3 border border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-code-sm text-on-surface-variant/70 px-2.5 py-1 bg-surface-container rounded-md border border-outline-variant/30">
                ⚡ 14-Agent DAG Pipeline
              </span>
              <span className="text-xs text-on-surface-variant/50 hidden md:inline">
                Requirements → Architecture → Schema → API → UI/UX → Security → DevOps
              </span>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !idea.trim()}
              className="btn-primary text-xs flex items-center gap-2 px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 cursor-pointer transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Queueing 14-Agent Workflow...
                </>
              ) : (
                <>
                  Generate Blueprint
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 glass-card p-5 rounded-xl flex flex-col gap-3 border border-outline-variant/30">
            <h3 className="font-label-md text-xs text-on-surface uppercase tracking-wider font-semibold">
              Example Suggestions
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  idea: "SaaS Multi-tenant Project Management Platform",
                  requirements: "Task boards, sprint planning, team assignments, real-time activity feeds, and workspace permissions.",
                  frontend: "Next.js 15",
                  backend: "FastAPI",
                  database: "PostgreSQL 16",
                },
                {
                  idea: "FinTech Micro-lending API with Automated Risk Scoring",
                  requirements: "KYC document verification, credit risk engine, loan disbursement workflows, repayment tracking, and audit compliance.",
                  frontend: "React 19 / Vite",
                  backend: "FastAPI",
                  database: "PostgreSQL 16",
                },
                {
                  idea: "Real-time IoT Telemetry & Analytics Dashboard",
                  requirements: "Device ingestion pipeline, time-series data visualization, anomaly alerting, and fleet firmware update tracking.",
                  frontend: "Next.js 15",
                  backend: "Go / FastAPI",
                  database: "PostgreSQL + TimescaleDB",
                },
                {
                  idea: "AI Knowledge Base & Semantic Vector RAG Engine",
                  requirements: "Document ingestion with chunking, hybrid vector search with Qdrant, multi-agent query routing, and citation generation.",
                  frontend: "Next.js 15",
                  backend: "FastAPI",
                  database: "PostgreSQL + Qdrant",
                },
              ].map((suggestion) => (
                <button
                  key={suggestion.idea}
                  type="button"
                  onClick={() => handleTemplateSelect(suggestion)}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-[#161616] hover:border-primary/60 hover:bg-[#1E1E24] text-xs font-code-sm text-on-surface transition-all text-left"
                >
                  {suggestion.idea}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Quick Templates */}
      <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
          Quick Templates
        </h3>

        {/* Template Card 1 */}
        <div
          onClick={() =>
            handleTemplateSelect({
              idea: "Headless enterprise e-commerce platform with multi-warehouse inventory and Redis caching.",
              requirements: "Users should browse products, add products to cart, and place orders with Stripe. Admin dashboard with real-time stock sync and inventory analytics.",
              frontend: "Next.js 15",
              backend: "FastAPI",
              database: "PostgreSQL 16",
            })
          }
          className="glass-panel p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-200 border border-outline-variant/30 bg-[#141414]"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">
              E-Comm
            </span>
          </div>
          <h4 className="font-headline-md text-sm font-semibold text-on-surface mb-1">Modern Storefront</h4>
          <p className="text-xs font-body-sm text-on-surface-variant line-clamp-2">
            Headless e-commerce setup with catalog, cart, and payment integrations.
          </p>
        </div>

        {/* Template Card 2 */}
        <div
          onClick={() =>
            handleTemplateSelect({
              idea: "Enterprise HR & Team collaboration portal with multi-tenant RBAC.",
              requirements: "Multi-tenant organization hierarchy, employee directories, role-based permissions, automated onboarding workflows, and audit logging.",
              frontend: "React 19 / Vite",
              backend: "FastAPI",
              database: "PostgreSQL 16",
            })
          }
          className="glass-panel p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-200 border border-outline-variant/30 bg-[#141414]"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded bg-secondary-container/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">
              SaaS
            </span>
          </div>
          <h4 className="font-headline-md text-sm font-semibold text-on-surface mb-1">Internal HR Platform</h4>
          <p className="text-xs font-body-sm text-on-surface-variant line-clamp-2">
            Directory, role permissions, and company workflow tools.
          </p>
        </div>

        {/* Template Card 3 */}
        <div
          onClick={() =>
            handleTemplateSelect({
              idea: "Autonomous AI Agent Assistant with document vector indexing and semantic search.",
              requirements: "Document ingestion pipeline, chunking, semantic RAG search with vector database, real-time token streaming, and citation support.",
              frontend: "Next.js 15",
              backend: "FastAPI",
              database: "PostgreSQL + Qdrant",
            })
          }
          className="glass-panel p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-200 border border-outline-variant/30 bg-[#141414]"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 rounded bg-tertiary-container/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-tertiary" />
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">
              AI Bot
            </span>
          </div>
          <h4 className="font-headline-md text-sm font-semibold text-on-surface mb-1">RAG Agent Platform</h4>
          <p className="text-xs font-body-sm text-on-surface-variant line-clamp-2">
            RAG-based AI assistant integrated with Qdrant vectors and PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  )
}

