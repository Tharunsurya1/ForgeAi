"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Palette,
  Sparkles,
  Check,
  Moon,
  Sun,
  Laptop,
  Sliders,
  Maximize2,
  Globe,
  Grid,
} from "lucide-react"

export default function AppearancePage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState("dark")
  const [accent, setAccent] = useState("purple")

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Appearance & Theme Preferences</h1>
            <p className="text-xs text-slate-400">Customize theme mode, accent colors, layout density, and font sizes.</p>
          </div>
        </div>

        <button
          onClick={() => { setToastMessage("🎨 Saved appearance theme settings!"); setTimeout(() => setToastMessage(null), 3000); }}
          className="bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Save Appearance
        </button>
      </header>

      <div className="bg-[#141620] border border-[#232736] rounded-2xl p-6 shadow-xl flex flex-col gap-6 text-xs font-mono">
        <h3 className="text-sm font-bold text-white border-b border-[#232736] pb-3">Theme Selection Mode</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setTheme("dark")} className={`p-5 rounded-2xl border ${theme === "dark" ? "border-purple-500 bg-purple-500/10" : "border-[#232736] bg-[#0d0e14]"} cursor-pointer flex items-center gap-3`}>
            <Moon className="w-5 h-5 text-purple-400" />
            <div>
              <strong className="text-white block">Dark Mode (Default)</strong>
              <span className="text-[10px] text-slate-400">Glassmorphism enterprise theme</span>
            </div>
          </div>

          <div onClick={() => setTheme("light")} className={`p-5 rounded-2xl border ${theme === "light" ? "border-purple-500 bg-purple-500/10" : "border-[#232736] bg-[#0d0e14]"} cursor-pointer flex items-center gap-3`}>
            <Sun className="w-5 h-5 text-amber-400" />
            <div>
              <strong className="text-white block">Light Mode</strong>
              <span className="text-[10px] text-slate-400">High contrast white background</span>
            </div>
          </div>

          <div onClick={() => setTheme("system")} className={`p-5 rounded-2xl border ${theme === "system" ? "border-purple-500 bg-purple-500/10" : "border-[#232736] bg-[#0d0e14]"} cursor-pointer flex items-center gap-3`}>
            <Laptop className="w-5 h-5 text-blue-400" />
            <div>
              <strong className="text-white block">System Theme</strong>
              <span className="text-[10px] text-slate-400">Sync with OS preferences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
