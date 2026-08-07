"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, ExternalLink, ArrowRight, Check } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(59)
  const [showSuccess, setShowSuccess] = useState(false)
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timerId)
    }
  }, [timeLeft])

  const toggleView = () => {
    setShowSuccess(!showSuccess)
  }

  return (
    <div className="bg-[#0A0A0A] text-[#e4e1ec] min-h-screen flex flex-col font-sans selection:bg-[#5856d6] selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: #171717;
            border: 1px solid #262626;
            transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
            border-color: #404040;
        }
        .btn-primary {
            background: linear-gradient(135deg, #5856d6, #4f4ccd);
            color: #ffffff;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
            opacity: 0.9;
            box-shadow: 0 0 15px rgba(88, 86, 214, 0.4);
        }
        .btn-secondary {
            background: transparent;
            border: 1px solid #262626;
            color: #e4e1ec;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        @keyframes pulse-subtle {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; text-shadow: 0 0 20px rgba(194, 193, 255, 0.5); }
            100% { transform: scale(1); opacity: 0.8; }
        }
        .animate-pulse-subtle {
            animation: pulse-subtle 2s infinite ease-in-out;
        }
        @keyframes draw-check {
            0% { stroke-dasharray: 0, 100; opacity: 0; }
            100% { stroke-dasharray: 100, 0; opacity: 1; }
        }
        .check-anim {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
            animation: draw-check 1s ease-out forwards;
        }
      `}} />
      
      {/* Ambient Background Lighting (Glassmorphic accent) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#5856d6]/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#4b8eff]/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>
      
      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-12 relative z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-[480px] relative h-[400px]">
          
          {/* Verify Email View */}
          <div className={`glass-card rounded-xl p-10 flex flex-col items-center text-center shadow-2xl absolute inset-0 transition-all duration-300 ease-out overflow-hidden ${showSuccess ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="w-20 h-20 rounded-full bg-[#2a2931] flex items-center justify-center mb-8 border border-[#464554] relative">
              <div className="absolute inset-0 rounded-full bg-[#c2c1ff]/5 animate-pulse-subtle"></div>
              <Mail className="w-10 h-10 text-[#c2c1ff] animate-pulse-subtle" />
            </div>
            
            <h1 className="text-3xl font-semibold text-white mb-4 tracking-tight">Check your inbox</h1>
            <p className="text-base text-[#c7c4d6] mb-10 max-w-[320px]">
              We've sent a verification link to <span className="text-white font-medium">engineer@forgeai.com</span>. Please check your email to continue.
            </p>
            
            <div className="w-full flex flex-col gap-4">
              <button className="btn-primary w-full py-3 text-sm font-medium flex justify-center items-center gap-2">
                Open Email App
                <ExternalLink className="w-4 h-4" />
              </button>
              <button className="btn-secondary w-full py-3 text-sm font-medium text-[#c7c4d6] flex justify-center items-center">
                Resend Email {timeLeft > 0 && <span className="text-[#c2c1ff] ml-1">({timeLeft > 9 ? `0:${timeLeft}` : `0:0${timeLeft}`})</span>}
              </button>
            </div>
            
            <button className="mt-8 text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors underline-offset-4 hover:underline" onClick={toggleView}>
              Simulate Success (Dev Only)
            </button>
          </div>
          
          {/* Success View */}
          <div className={`glass-card rounded-xl p-10 flex flex-col items-center text-center shadow-2xl absolute inset-0 overflow-hidden transition-all duration-300 ease-out ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5856d6]/20 to-transparent"></div>
            
            <div className="w-24 h-24 rounded-full bg-[#5856d6]/10 flex items-center justify-center mb-10 relative">
              <div className="absolute inset-0 rounded-full border border-[#5856d6]/30 scale-[1.15]"></div>
              <div className="absolute inset-0 rounded-full border border-[#5856d6]/10 scale-[1.3]"></div>
              <svg className="w-12 h-12 text-[#5856d6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path className={showSuccess ? "check-anim" : ""} d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl font-semibold text-white mb-4 tracking-tight">Email Verified</h1>
            <p className="text-base text-[#c7c4d6] mb-10 max-w-[320px]">
              Your account has been successfully verified. Welcome to ForgeAI, your engineering cockpit is ready.
            </p>
            
            <div className="w-full mt-auto">
              <button 
                className="btn-primary w-full py-3 text-sm font-medium flex justify-center items-center gap-2"
                onClick={() => router.push("/dashboard")}
              >
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-transparent relative z-10">
        <div className="text-sm font-medium text-white">
            © 2024 ForgeAI. Enterprise-grade security.
        </div>
        <nav className="flex gap-6">
          <a className="text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors duration-200" href="/legal">Privacy Policy</a>
          <a className="text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors duration-200" href="/legal">Terms of Service</a>
          <a className="text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors duration-200" href="#">Security Compliance</a>
          <a className="text-sm text-[#918f9f] hover:text-[#c2c1ff] transition-colors duration-200" href="#">Status</a>
        </nav>
      </footer>
    </div>
  )
}
