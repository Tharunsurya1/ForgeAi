"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowLeft, ArrowRight, Loader2, AlertCircle, ShoppingCart, Users, Bot } from "lucide-react"
import { blueprintsApi, projectsApi } from "@/lib/api"

export default function NewProjectPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt)
  }

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) {
      setErrorMsg("Please provide a description of the application to blueprint.")
      return
    }

    setErrorMsg(null)
    setIsGenerating(true)

    try {
      // 1. Get or create active project
      const existingProjects = await projectsApi.list()
      let activeProject = existingProjects[0]

      if (!activeProject) {
        const words = prompt.trim().split(" ")
        const projectName = words.length <= 4 ? prompt.trim() : words.slice(0, 4).join(" ") + " App"
        activeProject = await projectsApi.create({
          name: projectName,
          description: prompt.slice(0, 200),
          tech_stack: {
            backend: "FastAPI",
            frontend: "Next.js 15",
            database: "PostgreSQL 16",
          },
        })
      }

      // 2. Trigger Multi-Agent AI Blueprint Generation
      const blueprint = await blueprintsApi.generate(activeProject.id, {
        prompt: prompt.trim(),
        title: `${activeProject.name} Blueprint`,
      })

      // Store active blueprint ID for sub-pages
      if (typeof window !== "undefined") {
        localStorage.setItem("forgeai_active_blueprint_id", blueprint.id)
        localStorage.setItem("forgeai_active_project_id", activeProject.id)
      }

      setIsGenerating(false)
      router.push(`/dashboard/blueprint-ai/software-architecture?id=${blueprint.id}`)
    } catch (err: any) {
      setIsGenerating(false)
      setErrorMsg(err.message || "Failed to generate blueprint. Please verify backend connectivity.")
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
            Describe your software concept in natural language. Our 7-agent AI DAG orchestrator will synthesize full-stack architecture, PostgreSQL schemas, and API contracts.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prompt Input Area */}
        <div className="relative glass-card rounded-xl p-1 flex flex-col flex-1 min-h-[320px] overflow-hidden border border-outline-variant/40">
          <div className="custom-input bg-[#0F0F0F] rounded-lg flex-1 flex flex-col p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity duration-500"></div>

            <textarea
              className="w-full flex-1 bg-transparent border-none resize-none focus:ring-0 text-on-surface font-body-lg placeholder-on-surface-variant/50 relative z-10 outline-none text-base leading-relaxed"
              placeholder="Describe your software idea... e.g., 'I want to build an enterprise multi-tenant e-commerce platform with real-time stock sync, Redis caching, and Stripe billing...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />

            {/* Toolbar inside prompt */}
            <div className="flex justify-between items-center mt-4 relative z-10 border-t border-outline-variant/30 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-code-sm text-on-surface-variant/70 px-2.5 py-1 bg-surface-container rounded-md border border-outline-variant/30">
                  ⚡ Multi-Agent DAG v2.0
                </span>
                <span className="text-xs text-on-surface-variant/50 hidden sm:inline">
                  (Requirements, DB Schema, Architecture, API, Frontend, Security, Docker)
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2 font-label-md text-sm font-semibold shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Blueprint
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions & Uploads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 glass-card p-5 rounded-xl flex flex-col gap-3 border border-outline-variant/30">
            <h3 className="font-label-md text-xs text-on-surface uppercase tracking-wider font-semibold">
              Example Suggestions
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "SaaS Multi-tenant Project Management Platform",
                "FinTech Micro-lending API with Risk Assessment",
                "Real-time IoT Telemetry & Analytics Dashboard",
                "AI Agent Knowledge Base & Vector RAG Engine",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleTemplateSelect(suggestion)}
                  className="px-3.5 py-2 rounded-lg border border-outline-variant/50 bg-[#161616] hover:border-primary/60 hover:bg-[#1E1E24] text-xs font-code-sm text-on-surface transition-all text-left"
                >
                  {suggestion}
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
            handleTemplateSelect(
              "Headless enterprise e-commerce platform with multi-warehouse inventory, Redis caching, and Stripe payment gateway."
            )
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
            handleTemplateSelect(
              "Enterprise HR & Team collaboration portal with multi-tenant RBAC, employee profiles, and audit logging."
            )
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
            handleTemplateSelect(
              "Autonomous AI Agent Assistant with document vector indexing, semantic search, and streaming responses."
            )
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
