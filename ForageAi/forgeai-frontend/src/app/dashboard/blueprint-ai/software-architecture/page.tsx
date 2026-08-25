"use client"

import * as React from "react"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Folder,
  Download,
  Rocket,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint, BlueprintArtifact } from "@/types"

function ArchitectureContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [archArtifact, setArchArtifact] = useState<BlueprintArtifact | null>(null)
  const [reqArtifact, setReqArtifact] = useState<BlueprintArtifact | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadBlueprint() {
      const activeId = blueprintId || (typeof window !== "undefined" ? localStorage.getItem("forgeai_active_blueprint_id") : null)
      if (!activeId) return

      try {
        setIsLoading(true)
        const bp = await blueprintsApi.get(activeId)
        setBlueprint(bp)

        const arch = bp.artifacts?.find((a) => a.artifact_type === "architecture")
        const req = bp.artifacts?.find((a) => a.artifact_type === "requirements")
        if (arch) setArchArtifact(arch)
        if (req) setReqArtifact(req)
      } catch (e) {
        console.error("Failed to load active blueprint", e)
      } finally {
        setIsLoading(false)
      }
    }
    loadBlueprint()
  }, [blueprintId])

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-12 p-4 md:p-6 text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Folder className="text-primary w-4 h-4" />
            <span className="text-body-sm text-on-surface-variant font-medium">
              Project Blueprint: {blueprint?.title || "Project Architecture"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display-xl text-on-surface">
            Software Architecture & Tech Stack
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-1 max-w-2xl text-sm md:text-base">
            {blueprint?.summary || "AI-generated blueprint optimized for high concurrency and zero-hallucination deployment."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/blueprint-ai/database-design"
            className="btn-primary px-4 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all font-label-md text-sm rounded-lg"
          >
            <Rocket className="w-4 h-4" />
            View Database & API
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Architecture & Tech Stack */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* High-Level Architecture Overview */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden group border border-[#262626] bg-[#12141c]/90">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Layers className="text-primary w-5 h-5" />
                  System Topology & C4 Architecture
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Cloud-native async modular monolith with high-concurrency async I/O.
                </p>
              </div>
            </div>

            {/* Architecture Diagram Visualization */}
            <div className="w-full bg-[#0A0A0C] rounded-lg border border-outline-variant/30 p-6 flex flex-col items-center justify-center relative overflow-hidden mb-4">
              <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                {/* Gateway */}
                <div className="bg-[#181a26] border border-primary/40 px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold text-primary">
                  <Server className="w-4 h-4" />
                  <span>Nginx Ingress & Reverse Proxy (TLS 1.3)</span>
                </div>

                <div className="w-px h-6 bg-outline-variant"></div>

                {/* Core Services */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="bg-[#181a26] border border-outline-variant/50 p-3 rounded-lg flex flex-col items-center text-center">
                    <ShieldCheck className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-xs font-semibold">Auth Service</span>
                    <span className="text-[10px] text-slate-400">JWT Dual-Token</span>
                  </div>
                  <div className="bg-[#181a26] border border-outline-variant/50 p-3 rounded-lg flex flex-col items-center text-center">
                    <Cpu className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-xs font-semibold">FastAPI Core</span>
                    <span className="text-[10px] text-slate-400">REST & Streaming</span>
                  </div>
                  <div className="bg-[#181a26] border border-outline-variant/50 p-3 rounded-lg flex flex-col items-center text-center">
                    <RefreshCw className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs font-semibold">AI DAG Engine</span>
                    <span className="text-[10px] text-slate-400">LangGraph Workers</span>
                  </div>
                </div>

                <div className="w-px h-6 bg-outline-variant"></div>

                {/* Storage Tier */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-[#181a26] border border-outline-variant/50 p-3 rounded-lg flex items-center justify-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold">PostgreSQL 16</span>
                  </div>
                  <div className="bg-[#181a26] border border-outline-variant/50 p-3 rounded-lg flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold">Redis 7.2 Cache</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Architecture Markdown Preview if available */}
            {archArtifact && (
              <div className="mt-4 p-4 rounded-lg bg-[#0F0F12] border border-outline-variant/30 text-xs font-mono max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-300">
                {archArtifact.content}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel border border-[#262626] rounded-xl p-6 bg-[#12141c]/90">
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400 w-5 h-5" />
              Synthesized Artifacts
            </h3>
            <div className="space-y-3">
              {[
                { name: "Requirements (SRS)", path: "docs/REQUIREMENTS.md", type: "RequirementsAgent" },
                { name: "Architecture & ADRs", path: "docs/ARCHITECTURE.md", type: "ArchitectureAgent" },
                { name: "PostgreSQL DDL & ERD", path: "database/schema.sql", type: "DatabaseAgent" },
                { name: "REST API (OpenAPI 3.1)", path: "api/openapi.yaml", type: "BackendApiAgent" },
                { name: "Frontend Component Tree", path: "frontend/STRUCTURE.md", type: "FrontendAgent" },
                { name: "Security & OWASP Matrix", path: "security/SECURITY_POLICY.md", type: "SecurityAgent" },
                { name: "Dockerfile & CI/CD", path: "docker/docker-compose.yml", type: "DeploymentAgent" },
              ].map((art, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#181a26] border border-outline-variant/30 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{art.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{art.path}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArchitecturePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading architecture blueprint...</div>}>
      <ArchitectureContent />
    </Suspense>
  )
}

