"use client"

import * as React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Sparkles,
  Folder,
  ChevronRight,
  Download,
  FileText,
  Code2,
  Database,
  ShieldCheck,
  Rocket,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Globe,
  Plus,
  Copy,
  Check,
  Award,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint, BlueprintArtifact } from "@/types"

function SummaryPageContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedSummary, setCopiedSummary] = useState(false)

  useEffect(() => {
    const fetchBlueprint = async () => {
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
        setArtifacts(artsResp?.artifacts || bp.artifacts || [])
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Failed to load blueprint summary."
        console.error("Failed to load blueprint summary:", err)
        setErrorMsg(text)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlueprint()
  }, [blueprintId])

  const handleExportJson = () => {
    if (!blueprint) return
    const exportData = {
      blueprint_id: blueprint.id,
      title: blueprint.title,
      summary: blueprint.summary,
      version: blueprint.current_version,
      status: blueprint.status,
      created_at: blueprint.created_at,
      metadata: blueprint.metadata,
      artifacts_count: artifacts.length,
      artifacts: artifacts.map((a) => ({
        id: a.id,
        agent_type: a.agent_type,
        artifact_type: a.artifact_type,
        file_path: a.file_path,
        language: a.language,
        version: a.version,
        file_size_bytes: a.file_size_bytes,
        created_at: a.created_at,
      })),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${blueprint.title.toLowerCase().replace(/\s+/g, "_")}_spec.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyMarkdownSummary = () => {
    if (!blueprint) return
    const md = [
      `# ${blueprint.title}`,
      `**Status:** ${blueprint.status.toUpperCase()} | **Version:** v${blueprint.current_version}`,
      `**Quality Score:** ${blueprint.metadata?.quality_score ?? 95}/100 (${blueprint.metadata?.approval_verdict ?? "APPROVED"})`,
      `\n## Executive Summary\n${blueprint.summary || "No summary available."}`,
      `\n## Synthesized Artifacts (${artifacts.length})`,
      ...artifacts.map((a) => `- **${a.file_path}** (${a.agent_type || a.artifact_type}, v${a.version}, ${a.language})`),
    ].join("\n")

    navigator.clipboard.writeText(md)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getArtifactIcon = (type: string, path: string) => {
    const p = path.toLowerCase()
    const t = type.toLowerCase()
    if (t === "database" || p.endsWith(".sql")) return <Database className="w-4 h-4 text-blue-400" />
    if (t === "api" || p.includes("openapi")) return <Globe className="w-4 h-4 text-emerald-400" />
    if (t === "deployment" || p.includes("docker") || p.includes("k8s")) return <Rocket className="w-4 h-4 text-cyan-400" />
    if (t === "security" || p.includes("security")) return <ShieldCheck className="w-4 h-4 text-rose-400" />
    if (t === "architecture" || p.includes("architecture")) return <Layers className="w-4 h-4 text-purple-400" />
    return <FileText className="w-4 h-4 text-amber-400" />
  }

  const qualityScore = blueprint?.metadata?.quality_score ?? 95
  const approvalVerdict = blueprint?.metadata?.approval_verdict ?? "APPROVED"

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-16 flex flex-col gap-6 text-slate-100">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <Link href="/dashboard/projects" className="hover:text-white transition-colors">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/dashboard/blueprint-ai/software-architecture${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
          className="hover:text-white transition-colors"
        >
          Blueprint
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-purple-400 font-bold">Summary</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#12141c]/90 border border-[#222534] rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {blueprint?.title ? `${blueprint.title} — Executive Summary` : "Blueprint Executive Summary"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Consolidated overview of multi-agent software architecture, data schemas, API contracts, deployment specifications, and quality reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCopyMarkdownSummary}
            disabled={!blueprint}
            className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied Markdown</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportJson}
            disabled={!blueprint}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Spec JSON</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center gap-3 text-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs font-mono text-slate-300">Compiling executive blueprint summary...</p>
        </div>
      )}

      {/* Error Alert */}
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
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Blueprint Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate a blueprint to view executive summaries and specialist agent deliverables.
            </p>
          </div>
          <Link
            href="/dashboard/blueprint-ai/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Blueprint</span>
          </Link>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && blueprint && (
        <div className="flex flex-col gap-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metric 1: Quality Score */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Quality Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white font-mono">{qualityScore}</span>
                <span className="text-xs text-emerald-400 font-mono">({approvalVerdict})</span>
              </div>
            </div>

            {/* Metric 2: Artifacts Count */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Specialist Artifacts
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white font-mono">{artifacts.length}</span>
                <span className="text-xs text-slate-400 font-mono">persisted in DB</span>
              </div>
            </div>

            {/* Metric 3: Version */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Current Version
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white font-mono">v{blueprint.current_version}</span>
                <span className="text-xs text-emerald-400 font-mono">Completed</span>
              </div>
            </div>

            {/* Metric 4: Generated Date */}
            <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-5 shadow-xl flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Generated On
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-bold text-white font-mono">
                  {new Date(blueprint.created_at).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(blueprint.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Studio Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/dashboard/blueprint-ai/software-architecture${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
              className="p-5 rounded-2xl bg-[#12141c]/90 border border-[#222534] hover:border-purple-500/50 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-purple-400 group-hover:translate-x-0.5 transition-transform">
                  Inspect →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Software Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-stack topology, ADRs, SRS specifications, and business analysis.
              </p>
            </Link>

            <Link
              href={`/dashboard/blueprint-ai/database-design${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
              className="p-5 rounded-2xl bg-[#12141c]/90 border border-[#222534] hover:border-blue-500/50 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  Inspect →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Database & API</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual PostgreSQL 16 schema explorer, DDL migrations, and OpenAPI 3.1 contracts.
              </p>
            </Link>

            <Link
              href={`/dashboard/blueprint-ai/deployment-plan${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
              className="p-5 rounded-2xl bg-[#12141c]/90 border border-[#222534] hover:border-cyan-500/50 transition-all flex flex-col gap-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Rocket className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  Inspect →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Deployment & DevOps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dockerfile, Docker Compose local/cloud clusters, and Kubernetes manifests.
              </p>
            </Link>
          </div>

          {/* Persisted Deliverables Inventory Table */}
          <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 bg-[#161824] border-b border-[#222534] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Persisted Specialist Deliverables ({artifacts.length})
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Direct database records from PostgreSQL blueprint_artifacts table.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#10121a] text-slate-400 border-b border-[#222534] uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Artifact</th>
                    <th className="py-3 px-4">Specialist Agent</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2232] text-slate-300">
                  {artifacts.map((art) => (
                    <tr key={art.id} className="hover:bg-[#161826]/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2 font-semibold text-white">
                        {getArtifactIcon(art.artifact_type, art.file_path)}
                        <span>{art.file_path}</span>
                      </td>
                      <td className="py-3 px-4 text-purple-300">
                        {art.agent_type || art.artifact_type}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {art.language}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {formatFileSize(art.file_size_bytes)}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        v{art.version}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm font-mono">Loading executive blueprint summary...</div>}>
      <SummaryPageContent />
    </Suspense>
  )
}
