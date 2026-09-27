"use client"

import * as React from "react"
import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Code2,
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Server,
  Database,
  Globe,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Box,
  Plus,
} from "lucide-react"
import { codeGeneratorApi, blueprintsApi } from "@/lib/api"
import { CodeGenerateResponse, CodeFileItem, Blueprint, CodeValidationResponse } from "@/types"

function CodeStudioContent() {
  const searchParams = useSearchParams()
  const urlBlueprintId = searchParams.get("blueprint_id") || searchParams.get("id")

  const [blueprintId, setBlueprintId] = useState<string | null>(null)
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [generation, setGeneration] = useState<CodeGenerateResponse | null>(null)
  const [activeFile, setActiveFile] = useState<CodeFileItem | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({})

  const [isLoading, setIsLoading] = useState(true)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<CodeValidationResponse | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 1. Resolve active blueprint ID from URL or localStorage
  useEffect(() => {
    let activeId = urlBlueprintId
    if (!activeId && typeof window !== "undefined") {
      activeId = localStorage.getItem("forgeai_active_blueprint_id")
    }
    setBlueprintId(activeId)
  }, [urlBlueprintId])

  // 2. Load blueprint and generated code
  useEffect(() => {
    if (!blueprintId) {
      setIsLoading(false)
      return
    }

    async function loadData() {
      setIsLoading(true)
      setErrorMsg(null)

      try {
        const [bpData, genData] = await Promise.all([
          blueprintsApi.get(blueprintId!).catch(() => null),
          codeGeneratorApi.getByBlueprint(blueprintId!).catch(() => null),
        ])

        if (bpData) setBlueprint(bpData)

        if (genData && genData.files && genData.files.length > 0) {
          setGeneration(genData)
          // Default to main entrypoint or first file
          const defaultFile =
            genData.files.find((f) => f.path.includes("main.py")) ||
            genData.files.find((f) => f.path.includes("App.tsx")) ||
            genData.files[0]
          setActiveFile(defaultFile)
        } else {
          // If not yet synthesized, trigger generation automatically
          try {
            const newGen = await codeGeneratorApi.generate(blueprintId!)
            setGeneration(newGen)
            if (newGen.files.length > 0) {
              const defaultFile =
                newGen.files.find((f) => f.path.includes("main.py")) ||
                newGen.files.find((f) => f.path.includes("App.tsx")) ||
                newGen.files[0]
              setActiveFile(defaultFile)
            }
          } catch {
            // Leave generation as null to display generation trigger CTA
          }
        }
      } catch (err: unknown) {
        const text = err instanceof Error ? err.message : "Failed to load generated code files."
        console.error("Code Studio error:", err)
        setErrorMsg(text)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [blueprintId])

  // Manual Trigger: Synthesize or Refresh Code Generation
  const handleSynthesize = async () => {
    if (!blueprintId) return
    setIsSynthesizing(true)
    setErrorMsg(null)

    try {
      const newGen = await codeGeneratorApi.generate(blueprintId)
      setGeneration(newGen)
      if (newGen.files.length > 0) {
        const defaultFile =
          newGen.files.find((f) => f.path.includes("main.py")) ||
          newGen.files.find((f) => f.path.includes("App.tsx")) ||
          newGen.files[0]
        setActiveFile(defaultFile)
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to generate code from blueprint."
      setErrorMsg(text)
    } finally {
      setIsSynthesizing(false)
    }
  }

  // Download entire project as ZIP archive
  const handleDownloadZip = async () => {
    if (!blueprintId) return
    setIsDownloadingZip(true)
    try {
      await codeGeneratorApi.downloadZip(blueprintId)
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to download project ZIP."
      setErrorMsg(text)
    } finally {
      setIsDownloadingZip(false)
    }
  }

  // Validate generated project code
  const handleValidateProject = async () => {
    if (!blueprintId) return
    setIsValidating(true)
    setErrorMsg(null)
    try {
      const res = await codeGeneratorApi.validate(blueprintId)
      setValidationResult(res)
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to validate project code."
      setErrorMsg(text)
    } finally {
      setIsValidating(false)
    }
  }

  // Copy active file content
  const handleCopyCode = () => {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  // Download individual active file
  const handleDownloadActiveFile = () => {
    if (!activeFile?.content) return
    const blob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = activeFile.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFolder = (folderName: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }))
  }

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!generation?.files) return []
    if (!searchFilter.trim()) return generation.files
    const q = searchFilter.toLowerCase()
    return generation.files.filter((f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
  }, [generation, searchFilter])

  // Group files into directories
  const filesByDirectory = useMemo(() => {
    const groups: Record<string, CodeFileItem[]> = {}
    for (const file of filteredFiles) {
      const dir = file.directory || "."
      if (!groups[dir]) groups[dir] = []
      groups[dir].push(file)
    }
    return groups
  }, [filteredFiles])

  const getFileIcon = (fileName: string) => {
    const fn = fileName.toLowerCase()
    if (fn.endsWith(".py")) return <span className="text-yellow-400 font-mono text-xs font-bold">Py</span>
    if (fn.endsWith(".tsx") || fn.endsWith(".ts")) return <span className="text-blue-400 font-mono text-xs font-bold">TS</span>
    if (fn.endsWith(".sql")) return <Database className="w-3.5 h-3.5 text-blue-400" />
    if (fn.endsWith(".json")) return <span className="text-amber-400 font-mono text-xs font-bold">{'{}'}</span>
    if (fn.endsWith(".yaml") || fn.endsWith(".yml")) return <Globe className="w-3.5 h-3.5 text-emerald-400" />
    if (fn.includes("docker")) return <Server className="w-3.5 h-3.5 text-cyan-400" />
    if (fn.endsWith(".md")) return <FileText className="w-3.5 h-3.5 text-purple-400" />
    return <FileCode className="w-3.5 h-3.5 text-slate-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)] flex flex-col gap-4 p-3 md:p-6 text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{generation?.project_name || blueprint?.title || "Code Studio"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                v{generation?.version || blueprint?.current_version || 1}
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            {generation
              ? `Synthesized ${generation.total_files} project files (${formatFileSize(generation.total_bytes)}) from approved blueprint artifacts.`
              : "Autonomous full-stack project scaffolding engine."}
          </p>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {blueprintId && (
            <Link
              href={`/dashboard/blueprint-ai/software-architecture?id=${blueprintId}`}
              className="px-3.5 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Blueprint Studio</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isSynthesizing || !blueprintId}
            className="px-3.5 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Re-synthesize project code files from latest blueprint artifacts"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${isSynthesizing ? "animate-spin" : ""}`} />
            <span>{isSynthesizing ? "Synthesizing..." : "Re-generate Code"}</span>
          </button>

          <button
            type="button"
            onClick={handleValidateProject}
            disabled={isValidating || !generation}
            className="px-3.5 py-2 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-emerald-300 hover:text-emerald-200 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Validate project files for structure, syntax, and path security"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isValidating ? "Validating..." : "Validate Project"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloadingZip || !generation}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
            title="Download complete project scaffold with directory tree as a ZIP file"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Packing ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Project (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Result Banner */}
      {validationResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col gap-2 shrink-0 ${
            validationResult.valid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              {validationResult.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-200 font-bold">✓ Validation passed</span>
                  <span className="text-emerald-400/80 font-normal">
                    — All {validationResult.checked_files} files verified (Structure, Security & Syntax intact)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-200 font-bold">✕ Validation failed</span>
                  <span className="text-rose-400/80 font-normal">
                    — Found {validationResult.errors.length} issue(s) across {validationResult.checked_files} files
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setValidationResult(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss validation banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!validationResult.valid && validationResult.errors.length > 0 && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {validationResult.errors.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141c]/80 border border-rose-500/20 rounded-lg p-2.5 flex items-start gap-2 text-slate-200 font-mono text-[11px]"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-purple-300 font-bold truncate">{err.path || "Project root"}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] uppercase tracking-wide">
                        {err.type}
                      </span>
                    </div>
                    <p className="text-slate-300">{err.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {validationResult.warnings && validationResult.warnings.length > 0 && (
            <div className="mt-1 space-y-1 text-amber-300/90 text-[11px]">
              {validationResult.warnings.map((w, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    <span className="font-mono text-amber-200">{w.path || "Project"}</span>: {w.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 bg-[#12141c]/60 border border-[#222534] rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-xs font-mono text-slate-300">Loading project scaffold and source files...</p>
        </div>
      )}

      {/* Empty State: No active blueprint */}
      {!isLoading && !blueprintId && (
        <div className="flex-1 bg-[#12141c]/60 border border-[#222534] rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
            <Code2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Active Blueprint Selected</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Select or generate a software blueprint first to synthesize a downloadable codebase.
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

      {/* Empty State: Blueprint exists but code not yet generated */}
      {!isLoading && blueprintId && !generation && (
        <div className="flex-1 bg-[#12141c]/60 border border-[#222534] rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2232] border border-[#2d3248] text-purple-400 flex items-center justify-center font-bold">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ready to Synthesize Project Code</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Compile full-stack FastAPI & Next.js scaffolding, SQLAlchemy models, and Dockerfiles from your blueprint artifacts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Synthesize Project Files</span>
          </button>
        </div>
      )}

      {/* Main Studio View: File Tree + Code Editor */}
      {!isLoading && generation && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
          {/* Left Column: Project File Tree Explorer */}
          <div className="lg:col-span-4 bg-[#12141c]/90 border border-[#222534] rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Explorer Header & Search */}
            <div className="p-3 bg-[#161824] border-b border-[#222534] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-purple-400" />
                  Project Files ({generation.total_files})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatFileSize(generation.total_bytes)}
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-[#10121a] border border-[#25283c] rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Tree Nodes List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar font-mono text-xs">
              {Object.keys(filesByDirectory).map((dir) => {
                const isCollapsed = collapsedFolders[dir]
                const dirFiles = filesByDirectory[dir]
                return (
                  <div key={dir} className="flex flex-col">
                    {/* Directory Node */}
                    {dir !== "." && (
                      <button
                        type="button"
                        onClick={() => toggleFolder(dir)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-[#181a26] text-left transition-colors cursor-pointer select-none"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <Folder className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
                        <span className="font-semibold text-slate-300 truncate">{dir}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">{dirFiles.length}</span>
                      </button>
                    )}

                    {/* Files inside directory */}
                    {!isCollapsed && (
                      <div className={`space-y-0.5 ${dir !== "." ? "pl-5" : ""}`}>
                        {dirFiles.map((file) => {
                          const isSelected = activeFile?.path === file.path
                          return (
                            <button
                              key={file.path}
                              type="button"
                              onClick={() => setActiveFile(file)}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                                  : "text-slate-300 hover:bg-[#181a26] hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {getFileIcon(file.name)}
                                <span className="truncate">{file.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                {formatFileSize(file.size_bytes)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Code Viewer / Editor Area */}
          <div className="lg:col-span-8 bg-[#12141c]/90 border border-[#222534] rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {activeFile ? (
              <>
                {/* Active File Bar */}
                <div className="p-3 bg-[#161824] border-b border-[#222534] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(activeFile.name)}
                    <span className="font-mono text-xs font-bold text-white truncate">
                      {activeFile.path}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#202436] text-purple-300 font-mono">
                      {activeFile.language}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {formatFileSize(activeFile.size_bytes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-[11px]">Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadActiveFile}
                      className="px-3 py-1.5 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">Download</span>
                    </button>
                  </div>
                </div>

                {/* Code Content with Line Numbers */}
                <div className="flex-1 overflow-auto bg-[#0a0b12] p-4 font-mono text-xs leading-5 text-slate-200 custom-scrollbar flex">
                  {/* Line Numbers */}
                  <div className="select-none pr-4 pl-1 text-slate-600 text-right shrink-0 border-r border-[#222536] bg-[#0c0d14]/40">
                    {activeFile.content.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* File Code */}
                  <pre className="pl-4 pr-4 overflow-x-auto text-slate-300 flex-1 whitespace-pre leading-5">
                    {activeFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-2 text-slate-500 font-mono text-xs">
                <FileCode className="w-8 h-8 text-slate-600" />
                <span>Select a file from the explorer to preview source code</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CodeStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 font-mono text-sm">Loading Code Studio...</div>}>
      <CodeStudioContent />
    </Suspense>
  )
}
