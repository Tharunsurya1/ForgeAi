"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="bg-[#0A0A0A] text-[#e4e1ec] min-h-screen flex flex-col font-sans selection:bg-[#5856d6] selection:text-white relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background-color: rgba(23, 23, 23, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid #262626;
        }
        .input-dark {
            background-color: #0F0F0F;
            border: 1px solid #262626;
            transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-dark:focus {
            border-color: #c2c1ff;
            box-shadow: 0 0 0 2px rgba(194, 193, 255, 0.2);
            outline: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, #5856d6, #4f4ccd);
            color: #ffffff;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
            opacity: 0.9;
            box-shadow: 0 0 15px rgba(88, 86, 214, 0.4);
        }
        .bg-pattern {
            background-image: radial-gradient(circle at 50% 0%, rgba(88, 86, 214, 0.15) 0%, transparent 50%),
                              linear-gradient(to bottom, #13131a, #0A0A0A);
        }
        .loader-ring {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
      `}} />
      
      <div className="absolute inset-0 bg-pattern z-0 pointer-events-none"></div>
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-12 relative z-10 w-full mx-auto">
        <div className="w-full max-w-[480px] glass-card rounded-xl p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
          {/* Top border highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5856d6]/50 to-transparent"></div>
          
          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
            
            <div className="w-16 h-16 rounded-2xl bg-[#1f1f27] border border-[#262626] flex items-center justify-center mb-6 shadow-inner">
              <KeyRound className="w-8 h-8 text-[#5856d6]" />
            </div>
            
            <h1 className="text-3xl font-semibold text-white mb-2">Reset Password</h1>
            <p className="text-[#c7c4d6] text-sm leading-relaxed">
              {!isSubmitted 
                ? "Enter the email address associated with your account and we'll send you a link to reset your password." 
                : "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."}
            </p>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#918f9f]" />
                  </div>
                  <input 
                    className="w-full input-dark rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:ring-0" 
                    id="email" 
                    placeholder="you@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button 
                className="w-full btn-primary h-12 rounded-lg text-sm font-medium flex items-center justify-center gap-2 relative" 
                type="submit"
                disabled={isLoading}
              >
                {!isLoading ? (
                  <span>Send Reset Link</span>
                ) : (
                  <span className="loader-ring"></span>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#1f1f27] border border-[#262626] rounded-lg p-4 text-sm text-[#c7c4d6] break-all">
                <span className="text-[#918f9f] block mb-1">Reset link sent to:</span>
                <span className="text-white font-medium">{email}</span>
              </div>
              
              <button 
                className="w-full bg-transparent border border-[#262626] h-12 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                onClick={() => setIsSubmitted(false)}
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </main>
      
      <div className="fixed bottom-0 w-full text-center py-6 text-sm text-[#918f9f] z-10 pointer-events-none">
         © 2024 ForgeAI. Enterprise-grade security.
      </div>
    </div>
  )
}
