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
  Zap,
  Globe,
  Plus,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint } from "@/types"

function SummaryPageContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
        const data = await blueprintsApi.get(activeId)
        setBlueprint(data)
      } catch (err: any) {
        console.error("Failed to load blueprint summary:", err)
        setErrorMsg(err.message || "Failed to load blueprint summary.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlueprint()
  }, [blueprintId])

  const handleExportJson = () => {
    if (!blueprint) return
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${blueprint.title.toLowerCase().replace(/\s+/g, "_")}_spec.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "architecture":
        return <Layers className="w-4 h-4 text-purple-400" />
      case "database":
        return <Database className="w-4 h-4 text-blue-400" />
      case "api":
        return <Globe className="w-4 h-4 text-emerald-400" />
      case "deployment":
        return <Rocket className="w-4 h-4 text-cyan-400" />
      case "security":
        return <ShieldCheck className="w-4 h-4 text-rose-400" />
      default:
        return <FileText className="w-4 h-4 text-amber-400" />
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-16 flex flex-col gap-6 text-slate-100">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <Link href="/dashboard/projects" className="hover:text-white transition-colors">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/blueprint-ai/software-architecture" className="hover:text-white transition-colors">Blueprint</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-purple-400 font-bold">Executive Summary</span>
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
            Full-stack architecture overview, synthesized technical artifacts, and project specification metadata.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportJson}
            disabled={!blueprint}
            className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export JSON Spec</span>
          </button>
          
          <Link
            href="/dashboard/blueprint-ai/software-architecture"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>View Architecture</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center gap-3 text-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs font-mono text-slate-300">Loading synthesized blueprint summary...</p>
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
            <h3 className="text-base font-bold text-white">No Active Blueprint</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate a full-stack blueprint to view the executive architecture summary.
            </p>
          </div>
          <Link
            href="/dashboard/blueprint-ai/new"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Blueprint</span>
          </Link>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && blueprint && (
        <div className="flex flex-col gap-6">
          
          {/* Executive Overview Banner */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Executive Synthesis
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                  {blueprint.status.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-[#181a26] border border-[#2d3248] px-2.5 py-0.5 rounded-full">
                  v{blueprint.current_version}.0
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-normal bg-[#0d0e14] p-4 rounded-xl border border-[#1e2232]">
              {blueprint.summary || "Complete multi-agent software architecture generated deterministically according to production design standards."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">TOTAL ARTIFACTS</span>
                <span className="text-white font-bold">{blueprint.artifacts?.length || 7} Files</span>
              </div>
              <div className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">ORCHESTRATOR</span>
                <span className="text-purple-400 font-bold">7-Agent DAG</span>
              </div>
              <div className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">PERSISTENCE</span>
                <span className="text-blue-400 font-bold">PostgreSQL 16</span>
              </div>
              <div className="p-3 bg-[#0d0e14] border border-[#232736] rounded-xl flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">GENERATED</span>
                <span className="text-emerald-400 font-bold">{new Date(blueprint.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Generated Artifacts Matrix */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#232736] pb-3">
              <Code2 className="w-4 h-4 text-blue-400" /> Synthesized Artifacts Catalog
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blueprint.artifacts?.map((art) => (
                <div key={art.id} className="p-4 bg-[#0d0e14] border border-[#232736] hover:border-purple-500/40 rounded-xl flex flex-col justify-between gap-3 shadow-sm transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#181a26] border border-[#2d3248] flex items-center justify-center">
                        {getArtifactIcon(art.artifact_type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{art.file_path}</h4>
                        <span className="text-[10px] text-slate-400 capitalize">{art.artifact_type}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                      {(art.file_size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1e2232] text-xs">
                    <span className="text-[10px] font-mono text-slate-500 capitalize">{art.language}</span>
                    <Link
                      href={
                        art.artifact_type === "database" || art.artifact_type === "api"
                          ? `/dashboard/blueprint-ai/database-design?id=${blueprint.id}`
                          : art.artifact_type === "deployment" || art.artifact_type === "security"
                          ? `/dashboard/blueprint-ai/deployment-plan?id=${blueprint.id}`
                          : `/dashboard/blueprint-ai/software-architecture?id=${blueprint.id}`
                      }
                      className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs font-mono text-slate-400">Loading Blueprint Summary...</p>
        </div>
      }
    >
      <SummaryPageContent />
    </Suspense>
  )
}

