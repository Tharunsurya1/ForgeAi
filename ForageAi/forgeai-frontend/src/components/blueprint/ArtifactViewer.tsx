"use client"

import * as React from "react"
import { useState } from "react"
import { Copy, Check, Download, FileCode, CheckCircle2, Layers, Cpu, Code2, Terminal, Info } from "lucide-react"
import { BlueprintArtifact } from "@/types"

interface ArtifactViewerProps {
  artifact: BlueprintArtifact | null | undefined
  title?: string
  description?: string
  fallbackMessage?: string
  showLineNumbers?: boolean
  maxHeight?: string
  onDownload?: () => void
}

export default function ArtifactViewer({
  artifact,
  title,
  description,
  fallbackMessage = "No artifact content available for this section.",
  showLineNumbers = true,
  maxHeight = "max-h-[600px]",
  onDownload,
}: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false)
  const [activeView, setActiveView] = useState<"formatted" | "raw">("formatted")

  if (!artifact) {
    return (
      <div className="p-8 rounded-xl bg-[#12141c]/60 border border-[#222534] flex flex-col items-center justify-center text-center gap-3">
        <Info className="w-8 h-8 text-slate-500" />
        <p className="text-xs text-slate-400 font-mono">{fallbackMessage}</p>
      </div>
    )
  }

  const handleCopy = () => {
    if (artifact.content) {
      navigator.clipboard.writeText(artifact.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
      return
    }
    if (!artifact.content) return
    const fileName = artifact.file_path.split("/").pop() || `${artifact.artifact_type}.txt`
    const blob = new Blob([artifact.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isMarkdown = artifact.language === "markdown" || artifact.file_path.endsWith(".md")
  const isJson = artifact.language === "json" || artifact.file_path.endsWith(".json")

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n")
    return (
      <div className="space-y-2 text-xs md:text-sm leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (trimmed.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-lg md:text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-[#282d40] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                {trimmed.replace(/^#\s+/, "")}
              </h1>
            )
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-base md:text-lg font-bold text-purple-300 mt-4 mb-1.5 flex items-center gap-1.5">
                <span className="text-purple-400">#</span>
                {trimmed.replace(/^##\s+/, "")}
              </h2>
            )
          }
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-sm md:text-base font-semibold text-blue-300 mt-3 mb-1">
                {trimmed.replace(/^###\s+/, "")}
              </h3>
            )
          }
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-3 py-0.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                <span>{renderInlineFormatting(trimmed.replace(/^[-*]\s+/, ""))}</span>
              </div>
            )
          }
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote key={idx} className="border-l-2 border-purple-500/60 bg-[#161826] px-3 py-1.5 rounded-r my-2 text-slate-300 italic">
                {renderInlineFormatting(trimmed.replace(/^>\s+/, ""))}
              </blockquote>
            )
          }
          if (trimmed.startsWith("```")) {
            return (
              <div key={idx} className="text-[10px] text-slate-500 font-mono py-0.5">
                {trimmed}
              </div>
            )
          }
          if (trimmed === "") {
            return <div key={idx} className="h-2" />
          }
          return (
            <p key={idx} className="text-slate-300">
              {renderInlineFormatting(line)}
            </p>
          )
        })}
      </div>
    )
  }

  const renderInlineFormatting = (str: string) => {
    // Process bold **text** and `code`
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-[#1e2234] text-purple-300 font-mono text-[11px]">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  const renderFormattedJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      return (
        <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )
    } catch {
      return (
        <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
          {jsonStr}
        </pre>
      )
    }
  }

  const renderCodeWithLineNumbers = (code: string) => {
    const lines = code.split("\n")
    return (
      <div className="flex font-mono text-xs leading-5">
        {showLineNumbers && (
          <div className="select-none pr-4 pl-1 text-slate-600 text-right shrink-0 border-r border-[#222536] bg-[#0c0d14]/40">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        )}
        <pre className="pl-4 pr-4 overflow-x-auto text-slate-300 flex-1 whitespace-pre">
          {code}
        </pre>
      </div>
    )
  }

  return (
    <div className="bg-[#12141c]/90 border border-[#222534] rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header bar */}
      <div className="p-4 bg-[#161824] border-b border-[#222534] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white font-mono">{title || artifact.file_path}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                v{artifact.version}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {artifact.status || "completed"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {artifact.agent_type ? `Agent: ${artifact.agent_type}` : `Type: ${artifact.artifact_type}`} • {artifact.language} • {formatFileSize(artifact.file_size_bytes)}
            </p>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isMarkdown && (
            <div className="flex items-center bg-[#0d0f18] p-0.5 rounded-lg border border-[#282d40] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveView("formatted")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  activeView === "formatted" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Rendered
              </button>
              <button
                type="button"
                onClick={() => setActiveView("raw")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  activeView === "raw" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Source
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#1b1e2c] hover:bg-[#25293d] border border-[#2d3248] text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy content to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-[#1b1e2c] hover:bg-[#25293d] border border-[#2d3248] text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download artifact file"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Download</span>
          </button>
        </div>
      </div>

      {description && (
        <div className="px-4 py-2 bg-[#141622] border-b border-[#1e2232] text-xs text-slate-400 font-sans">
          {description}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`p-4 bg-[#0a0b12] overflow-y-auto ${maxHeight} custom-scrollbar`}>
        {isMarkdown && activeView === "formatted" ? (
          renderMarkdown(artifact.content)
        ) : isJson && activeView === "formatted" ? (
          renderFormattedJson(artifact.content)
        ) : (
          renderCodeWithLineNumbers(artifact.content)
        )}
      </div>
    </div>
  )
}
