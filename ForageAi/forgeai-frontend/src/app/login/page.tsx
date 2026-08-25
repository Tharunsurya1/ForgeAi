"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Cpu, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      await authApi.login({ email, password })
      setIsLoading(false)
      setIsSuccess(true)

      setTimeout(() => {
        router.push("/dashboard")
      }, 600)
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface relative overflow-hidden font-sans">
      {/* Ambient glowing orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-secondary-container/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md px-4 md:px-0 z-10 relative">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="text-primary w-8 h-8" />
            <h1 className="text-[28px] font-display-xl font-bold tracking-tight text-on-surface">ForgeAI</h1>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 flex flex-col gap-6 relative shadow-2xl border border-outline-variant/30">
          <div className="text-center mb-2">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Welcome back</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">Log in to your workspace.</p>
          </div>

          {errorMsg && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <div className="bg-[#0F0F0F] border border-outline-variant/50 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] transition-all rounded-lg flex items-center px-4 h-12">
                <Mail className="text-outline w-5 h-5 mr-3" />
                <input
                  className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 p-0 placeholder-outline"
                  id="email"
                  placeholder="you@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link
                  className="text-[13px] font-medium text-primary hover:text-primary-container transition-colors"
                  href="/reset-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="bg-[#0F0F0F] border border-outline-variant/50 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] transition-all rounded-lg flex items-center px-4 h-12">
                <Lock className="text-outline w-5 h-5 mr-3" />
                <input
                  className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 p-0 placeholder-outline"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="text-outline hover:text-on-surface transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mt-1 mb-1">
              <input
                className="rounded border-outline-variant bg-[#1f1f27] text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer"
                id="remember"
                type="checkbox"
              />
              <label
                className="text-[13px] text-on-surface-variant cursor-pointer select-none"
                htmlFor="remember"
              >
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="btn-primary rounded-lg h-12 text-label-md font-label-md text-white flex items-center justify-center gap-2 relative overflow-hidden mt-2 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
              style={{ background: isSuccess ? "#10b981" : undefined }}
            >
              {!isLoading && !isSuccess && <span>Log In</span>}
              {isLoading && (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              {isSuccess && <span>Success! Redirecting...</span>}
            </button>
          </form>

          <p className="text-center text-[13px] text-on-surface-variant mt-2">
            Don't have an account?{" "}
            <Link
              className="text-primary hover:text-primary-container transition-colors font-medium"
              href="/signup"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-outline">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">
            Protected by enterprise zero-trust security
          </span>
        </div>
      </div>
    </div>
  )
}
