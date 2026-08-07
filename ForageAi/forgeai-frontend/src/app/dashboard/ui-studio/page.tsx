"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Palette,
  Sparkles,
  Plus,
  Search,
  Filter,
  Play,
  Copy,
  Star,
  Check,
  Clock,
  Tag,
  Folder,
  FileText,
  Share2,
  Download,
  Trash2,
  Edit3,
  Eye,
  Users,
  Bot,
  Database,
  ShieldCheck,
  Zap,
  BarChart3,
  Wand2,
  FileCode,
  Layers,
  Terminal,
  Server,
  Globe,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  RefreshCw,
  Upload,
  Activity,
  Sliders,
  ChevronDown,
  Bookmark,
  Smartphone,
  Laptop,
  Monitor,
  Layout,
  Paintbrush,
  Code,
  Sun,
  Moon,
  Maximize2,
  Grid,
  TrendingUp,
} from "lucide-react"

export default function UIStudioPage() {
  const router = useRouter()

  // Active Navigation Tab (11 Tabs)
  const [activeTab, setActiveTab] = useState<
    | "landing"
    | "dashboards"
    | "forms"
    | "components"
    | "mobile"
    | "wireframes"
    | "designsystem"
    | "themebuilder"
    | "export"
    | "history"
    | "templates"
  >("landing")

  // Target Device Viewport State
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // Color Theme Mode State
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark")

  // Design Generation Configuration State
  const [selectedStyle, setSelectedStyle] = useState("Glassmorphism Enterprise")
  const [selectedCategory, setSelectedCategory] = useState("SaaS Landing Page")
  const [designPrompt, setDesignPrompt] = useState(
    "Design a ultra-modern Glassmorphism SaaS Landing Page for an AI Code Generator featuring vibrant purple/blue gradients, interactive hero section, stat cards, and pricing comparison table."
  )

  // Live Generator & Toast State
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Theme Builder Customization State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: "#7c3aed", // Purple-600
    secondaryColor: "#2563eb", // Blue-600
    accentColor: "#10b981", // Emerald-500
    borderRadius: "20px",
    glassEffect: "Blur 20px + Border 1px #232736",
    fontFamily: "Inter / Outfit",
  })

  // Handle AI Design Generation
  const handleGenerateDesign = (categoryName?: string) => {
    if (categoryName) setSelectedCategory(categoryName)
    setIsGenerating(true)
    setToastMessage("🎨 AI Design Agent is composing layout, colors, typography tokens & responsive wireframes...")

    setTimeout(() => {
      setIsGenerating(false)
      setToastMessage("✨ Production UI layout & design system generated successfully!")
      setTimeout(() => setToastMessage(null), 3500)
    }, 1600)
  }

  // Handle Copy Code/Export
  const handleExport = (format: string) => {
    setToastMessage(`🚀 Exported complete design layout to ${format} package!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">AI UI Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Design beautiful interfaces, wireframes, design systems and responsive screens with AI in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => handleGenerateDesign()}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>+ Generate Design</span>
          </button>

          <button className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Figma / Design</span>
          </button>

          <button
            onClick={() => handleExport("React + Tailwind")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Code</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11 TOP NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#141620] border border-[#232736] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 custom-scrollbar text-xs font-semibold">
          {[
            { id: "landing", label: "Landing Pages", icon: Layout },
            { id: "dashboards", label: "Dashboards", icon: BarChart3 },
            { id: "forms", label: "Forms & Wizards", icon: FileText },
            { id: "components", label: "Components", icon: Grid },
            { id: "mobile", label: "Mobile Screens", icon: Smartphone },
            { id: "wireframes", label: "Wireframes", icon: Layers },
            { id: "designsystem", label: "Design System", icon: Palette },
            { id: "themebuilder", label: "Theme Builder", icon: Paintbrush },
            { id: "export", label: "Export to Code", icon: Code },
            { id: "history", label: "Design History", icon: Clock },
            { id: "templates", label: "UI Templates", icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN BODY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* MAIN COLUMN (3 COLUMNS: DESIGN PROMPT WIZARD & LIVE UI CANVAS PREVIEW) */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full">

          {/* AI DESIGN PROMPT WIZARD */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-3 border-b border-[#232736]">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-400" /> AI Design Prompt
                </span>
              </div>

              {/* Style & Device Selectors */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
                >
                  <option>Glassmorphism Enterprise</option>
                  <option>Minimal Modern Dark</option>
                  <option>Neumorphism Soft</option>
                  <option>Apple Clean Style</option>
                  <option>Material Design 3</option>
                  <option>Tailwind Premium UI</option>
                </select>

                {/* Viewport Device Toggles */}
                <div className="flex items-center gap-1 bg-[#0d0e14] border border-[#262a3c] p-1 rounded-xl">
                  <button
                    onClick={() => setViewportMode("desktop")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewportMode === "desktop" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewportMode("tablet")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewportMode === "tablet" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewportMode("mobile")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewportMode === "mobile" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Textarea */}
            <textarea
              rows={3}
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
              placeholder="Describe the interface, layout, component or screen design you want AI to compose..."
              className="w-full bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
            />

            {/* Category Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
              <span className="font-semibold text-slate-500">Preset Categories:</span>
              {[
                "SaaS Landing Page",
                "Admin Analytics Dashboard",
                "Authentication Form",
                "Mobile Banking App UI",
                "Component Design System",
                "High Fidelity Wireframe",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(preset)
                    setDesignPrompt(`Design an enterprise ${preset} with dark mode glassmorphic UI cards & smooth micro-animations.`)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white border border-[#2d3248] transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Generate Button */}
            <button
              disabled={isGenerating}
              onClick={() => handleGenerateDesign()}
              className="mt-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>AI Rendering UI Wireframes & Layout Tokens...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>⚡ Generate UI Design Layout with AI</span>
                </>
              )}
            </button>
          </div>

          {/* ========================================================================= */}
          {/* LIVE INTERACTIVE UI PREVIEW CANVAS */}
          {/* ========================================================================= */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Viewport Frame Toolbar Header */}
            <div className="bg-[#0d0e14] px-4 py-3 border-b border-[#232736] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#161824] border border-[#262a3c] font-mono text-purple-300 font-bold flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-purple-400" />
                  {viewportMode === "desktop" ? "1440px Desktop View" : viewportMode === "tablet" ? "768px Tablet View" : "375px Mobile View"}
                </span>
              </div>

              {/* Mode & Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
                  className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#222536] text-slate-300 border border-[#2d3248] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {themeMode === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{themeMode === "dark" ? "Dark Mode" : "Light Mode"}</span>
                </button>

                <button
                  onClick={() => handleExport("Figma")}
                  className="px-3 py-1.5 rounded-lg bg-[#181a26] hover:bg-purple-600 text-slate-300 hover:text-white border border-[#2d3248] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" /> Export Figma
                </button>
              </div>
            </div>

            {/* LIVE UI CANVAS SCREEN PREVIEW */}
            <div className={`p-6 md:p-8 flex justify-center transition-all ${themeMode === "dark" ? "bg-[#090a0f]" : "bg-slate-100 text-slate-900"}`}>
              
              {/* Responsive Container Width Frame */}
              <div className={`w-full transition-all flex flex-col gap-6 ${
                viewportMode === "desktop" ? "max-w-4xl" : viewportMode === "tablet" ? "max-w-md" : "max-w-xs"
              }`}>
                
                {/* Mockup Generated Hero Banner Card */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-[#161826] via-[#121420] to-[#1c1a32] border border-purple-500/30 rounded-3xl flex flex-col items-center text-center gap-4 shadow-2xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/30 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                    ForgeAI UI Studio Mockup
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Next-Gen Enterprise AI SaaS Interface
                  </h2>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    Designed with high-contrast glassmorphism cards, HSL tailwind color tokens, and responsive 8px grid system.
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 transition-transform cursor-pointer">
                      Get Started Free →
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-[#181a26] border border-[#2d3248] text-slate-200 font-bold text-xs hover:bg-[#202334] transition-colors cursor-pointer">
                      Explore Wireframes
                    </button>
                  </div>
                </div>

                {/* Mockup Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Active Users", val: "24,850", icon: Users, change: "+14.2%" },
                    { title: "API Conversion", val: "99.8%", icon: Zap, change: "+3.1%" },
                    { title: "MRR Growth", val: "$142,500", icon: TrendingUp, change: "+22.5%" },
                  ].map((card, idx) => {
                    const Icon = card.icon
                    return (
                      <div key={idx} className="p-4 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-2 shadow-md">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{card.title}</span>
                          <Icon className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <h4 className="text-xl font-extrabold text-white mt-1">{card.val}</h4>
                        <span className="text-[10px] font-bold text-emerald-400">{card.change} vs last month</span>
                      </div>
                    )
                  })}
                </div>

              </div>

            </div>

            {/* Canvas Footer Telemetry */}
            <div className="bg-[#0d0e14] px-4 py-2.5 border-t border-[#232736] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span>Accessibility Score: <strong className="text-emerald-400">99/100</strong></span>
                <span>Responsive Score: <strong className="text-purple-400">100%</strong></span>
              </div>
              <span className="text-blue-400">Export Ready: React / Figma / Tailwind</span>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDEBAR (DESIGN SYSTEM & QUICK ACTIONS) */}
        {/* ========================================================================= */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          
          {/* Project Information */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Palette className="w-3.5 h-3.5 text-purple-400" /> Design System Telemetry</span>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </h4>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Current Theme:</span>
                <span className="text-purple-400 font-bold">Purple/Blue Dark</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Pages Generated:</span>
                <span className="text-white font-bold">14 Screens</span>
              </div>
              <div className="p-2.5 bg-[#0d0e14] rounded-xl border border-[#232736] flex justify-between">
                <span className="text-slate-400">Border Radius:</span>
                <span className="text-emerald-400 font-bold">20px Rounded</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts Grid */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#232736] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Design Actions</span>
              <span className="text-[10px] text-slate-400 font-mono">Shortcuts</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: "Generate Complete Website", icon: Layout },
                { name: "Generate Admin Dashboard", icon: BarChart3 },
                { name: "Generate Mobile App UI", icon: Smartphone },
                { name: "Generate Component Library", icon: Grid },
                { name: "Generate Wireframe Flow", icon: Layers },
                { name: "Generate Design System", icon: Palette },
                { name: "Export to Figma File", icon: Download },
              ].map((qa, idx) => {
                const Icon = qa.icon
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(qa.name)
                      handleGenerateDesign(qa.name)
                    }}
                    className="p-2.5 bg-[#0d0e14] hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl border border-[#232736] flex items-center gap-2 transition-all text-left cursor-pointer font-semibold"
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{qa.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </aside>

      </div>

    </div>
  )
}
