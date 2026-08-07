"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { History, AlertTriangle, KeyRound, ShieldAlert, Mail, Headphones } from "lucide-react"

export default function AccountRecoveryPage() {
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 56) // 14:56 in seconds

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timerId)
    }
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-6 p-4 md:p-12 bg-[#0A0A0A] text-[#e4e1ec] font-sans selection:bg-[#5856d6]/30 selection:text-white">
      
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle diagonal grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgNjBMMjAgNDBNNDAgNjBMMjAgNDBNMjAgNDBMMCAyME0yMCA0MEw0MCAyME00MCAyMEw2MCAwTTQwIDIwTDIwIDBNNjAgMjBMNDAgME0yMCA2MEw0MCA4MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#93000a]/5 blur-[150px] mix-blend-screen rounded-full translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* Left Panel: Account Recovery Action */}
      <div className="w-full max-w-[500px] bg-[#13131a] border border-[#262626] rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 flex flex-col min-h-[600px]">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-lg border border-[#35343c] bg-[#1b1b23] flex items-center justify-center">
            <History className="w-5 h-5 text-[#918f9f]" />
          </div>
          <h2 className="text-xl md:text-2xl font-medium text-white tracking-tight">Account Recovery</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-medium text-white mb-2">Identity Verification</h3>
          <p className="text-sm text-[#918f9f] leading-relaxed">
            Enter the 16-character recovery code provided during initial setup to bypass current security locks.
          </p>
        </div>

        <div className="mb-6 relative">
          <label className="block text-xs font-medium text-[#918f9f] tracking-widest uppercase mb-3">Recovery Code</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound className="w-4 h-4 text-[#464554]" />
            </div>
            <input 
              type="text" 
              defaultValue="A7B9-XQ2P-99M4-L1K8"
              className="w-full bg-[#0F0F0F] border border-[#262626] text-[#c7c4d6] font-mono text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#5856d6] focus:ring-1 focus:ring-[#5856d6] transition-colors"
            />
          </div>
        </div>

        <div className="bg-[#1b1b23] border border-[#262626] rounded-xl p-4 flex items-start gap-4 mb-auto">
          <ShieldAlert className="w-5 h-5 text-[#918f9f] shrink-0 mt-0.5" />
          <p className="text-sm text-[#c7c4d6] leading-relaxed m-0">
            This action will reset your active sessions and require re-authentication across all devices.
          </p>
        </div>

        <div className="flex gap-4 mt-10">
          <button className="flex-[2] bg-[#3631b4] hover:bg-[#4f4ccd] text-white font-medium text-sm py-3.5 rounded-xl transition-colors shadow-lg">
            Recover Account
          </button>
          <button className="flex-1 bg-transparent border border-[#35343c] hover:bg-[#1f1f27] text-[#c7c4d6] font-medium text-sm py-3.5 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Right Panel: Account Locked Status */}
      <div className="w-full max-w-[500px] bg-[#13131a] border border-[#464554] rounded-2xl p-8 md:p-10 shadow-[0_0_80px_rgba(105,0,5,0.2)] relative z-10 flex flex-col min-h-[600px] overflow-hidden">
        {/* Danger Top Border Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffb4ab] to-transparent shadow-[0_0_20px_rgba(255,180,171,0.8)]"></div>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-lg border border-[#690005] bg-[#3b0a0a] flex items-center justify-center shadow-[0_0_15px_rgba(105,0,5,0.5)]">
            <AlertTriangle className="w-5 h-5 text-[#ffb4ab]" />
          </div>
          <h2 className="text-xl md:text-2xl font-medium text-[#ffdad6] tracking-tight">Account Locked</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Security Measure Triggered</h3>
          <p className="text-sm text-[#c7c4d6] leading-relaxed">
            Multiple unusual authentication attempts detected. Access has been temporarily suspended to protect your data.
          </p>
        </div>

        {/* Terminal Status Box */}
        <div className="bg-[#0e0d15] border border-[#262626] rounded-xl p-5 font-mono text-xs text-[#918f9f] mb-6 leading-relaxed relative">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ffb4ab]"></div>
            <div className="w-2 h-2 rounded-full bg-[#464554]"></div>
            <div className="w-2 h-2 rounded-full bg-[#464554]"></div>
          </div>
          <div className="text-[#ffb4ab]">ERR_SEC_LOCKOUT<span className="text-[#918f9f]">: Access blocked.</span></div>
          <div>IP: 192.168.1.105 (Anomalous)</div>
          <div>Attempts: 5 within 30s</div>
          <div>Status: <span className="text-[#ffb785]">Awaiting manual unlock</span></div>
        </div>

        {/* Timeout Clock */}
        <div className="bg-[#1b1b23] border border-[#35343c] rounded-2xl p-6 text-center mb-auto">
          <div className="text-[10px] font-semibold tracking-[0.2em] text-[#918f9f] uppercase mb-2">Timeout Remaining</div>
          <div className="font-mono text-5xl md:text-6xl font-bold text-white tracking-wider flex items-center justify-center gap-2">
            <span>{String(minutes).padStart(2, '0')}</span>
            <span className="text-[#464554] pb-2 animate-pulse">:</span>
            <span>{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-10">
          <button className="w-full bg-[#4f4ccd] hover:bg-[#5856d6] text-white font-medium text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,76,205,0.3)]">
            <Mail className="w-4 h-4" />
            Unlock via Email
          </button>
          <div className="flex gap-3">
            <button className="flex-1 bg-transparent border border-[#262626] hover:bg-[#1f1f27] text-[#c7c4d6] font-medium text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Headphones className="w-4 h-4 text-[#918f9f]" />
              Contact Support
            </button>
            <button className="flex-1 bg-transparent border border-[#262626] hover:bg-[#1f1f27] text-[#c7c4d6] font-medium text-sm py-3 rounded-xl transition-colors">
              Use Code
            </button>
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <div className="fixed bottom-0 w-full px-6 py-6 flex justify-between items-center text-xs text-[#918f9f] z-10 pointer-events-none max-w-7xl">
        <div>© 2024 ForgeAI. Enterprise-grade security.</div>
        <div className="flex gap-6 pointer-events-auto">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Status</a>
        </div>
      </div>
    </div>
  )
}
