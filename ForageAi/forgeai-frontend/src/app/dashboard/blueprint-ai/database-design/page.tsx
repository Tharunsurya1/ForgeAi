"use client"

import * as React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Database,
  Code2,
  Download,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  Globe,
  Plus,
} from "lucide-react"
import { blueprintsApi } from "@/lib/api"
import { Blueprint, BlueprintArtifact } from "@/types"

function DatabaseDesignContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedSql, setCopiedSql] = useState(false)
  const [copiedApi, setCopiedApi] = useState(false)

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
        console.error("Failed to load blueprint database artifact:", err)
        setErrorMsg(err.message || "Failed to load database schema artifact.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlueprint()
  }, [blueprintId])

  const dbArtifact = blueprint?.artifacts?.find(a => a.artifact_type === "database")
  const apiArtifact = blueprint?.artifacts?.find(a => a.artifact_type === "api")

  const handleCopySql = () => {
    if (dbArtifact?.content) {
      navigator.clipboard.writeText(dbArtifact.content)
      setCopiedSql(true)
      setTimeout(() => setCopiedSql(false), 2000)
    }
  }

  const handleCopyApi = () => {
    if (apiArtifact?.content) {
      navigator.clipboard.writeText(apiArtifact.content)
      setCopiedApi(true)
      setTimeout(() => setCopiedApi(false), 2000)
    }
  }

  const handleDownloadSchema = () => {
    if (!dbArtifact?.content) return
    const blob = new Blob([dbArtifact.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${blueprint?.title ? blueprint.title.toLowerCase().replace(/\s+/g, "_") : "schema"}.sql`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-16 flex flex-col gap-6 text-slate-100">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <Link href="/dashboard/projects" className="hover:text-white transition-colors">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/blueprint-ai/software-architecture" className="hover:text-white transition-colors">Blueprint</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-purple-400 font-bold">Database & API</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#12141c]/90 border border-[#222534] rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {blueprint?.title ? `${blueprint.title} — Database & API` : "Database & API Specifications"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Synthesized production PostgreSQL DDL schemas, relations, indexes, and OpenAPI 3.1 REST API contracts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownloadSchema}
            disabled={!dbArtifact}
            className="px-4 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download Schema</span>
          </button>
          
          <Link
            href="/dashboard/blueprint-ai/summary"
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
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs font-mono text-slate-300">Retrieving PostgreSQL schema from AI synthesis engine...</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State: No active blueprint */}
      {!isLoading && !blueprint && (
        <div className="p-12 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Blueprint Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Generate a full-stack blueprint to produce relational database DDL and OpenAPI schemas.
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

      {/* Main Content: Database Artifact & API Contract */}
      {!isLoading && blueprint && (
        <div className="flex flex-col gap-8">
          
          {/* SECTION 1: DATABASE DESIGN & DDL */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" /> PostgreSQL 16 Schema DDL
              </h2>
              <button
                onClick={handleCopySql}
                disabled={!dbArtifact}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-[#181a26] border border-[#2d3248] px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#0a0a0e] border border-[#232736] rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#12141c] px-4 py-2.5 border-b border-[#232736] flex items-center justify-between font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-200 font-bold">{dbArtifact?.file_path || "database/schema.sql"}</span>
                </div>
                <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  {dbArtifact ? `${(dbArtifact.file_size_bytes / 1024).toFixed(1)} KB` : "DDL"}
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                {dbArtifact?.content || "-- No database artifact found in this blueprint."}
              </pre>
            </div>
          </div>

          {/* SECTION 2: OPENAPI / REST API CONTRACT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> OpenAPI 3.1 REST Specifications
              </h2>
              <button
                onClick={handleCopyApi}
                disabled={!apiArtifact}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-[#181a26] border border-[#2d3248] px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                {copiedApi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy OpenAPI Spec</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#0a0a0e] border border-[#232736] rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#12141c] px-4 py-2.5 border-b border-[#232736] flex items-center justify-between font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-200 font-bold">{apiArtifact?.file_path || "api/openapi.yaml"}</span>
                </div>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {apiArtifact ? `${(apiArtifact.file_size_bytes / 1024).toFixed(1)} KB` : "YAML"}
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
                {apiArtifact?.content || "# No API artifact found in this blueprint."}
              </pre>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default function DatabaseDesignPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs font-mono text-slate-400">Loading Database & API Architecture...</p>
        </div>
      }
    >
      <DatabaseDesignContent />
    </Suspense>
  )
}

