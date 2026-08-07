"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

export default function AuthSuccessPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    // Fill the progress bar over 2.5 seconds
    const duration = 2500
    const intervalTime = 50
    const step = (100 / (duration / intervalTime))
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timer)
          // Redirect when full
          setTimeout(() => router.push("/dashboard"), 200)
          return 100
        }
        return prev + step
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] font-sans text-[#e4e1ec]">
      
      {/* Top right dev toggles (mockup replica) */}
      <div className="absolute top-6 right-6 flex gap-4">
        <button className="px-4 py-2 rounded-full border border-[#262626] text-xs font-medium bg-[#13131a] hover:bg-[#1f1f27] transition-colors">Success State</button>
        <button className="px-4 py-2 rounded-full border border-[#262626] text-xs font-medium bg-[#13131a] hover:bg-[#1f1f27] transition-colors">Logout State</button>
      </div>
      
      {/* Ambient center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[600px] h-[600px] bg-[#5856d6]/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[400px] bg-[#13131a] border border-[#262626] rounded-2xl p-10 shadow-2xl relative z-10 flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle grid background inside the card */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 z-0"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#1b1b23] border border-[#2a2931] flex items-center justify-center mb-8 shadow-inner relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border border-[#5856d6]/40 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-0 rounded-full border border-[#5856d6]/20 scale-110"></div>
            <div className="w-8 h-8 rounded-full border-2 border-[#c2c1ff] flex items-center justify-center relative">
              <Check className="w-4 h-4 text-[#c2c1ff]" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-white mb-4 tracking-tight leading-tight">Welcome to<br/>ForgeAI</h1>
          <p className="text-[#918f9f] text-sm mb-12 leading-relaxed px-4">
            Authentication successful.<br/>Establishing secure connection to your workspace.
          </p>

          <div className="w-full mt-auto">
            {/* Progress Bar Track */}
            <div className="h-1 w-full bg-[#1f1f27] rounded-full overflow-hidden mb-3">
              {/* Progress Bar Fill */}
              <div 
                className="h-full bg-[#c2c1ff] shadow-[0_0_10px_rgba(194,193,255,0.8)] transition-all ease-linear"
                style={{ width: `${progress}%`, transitionDuration: '50ms' }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-[#464554] tracking-wide">
              <span className="uppercase">Redirecting to Dashboard</span>
              <span>{progress >= 100 ? '0s' : '1s'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
