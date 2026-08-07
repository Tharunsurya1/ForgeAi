"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building,
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
  Mail,
  MessageSquare,
  Send,
  GitBranch,
  Code2,
  Radio,
  TerminalSquare,
  DollarSign,
  TrendingUp,
  HardDrive,
  Palette,
  Image as ImageIcon,
} from "lucide-react"

export default function WorkspaceBrandingPage() {
  const router = useRouter()

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Branding State
  const [orgName, setOrgName] = useState("ForgeAI Labs Inc.")
  const [customSubdomain, setCustomSubdomain] = useState("ai.forgeai.dev")
  const [brandColor, setBrandColor] = useState("#9333ea")
  const [fontFamily, setFontFamily] = useState("Outfit / Inter Display")
  const [darkLogoUrl, setDarkLogoUrl] = useState("ForgeAI Dark Theme Logo (SVG)")
  const [lightLogoUrl, setLightLogoUrl] = useState("ForgeAI Light Theme Logo (SVG)")

  // Handle Save
  const handleSaveBranding = () => {
    setToastMessage("🎨 Workspace Branding kit saved & deployed to CDN!")
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Workspace Branding Studio</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize workspace logos, favicons, custom domain, brand colors, and email signatures.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleSaveBranding}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Save Branding</span>
          </button>

          <button
            onClick={() => setToastMessage("📥 Exported Workspace Branding Kit Zip!")}
            className="bg-[#181a26] hover:bg-[#222536] border border-[#2d3248] text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Branding Kit</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* FORM FIELDS (2 COLUMNS) */}
        <div className="xl:col-span-2 flex flex-col gap-6 w-full">
          
          {/* LOGO VARIANTS CARD */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <ImageIcon className="w-4 h-4 text-purple-400" /> Workspace Logo & Favicon Assets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-3">
                <span className="font-bold text-white">Dark Theme Logo</span>
                <div className="h-20 bg-[#090a0f] rounded-xl border border-[#1e2232] flex items-center justify-center font-extrabold text-purple-400 text-lg">
                  ForgeAI ✨
                </div>
                <button onClick={() => setToastMessage("Uploaded Dark Theme Logo!")} className="bg-purple-600 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer">Upload Dark Logo</button>
              </div>

              <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-3">
                <span className="font-bold text-white">Light Theme Logo</span>
                <div className="h-20 bg-slate-100 rounded-xl flex items-center justify-center font-extrabold text-purple-700 text-lg">
                  ForgeAI ✨
                </div>
                <button onClick={() => setToastMessage("Uploaded Light Theme Logo!")} className="bg-[#181a26] text-slate-200 border border-[#2d3248] font-bold py-1.5 rounded-lg text-xs cursor-pointer">Upload Light Logo</button>
              </div>
            </div>
          </div>

          {/* CUSTOM SUBDOMAIN & ORGANIZATIONAL DETAILS */}
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#232736] pb-3">
              <Globe className="w-4 h-4 text-blue-400" /> Custom Domain & Organization Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-semibold">Custom Workspace Subdomain</label>
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  className="bg-[#0d0e14] border border-[#262a3c] rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* BRAND PREVIEW PANEL (1 COLUMN) */}
        <aside className="xl:col-span-1 flex flex-col gap-5 w-full sticky top-20">
          <div className="bg-[#141620] border border-[#232736] rounded-2xl p-5 shadow-md flex flex-col gap-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11px] border-b border-[#232736] pb-2 flex justify-between">
              <span>Brand Live Preview</span>
              <span className="text-emerald-400 font-mono">Real-time</span>
            </h4>

            <div className="p-4 bg-[#0d0e14] rounded-xl border border-[#232736] flex flex-col gap-3 font-mono">
              <div className="text-white font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">F</div>
                <span>{orgName}</span>
              </div>
              <span className="text-[10px] text-purple-300">URL: https://{customSubdomain}</span>
            </div>
          </div>
        </aside>

      </div>

    </div>
  )
}
