"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Circle, CheckCircle2, Check, ArrowRight } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [strength, setStrength] = useState({
    length: false,
    symbol: false,
    number: false,
    score: 0
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call for registration
    setTimeout(() => {
      setIsLoading(false)
      router.push("/verify-email")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-12 bg-background text-on-surface font-sans relative">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ background: "radial-gradient(circle at 50% 0%, rgba(88, 86, 214, 0.4) 0%, transparent 50%)" }}></div>

      <div className="w-full max-w-[600px] glass-panel rounded-xl p-6 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.4)] z-10 relative mt-8 mb-16">
        <div className="text-center mb-10">
          <h1 className="text-[32px] md:text-[40px] font-display-xl font-semibold text-on-surface mb-2">ForgeAI</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">Create your enterprise account.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="fullName">Full Name</label>
              <input className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] placeholder-outline transition-all" id="fullName" placeholder="John Doe" type="text" required/>
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="email">Email Address</label>
              <input className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] placeholder-outline transition-all" id="email" placeholder="you@company.com" type="email" required/>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="company">Company Name</label>
              <input className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] placeholder-outline transition-all" id="company" placeholder="Acme Corp" type="text" required/>
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="jobTitle">Job Title</label>
              <input className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] placeholder-outline transition-all" id="jobTitle" placeholder="Lead Engineer" type="text" required/>
            </div>
          </div>
          
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="country">Country</label>
            <select className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] appearance-none transition-all" id="country" defaultValue="">
              <option disabled value="">Select a country</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="password">Password</label>
            <input 
              className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] mb-3 transition-all placeholder-outline" 
              id="password" 
              placeholder="••••••••" 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Password Strength/Checklist */}
            <div className="bg-[#1a1a21] rounded-lg p-3 space-y-1.5 mb-3 border border-[#262626]">
              <div className={`flex items-center gap-2 text-[13px] ${strength.length ? 'text-primary' : 'text-outline'}`}>
                {strength.length ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                <span>8+ characters</span>
              </div>
              <div className={`flex items-center gap-2 text-[13px] ${strength.symbol ? 'text-primary' : 'text-outline'}`}>
                {strength.symbol ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                <span>One symbol (!@#$)</span>
              </div>
              <div className={`flex items-center gap-2 text-[13px] ${strength.number ? 'text-primary' : 'text-outline'}`}>
                {strength.number ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4" />}
                <span>One number</span>
              </div>
            </div>
            
            {/* Strength Meter Bar */}
            <div className="w-full h-1.5 bg-[#1a1a21] rounded-full overflow-hidden border border-[#262626]/50">
              <div 
                className={`h-full transition-all duration-300 ${
                  strength.score === 0 ? 'w-0' :
                  strength.score === 1 ? 'w-1/3 bg-error' :
                  strength.score === 2 ? 'w-2/3 bg-[#ffb785]' :
                  'w-full bg-primary shadow-[0_0_10px_rgba(194,193,255,0.5)]'
                }`}
              ></div>
            </div>
          </div>
          
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
            <input className="w-full bg-[#0F0F0F] border border-outline-variant/50 focus:border-primary focus:shadow-[0_0_0_2px_rgba(88,86,214,0.2)] outline-none rounded-lg px-4 py-2 text-on-surface text-[14px] placeholder-outline transition-all" id="confirmPassword" placeholder="••••••••" type="password" required/>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 border border-outline rounded bg-[#0F0F0F] group-hover:border-primary transition-colors">
                <input className="opacity-0 absolute inset-0 cursor-pointer w-full h-full peer" type="checkbox" required/>
                <Check className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-[13px] text-on-surface-variant">I accept the <Link href="/legal" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/legal" className="text-primary hover:underline">Privacy Policy</Link>.</span>
            </label>
            
            <label className="flex items-start gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 border border-outline rounded bg-[#0F0F0F] group-hover:border-primary transition-colors">
                <input className="opacity-0 absolute inset-0 cursor-pointer w-full h-full peer" type="checkbox"/>
                <Check className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-[13px] text-on-surface-variant">Subscribe to platform updates and news.</span>
            </label>
          </div>
          
          <div className="pt-4">
            <button 
              className="w-full btn-primary text-white text-[14px] font-label-md py-2 h-12 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-semibold uppercase tracking-wider text-outline">OR</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 btn-secondary rounded-lg h-11 text-[13px] font-semibold text-on-surface flex items-center justify-center gap-2" type="button">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Google
            </button>
            <button className="flex-1 btn-secondary rounded-lg h-11 text-[13px] font-semibold text-on-surface flex items-center justify-center gap-2" type="button">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
              GitHub
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-[13px] text-on-surface-variant">
          Already have an account? <Link className="text-primary hover:text-primary-container transition-colors font-semibold" href="/login">Login</Link>
        </div>
      </div>
      
      <div className="fixed bottom-0 w-full text-center py-6 text-[12px] text-outline z-10 pointer-events-none font-semibold">
         © 2024 ForgeAI. Enterprise-grade security.
      </div>
    </div>
  )
}
