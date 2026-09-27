"use client"

import * as React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Rocket,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Server,
  Layers,
  Plus,
  Database,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint, BlueprintArtifact } from "@/types"
import DevOpsManifestViewer from "@/components/blueprint/DevOpsManifestViewer"

function DeploymentPlanContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [artifacts, setArtifacts] = useState<BlueprintArtifact[]>([])
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
        const [bp, artsResp] = await Promise.all([
          blueprintsApi.get(activeId),
          blueprintsApi.getArtifacts(activeId).catch(() => null),
        ])
        setBlueprint(bp)
        setArtifacts(artsResp?.artifacts || bp.artifacts || [])
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Failed to load deployment plan artifact."
        console.error("Failed to load blueprint deployment artifact:", err)
        setErrorMsg(text)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlueprint()
  }, [blueprintId])

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
        <span className="text-cyan-400 font-bold">Deployment & Cloud Infrastructure</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#12141c]/90 border border-[#222534] rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              <Rocket className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {blueprint?.title ? `${blueprint.title} — Deployment Plan` : "Deployment Plan & Infrastructure"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-stage Dockerfiles, docker-compose local and cloud clusters, Kubernetes manifests, and OWASP security configurations.
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
            href={`/dashboard/blueprint-ai/summary${blueprint?.id ? `?id=${blueprint.id}` : ""}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Blueprint Summary</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center gap-3 text-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs font-mono text-slate-300">Retrieving infrastructure manifests from DevOpsAgent...</p>
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
          <div className="w-14 h-14 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-cyan-400 flex items-center justify-center font-bold">
            <Server className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Blueprint Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate a blueprint to produce container manifests, Docker Compose services, and Kubernetes deployments.
            </p>
          </div>
          <Link
            href="/dashboard/blueprint-ai/new"
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Blueprint</span>
          </Link>
        </div>
      )}

      {/* Main Content: DevOps Manifest Tabs & Viewer */}
      {!isLoading && blueprint && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Containerization & Cloud Infrastructure Manifests</span>
            </h2>
          </div>

          <DevOpsManifestViewer artifacts={artifacts} />
        </div>
      )}
    </div>
  )
}

export default function DeploymentPlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm font-mono">Loading deployment plan...</div>}>
      <DeploymentPlanContent />
    </Suspense>
  )
}
