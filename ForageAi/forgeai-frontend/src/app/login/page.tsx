"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Cpu, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      
      setTimeout(() => {
        setIsSuccess(false)
        router.push("/dashboard")
      }, 1000)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-surface relative overflow-hidden font-sans">
      
      {/* Ambient glowing orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-secondary-container/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="w-full max-w-md px-4 md:px-0 z-10 relative">
        {/* Logo */}
        <div className="flex justify-center mb-16">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="text-primary w-8 h-8" />
            <h1 className="text-[28px] font-display-xl font-bold tracking-tight text-on-surface">ForgeAI</h1>
          </Link>
        </div>
        
        {/* Login Card */}
        <div className="glass-panel rounded-xl p-10 flex flex-col gap-6 relative shadow-2xl">
          <div className="text-center mb-4">
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Welcome back</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">Log in to your workspace.</p>
          </div>
          
          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="email">Email</label>
              <div className="bg-[#0F0F0F] border border-outline-variant/50 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] transition-all rounded-lg flex items-center px-4 h-12">
                <Mail className="text-outline w-5 h-5 mr-3" />
                <input 
                  className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 p-0 placeholder-outline" 
                  id="email" 
                  placeholder="you@company.com" 
                  required 
                  type="email" 
                />
              </div>
            </div>
            
            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="password">Password</label>
                <Link className="text-[13px] font-medium text-primary hover:text-primary-container transition-colors" href="/reset-password">Forgot Password?</Link>
              </div>
              <div className="bg-[#0F0F0F] border border-outline-variant/50 focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] transition-all rounded-lg flex items-center px-4 h-12">
                <Lock className="text-outline w-5 h-5 mr-3" />
                <input 
                  className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 p-0 placeholder-outline" 
                  id="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
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
            <div className="flex items-center gap-2 mt-1 mb-2">
              <input 
                className="rounded border-outline-variant bg-[#1f1f27] text-primary focus:ring-primary h-4 w-4 transition-colors cursor-pointer" 
                id="remember" 
                type="checkbox" 
              />
              <label className="text-[13px] text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this device</label>
            </div>
            
            {/* Submit Button */}
            <button 
              className="btn-primary rounded-lg h-12 text-label-md font-label-md text-white flex items-center justify-center gap-2 relative overflow-hidden mt-2" 
              type="submit"
              disabled={isLoading}
              style={{ background: isSuccess ? '#10b981' : '' }}
            >
              {!isLoading && !isSuccess && <span>Log In</span>}
              {isLoading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isSuccess && <span>Success!</span>}
            </button>
          </form>
          
          <div className="relative flex items-center py-2 mt-2">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink-0 mx-4 text-outline text-[12px] font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>
          
          {/* Social Logins */}
          <div className="flex gap-4">
            <button className="btn-secondary rounded-lg h-11 flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold text-on-surface">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Google
            </button>
            <button className="btn-secondary rounded-lg h-11 flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold text-on-surface">
              <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
              GitHub
            </button>
          </div>
          
          <p className="text-center text-[13px] text-on-surface-variant mt-2">
            Don't have an account? <Link className="text-primary hover:text-primary-container transition-colors font-medium" href="/signup">Sign up</Link>
          </p>
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-outline">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest font-semibold">Protected by enterprise encryption</span>
        </div>
      </div>
    </div>
  )
}
