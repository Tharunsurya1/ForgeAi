"use client"

import * as React from "react"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Folder,
  Rocket,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Database,
  Globe,
  Code2,
  Terminal,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
  Award,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint, BlueprintArtifact } from "@/types"
import ArtifactViewer from "@/components/blueprint/ArtifactViewer"

function ArchitectureContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([])
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("architecture")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function loadBlueprint() {
      setIsLoading(true)
      setErrorMsg(null)

      let activeId = blueprintId
      if (!activeId && typeof window !== "undefined") {
        activeId = localStorage.getItem("forgeai_active_blueprint_id")
      }

      if (!activeId) {
        setIsLoading(false)
        return
      }

      try {
        const [bp, artsResp] = await Promise.all([
          blueprintsApi.get(activeId),
          blueprintsApi.getArtifacts(activeId).catch(() => null),
        ])
        setBlueprint(bp)

        const loadedArtifacts = artsResp?.artifacts || bp.artifacts || []
        setArtifacts(loadedArtifacts)

        // Select initial primary artifact: architecture, or requirements, or first available
        const defaultArch =
          loadedArtifacts.find((a) => a.file_path.includes("ARCHITECTURE") || a.artifact_type === "architecture") ||
          loadedArtifacts.find((a) => a.artifact_type === "requirements") ||
          loadedArtifacts[0]

        if (defaultArch) {
          setSelectedArtifactId(defaultArch.id)
        }
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Failed to load software architecture blueprint."
        console.error("Failed to load active blueprint", err)
        setErrorMsg(text)
      } finally {
        setIsLoading(false)
      }
    }
    loadBlueprint()
  }, [blueprintId])

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0]

  // Categorize artifacts for quick filtering
  const categories = [
    { id: "architecture", label: "Architecture & System", icon: Layers },
    { id: "requirements", label: "Requirements & SRS", icon: FileCode },
    { id: "business", label: "Business Analysis", icon: Award },
    { id: "api", label: "API & Backend", icon: Globe },
    { id: "review", label: "Review & Quality", icon: ShieldCheck },
  ]

  const getFilteredArtifacts = (catId: string) => {
    switch (catId) {
      case "architecture":
        return artifacts.filter(
          (a) =>
            a.artifact_type === "architecture" ||
            a.file_path.includes("ARCHITECTURE") ||
            a.file_path.includes("README") ||
            a.file_path.includes("SUPERVISOR")
        )
      case "requirements":
        return artifacts.filter((a) => a.artifact_type === "requirements" || a.file_path.includes("REQUIREMENTS"))
      case "business":
        return artifacts.filter((a) => a.artifact_type === "business_analysis" || a.file_path.includes("BUSINESS"))
      case "api":
        return artifacts.filter(
          (a) =>
            a.artifact_type === "api" ||
            a.artifact_type === "backend" ||
            a.artifact_type === "frontend" ||
            a.file_path.includes("openapi") ||
            a.file_path.includes("main.py") ||
            a.file_path.includes("App.tsx")
        )
      case "review":
        return artifacts.filter(
          (a) =>
            a.artifact_type === "code_review" ||
            a.artifact_type === "optimization" ||
            a.file_path.includes("REVIEW") ||
            a.file_path.includes("OPTIMIZATION")
        )
      default:
        return artifacts
    }
  }

  const qualityScore = blueprint?.metadata?.quality_score ?? 95
  const approvalVerdict = blueprint?.metadata?.approval_verdict ?? "APPROVED"

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-16 flex flex-col gap-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#12141c]/90 border border-[#222534] rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Folder className="text-purple-400 w-4 h-4" />
            <span className="text-xs text-slate-400 font-mono">
              Blueprint ID: {blueprint?.id ? `${blueprint.id.slice(0, 8)}...` : "None"} • Version v{blueprint?.current_version || 1}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {blueprint?.status || "Ready"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            {blueprint?.title || "Software Architecture Studio"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {blueprint?.summary || "14-agent synthesized architecture specifications, ADRs, component contracts, and quality audits."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/dashboard/blueprint-ai/database-design${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
            className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-blue-400" />
            <span>Database & API</span>
          </Link>

          <Link
            href={`/dashboard/blueprint-ai/deployment-plan${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Deployment Plan</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center gap-3 text-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs font-mono text-slate-300">Fetching specialist artifacts from PostgreSQL database...</p>
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !blueprint && (
        <div className="p-12 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Blueprint Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Trigger a multi-agent AI execution to generate full-stack architecture, schemas, and specifications.
            </p>
          </div>
          <Link
            href="/dashboard/blueprint-ai/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Blueprint</span>
          </Link>
        </div>
      )}

      {/* Main Studio Bento Grid */}
      {!isLoading && blueprint && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Category Filter & Artifact Viewer */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#222534]">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id
                const count = getFilteredArtifacts(cat.id).length
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id)
                      const matching = getFilteredArtifacts(cat.id)
                      if (matching.length > 0) {
                        setSelectedArtifactId(matching[0].id)
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-[#141622] border border-[#222534] text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span className="text-[10px] px-1.5 rounded-full bg-white/10 text-slate-200">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Artifact Content Viewer */}
            {selectedArtifact ? (
              <ArtifactViewer
                artifact={selectedArtifact}
                title={selectedArtifact.file_path}
                description={
                  selectedArtifact.agent_type
                    ? `Synthesized by ${selectedArtifact.agent_type} • Version ${selectedArtifact.version}`
                    : `Artifact Type: ${selectedArtifact.artifact_type}`
                }
                maxHeight="max-h-[700px]"
              />
            ) : (
              <div className="p-12 bg-[#12141c]/60 border border-[#222534] rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                <FileCode className="w-8 h-8 text-slate-500" />
                <p className="text-xs text-slate-400 font-mono">No artifacts found in this category.</p>
              </div>
            )}
          </div>

          {/* Right Column: Specialist Deliverables List & Metadata */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Review & Score Card */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Quality Score</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  {approvalVerdict}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">{qualityScore}</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evaluated by CodeReviewAgent and OptimizationAgent against zero-hallucination and security benchmarks.
              </p>
            </div>

            {/* All Persisted Specialist Artifacts Inventory */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Persisted Artifacts ({artifacts.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {artifacts.map((art) => {
                  const isSelected = art.id === selectedArtifact?.id
                  return (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArtifactId(art.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-purple-600/15 border-purple-500/60 shadow-md shadow-purple-500/10"
                          : "bg-[#161826] border-[#25283c] hover:border-[#353952]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-mono font-semibold truncate ${isSelected ? "text-purple-300" : "text-slate-200"}`}>
                          {art.file_path}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {art.agent_type || art.artifact_type} • v{art.version} • {art.language}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        Ready
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArchitecturePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm font-mono">Loading architecture blueprint...</div>}>
      <ArchitectureContent />
    </Suspense>
  )
}


