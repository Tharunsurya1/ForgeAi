"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Cpu, Circle, CheckCircle2, Check, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react"
import { authApi } from "@/lib/api"

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [strength, setStrength] = useState({
    length: false,
    symbol: false,
    number: false,
    score: 0,
  })

  useEffect(() => {
    const hasLength = password.length >= 8
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasNumber = /\d/.test(password)

    let score = 0
    if (hasLength) score++
    if (hasSymbol) score++
    if (hasNumber) score++

    setStrength({ length: hasLength, symbol: hasSymbol, number: hasNumber, score })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.")
      return
    }

    setIsLoading(true)

    try {
      // 1. Register User in PostgreSQL
      await authApi.register({
        email,
        password,
        full_name: fullName,
      })

      // 2. Automatically authenticate session
      await authApi.login({
        email,
        password,
      })

      setIsLoading(false)
      setIsSuccess(true)

      setTimeout(() => {
        router.push("/dashboard")
      }, 600)
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || "Failed to create account. Please check your details.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-12 bg-background text-on-surface font-sans relative">
      {/* Background Effect */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(88, 86, 214, 0.4) 0%, transparent 50%)",
        }}
      ></div>

      <div className="w-full max-w-[560px] glass-panel rounded-xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.4)] z-10 relative mt-4 mb-12 border border-outline-variant/30">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Cpu className="text-primary w-8 h-8" />
              <h1 className="text-[28px] font-display-xl font-bold tracking-tight text-on-surface">ForgeAI</h1>
            </Link>
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant">Create your enterprise developer account.</p>
        </div>

        {errorMsg && (
          <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2.5 text-on-surface text-[14px] placeholder-outline transition-all"
              id="fullName"
              placeholder="Tharun Surya"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2.5 text-on-surface text-[14px] placeholder-outline transition-all"
              id="email"
              placeholder="you@company.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2.5 text-on-surface text-[14px] transition-all placeholder-outline"
              id="password"
              placeholder="•••••••• (min 8 characters)"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Password Criteria Checklist */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
              <span className={`flex items-center gap-1 ${strength.length ? "text-secondary" : ""}`}>
                {strength.length ? <Check className="w-3 h-3 text-secondary" /> : <Circle className="w-3 h-3" />} 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${strength.number ? "text-secondary" : ""}`}>
                {strength.number ? <Check className="w-3 h-3 text-secondary" /> : <Circle className="w-3 h-3" />} number
              </span>
              <span className={`flex items-center gap-1 ${strength.symbol ? "text-secondary" : ""}`}>
                {strength.symbol ? <Check className="w-3 h-3 text-secondary" /> : <Circle className="w-3 h-3" />} symbol
              </span>
            </div>
          </div>

          <button
            className="w-full btn-primary rounded-lg py-3 text-label-md font-label-md text-white flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            type="submit"
            disabled={isLoading}
            style={{ background: isSuccess ? "#10b981" : undefined }}
          >
            {!isLoading && !isSuccess && (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
            {isLoading && (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            {isSuccess && <span>Account Created! Entering workspace...</span>}
          </button>
        </form>

        <p className="text-center text-[13px] text-on-surface-variant mt-6">
          Already have an account?{" "}
          <Link className="text-primary hover:text-primary-container transition-colors font-medium" href="/login">
            Log in
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 mt-8 text-outline">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">
            Enterprise Multi-Tenant Tenant Isolation
          </span>
        </div>
      </div>
    </div>
  )
}
