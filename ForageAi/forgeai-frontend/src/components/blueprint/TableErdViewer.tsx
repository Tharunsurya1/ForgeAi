"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Database, Key, Link2, Copy, Check, Download, Table, Layers, Search, Code2 } from "lucide-react"

interface ParsedColumn {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: string
  isNullable: boolean
  defaultValue?: string
}

interface ParsedTable {
  name: string
  columns: ParsedColumn[]
  indexes: string[]
}

interface TableErdViewerProps {
  sqlContent: string
  blueprintTitle?: string
}

export default function TableErdViewer({ sqlContent, blueprintTitle = "schema" }: TableErdViewerProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "ddl">("visual")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [copied, setCopied] = useState(false)

  // Parse SQL DDL to extract tables, columns, constraints
  const parsedTables = useMemo(() => {
    const tables: ParsedTable[] = []
    if (!sqlContent) return tables

    // Match CREATE TABLE [IF NOT EXISTS] <name> ( ... );
    const tableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-zA-Z0-9_".]+)\s*\(([\s\S]*?)\);/gi
    let match: RegExpExecArray | null

    while ((match = tableRegex.exec(sqlContent)) !== null) {
      const rawName = match[1].replace(/["']/g, "")
      const tableName = rawName.includes(".") ? rawName.split(".").pop() || rawName : rawName
      const body = match[2]

      const columns: ParsedColumn[] = []
      const indexes: string[] = []

      // Split lines inside table definition
      const rawLines = body.split(",\n")
      for (const rawLine of rawLines) {
        const line = rawLine.trim()
        if (!line) continue

        // Skip table-level constraints if they don't define a column directly
        if (/^PRIMARY\s+KEY/i.test(line)) {
          const pkMatch = line.match(/\((.*?)\)/)
          if (pkMatch) {
            const pkCols = pkMatch[1].split(",").map((c) => c.trim().replace(/["']/g, ""))
            for (const col of columns) {
              if (pkCols.includes(col.name)) col.isPrimaryKey = true
            }
          }
          continue
        }

        if (/^FOREIGN\s+KEY/i.test(line) || /^CONSTRAINT.*FOREIGN\s+KEY/i.test(line)) {
          const fkMatch = line.match(/FOREIGN\s+KEY\s*\((.*?)\)\s*REFERENCES\s+([a-zA-Z0-9_".]+)\s*\((.*?)\)/i)
          if (fkMatch) {
            const fkCol = fkMatch[1].trim().replace(/["']/g, "")
            const targetTable = fkMatch[2].trim().replace(/["']/g, "")
            const targetCol = fkMatch[3].trim().replace(/["']/g, "")
            const found = columns.find((c) => c.name === fkCol)
            if (found) {
              found.isForeignKey = true
              found.references = `${targetTable}(${targetCol})`
            }
          }
          continue
        }

        if (/^CONSTRAINT/i.test(line)) {
          continue
        }

        // Standard column definition: <col_name> <col_type> [constraints...]
        const colParts = line.split(/\s+/)
        if (colParts.length >= 2) {
          const colName = colParts[0].replace(/["']/g, "")
          const colType = colParts[1].toUpperCase()

          const isPrimaryKey = /PRIMARY\s+KEY/i.test(line)
          const isForeignKey = /REFERENCES/i.test(line)
          let references: string | undefined
          if (isForeignKey) {
            const refMatch = line.match(/REFERENCES\s+([a-zA-Z0-9_".]+)\s*\((.*?)\)/i)
            if (refMatch) {
              references = `${refMatch[1].replace(/["']/g, "")}(${refMatch[2].replace(/["']/g, "")})`
            }
          }

          const isNullable = !/NOT\s+NULL/i.test(line) && !isPrimaryKey

          let defaultValue: string | undefined
          const defMatch = line.match(/DEFAULT\s+([^,]+)/i)
          if (defMatch) {
            defaultValue = defMatch[1].trim()
          }

          columns.push({
            name: colName,
            type: colType,
            isPrimaryKey,
            isForeignKey,
            references,
            isNullable,
            defaultValue,
          })
        }
      }

      // Check for indexes associated with this table
      const idxRegex = new RegExp(`CREATE\\s+(?:UNIQUE\\s+)?INDEX[\\s\\S]*?ON\\s+["']?${tableName}["']?\\s*\\((.*?)\\);`, "gi")
      let idxMatch: RegExpExecArray | null
      while ((idxMatch = idxRegex.exec(sqlContent)) !== null) {
        indexes.push(idxMatch[0].trim())
      }

      tables.push({
        name: tableName,
        columns,
        indexes,
      })
    }

    return tables
  }, [sqlContent])

  const filteredTables = useMemo(() => {
    if (!searchFilter.trim()) return parsedTables
    const q = searchFilter.toLowerCase()
    return parsedTables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
    )
  }, [parsedTables, searchFilter])

  const handleCopy = () => {
    if (sqlContent) {
      navigator.clipboard.writeText(sqlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!sqlContent) return
    const blob = new Blob([sqlContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${blueprintTitle.toLowerCase().replace(/\s+/g, "_")}_schema.sql`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#12141c]/90 border border-[#222534] p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0c0d14] p-1 rounded-xl border border-[#282d40] text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "visual"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Visual Schema Explorer ({parsedTables.length} Tables)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ddl")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "ddl"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw PostgreSQL 16 DDL</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {activeTab === "visual" && (
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter tables or columns..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#181a26] border border-[#2d3248] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy SQL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download DDL</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTables.map((table) => {
            const isHighlighted = selectedTable === table.name
            return (
              <div
                key={table.name}
                onClick={() => setSelectedTable(isHighlighted ? null : table.name)}
                className={`bg-[#12141c]/90 border rounded-2xl overflow-hidden shadow-xl transition-all cursor-pointer ${
                  isHighlighted ? "border-purple-500 shadow-purple-500/10" : "border-[#222534] hover:border-[#2d3248]"
                }`}
              >
                {/* Table Header */}
                <div className="p-4 bg-[#161824] border-b border-[#222534] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">{table.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {table.columns.length} columns • {table.indexes.length} indexes
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Table
                  </span>
                </div>

                {/* Columns List */}
                <div className="divide-y divide-[#1e2232]">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#161824]/50 transition-colors font-mono"
                    >
                      <div className="flex items-center gap-2">
                        {col.isPrimaryKey ? (
                          <span title="Primary Key" className="text-amber-400 flex items-center">
                            <Key className="w-3.5 h-3.5" />
                          </span>
                        ) : col.isForeignKey ? (
                          <span title={`Foreign Key: ${col.references}`} className="text-purple-400 flex items-center">
                            <Link2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="w-3.5 h-3.5 inline-block text-slate-600">•</span>
                        )}

                        <span className={`font-semibold ${col.isPrimaryKey ? "text-amber-300" : col.isForeignKey ? "text-purple-300" : "text-slate-200"}`}>
                          {col.name}
                        </span>

                        {col.isPrimaryKey && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            PK
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            FK
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-blue-300 font-mono">{col.type}</span>
                        {!col.isNullable && (
                          <span className="text-[9px] text-rose-400/90 font-mono">REQ</span>
                        )}
                        {col.references && (
                          <span className="text-[9px] text-purple-400 font-mono hidden sm:inline" title={col.references}>
                            → {col.references}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Raw SQL DDL view */
        <div className="bg-[#0e1018] border border-[#222534] rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[650px] custom-scrollbar">
          <pre className="whitespace-pre leading-relaxed">{sqlContent}</pre>
        </div>
      )}
    </div>
  )
}
