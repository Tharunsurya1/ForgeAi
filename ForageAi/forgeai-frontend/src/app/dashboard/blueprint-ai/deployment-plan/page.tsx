import * as React from "react"
import Link from "next/link"

export default function DeploymentPage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-xl">
      
      {/* Pre-Header */}
      <div className="flex items-center gap-2 mb-4 font-code-sm text-code-sm font-semibold tracking-widest text-on-surface-variant uppercase">
        <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
        <span>Blueprint / Phase 4</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-xl">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface">Deployment & Security</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            Configure environments, review CI/CD automation, and validate security compliance before launch.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-on-surface hover:bg-surface-variant/30 transition-colors">
            <span className="material-symbols-outlined text-[18px]">history</span>
            View Audit Log
          </button>
          <button className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all">
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            Trigger Deploy
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-gutter">
        
        {/* Left Column: Deployment & CI/CD */}
        <div className="flex-1 flex flex-col gap-gutter">
          
          {/* Deployment Plan */}
          <div className="glass-panel border border-[#262626] rounded-xl p-md bg-[#171717]/80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">cloud</span>
                Deployment Plan
              </h3>
              <span className="px-3 py-1 rounded bg-surface-variant/50 border border-outline-variant/30 text-on-surface text-[11px] font-code-sm font-bold tracking-widest uppercase">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staging */}
              <div className="border border-[#262626] rounded-lg p-5 bg-[#0F0F0F] hover:border-outline-variant/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Staging Environment</h4>
                    <p className="font-code-sm text-xs text-on-surface-variant">Vercel (Preview)</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant text-[24px]">api</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between font-code-sm text-code-sm">
                    <span className="text-on-surface-variant">URL</span>
                    <a href="#" className="text-primary hover:underline">staging.forgeai.dev</a>
                  </div>
                  <div className="flex justify-between font-code-sm text-code-sm">
                    <span className="text-on-surface-variant">Last Deploy</span>
                    <span className="text-on-surface">2 hours ago</span>
                  </div>
                </div>
              </div>
              
              {/* Production */}
              <div className="border border-[#262626] rounded-lg p-5 bg-[#0F0F0F] hover:border-outline-variant/50 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Production Environment</h4>
                    <p className="font-code-sm text-xs text-on-surface-variant">AWS ECS (Fargate)</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface text-[24px]">verified</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between font-code-sm text-code-sm">
                    <span className="text-on-surface-variant">URL</span>
                    <a href="#" className="text-primary hover:underline">app.forgeai.com</a>
                  </div>
                  <div className="flex justify-between font-code-sm text-code-sm">
                    <span className="text-on-surface-variant">Last Deploy</span>
                    <span className="text-on-surface">Yesterday, 14:30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CI/CD Pipeline */}
          <div className="glass-panel border border-[#262626] rounded-xl p-md bg-[#171717]/80">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">account_tree</span>
                CI/CD Pipeline (GitHub Actions)
              </h3>
              <button className="text-outline-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-[#262626] z-0"></div>
              
              {/* Step 1: Build */}
              <div className="flex flex-col items-center relative z-10 w-full md:w-1/4 group mb-6 md:mb-0">
                <div className="w-full max-w-[140px] h-[100px] bg-[#0F0F0F] border border-[#262626] rounded-xl flex flex-col items-center justify-center p-3 mb-2 shadow-sm transition-colors group-hover:border-primary/50">
                  <div className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center mb-2 bg-primary/10">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <h5 className="font-label-md text-label-md text-on-surface">Build</h5>
                  <span className="font-code-sm text-[11px] text-on-surface-variant">~2m 15s</span>
                </div>
              </div>
              
              {/* Step 2: Test */}
              <div className="flex flex-col items-center relative z-10 w-full md:w-1/4 group mb-6 md:mb-0">
                <div className="w-full max-w-[140px] h-[100px] bg-[#0F0F0F] border border-[#262626] rounded-xl flex flex-col items-center justify-center p-3 mb-2 shadow-sm transition-colors group-hover:border-primary/50">
                  <div className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center mb-2 bg-primary/10">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <h5 className="font-label-md text-label-md text-on-surface">Test</h5>
                  <span className="font-code-sm text-[11px] text-on-surface-variant">Jest & Cypress</span>
                </div>
              </div>
              
              {/* Step 3: Security Scan (Active) */}
              <div className="flex flex-col items-center relative z-10 w-full md:w-1/4 group mb-6 md:mb-0">
                <div className="w-full max-w-[140px] h-[100px] bg-[#14141c] border-2 border-primary rounded-xl flex flex-col items-center justify-center p-3 mb-2 shadow-[0_0_15px_rgba(88,86,214,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 h-1 bg-primary animate-pulse w-full"></div>
                  
                  <div className="w-8 h-8 rounded-full border border-primary/50 text-primary flex items-center justify-center mb-2 animate-spin-slow">
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                  </div>
                  <h5 className="font-label-md text-label-md text-on-surface">Security Scan</h5>
                  <span className="font-code-sm text-[11px] text-primary">In Progress...</span>
                </div>
              </div>
              
              {/* Step 4: Deploy (Pending) */}
              <div className="flex flex-col items-center relative z-10 w-full md:w-1/4 opacity-50">
                <div className="w-full max-w-[140px] h-[100px] bg-[#0A0A0A] border border-[#262626] rounded-xl flex flex-col items-center justify-center p-3 mb-2 border-dashed">
                  <div className="w-8 h-8 rounded-full border border-outline-variant text-outline-variant flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                  </div>
                  <h5 className="font-label-md text-label-md text-outline-variant">Deploy</h5>
                  <span className="font-code-sm text-[11px] text-outline-variant">Pending</span>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
        
        {/* Right Column: Security Review */}
        <div className="w-full xl:w-[380px] flex flex-col shrink-0">
          <div className="glass-panel border border-[#262626] rounded-xl bg-[#171717]/80 h-full flex flex-col p-6">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">security</span>
                Security Review
              </h3>
              <span className="px-3 py-1 rounded bg-surface-variant/50 border border-outline-variant/30 text-on-surface text-[11px] font-code-sm font-bold tracking-widest uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">search</span>
                AI Scanned
              </span>
            </div>
            
            {/* Score Ring */}
            <div className="flex items-center gap-6 mb-8 p-4 bg-[#0F0F0F] rounded-lg border border-[#262626]">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                {/* SVG Ring */}
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-surface-variant"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle (85%) */}
                  <path
                    className="text-primary"
                    strokeWidth="3"
                    strokeDasharray="85, 100"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-xl text-xl font-bold text-on-surface">85<span className="text-[10px]">%</span></span>
                </div>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">Compliance Score</p>
                <p className="font-code-sm text-xs text-on-surface-variant mt-1">2 items require attention</p>
              </div>
            </div>
            
            {/* Checklist */}
            <div className="flex-1 space-y-4">
              
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                <div>
                  <h5 className="font-label-md text-label-md text-on-surface mb-1">OWASP Top 10 Mitigation</h5>
                  <p className="font-body-sm text-[13px] text-on-surface-variant">WAF configured and input validation verified.</p>
                </div>
              </div>
              
              <div className="bg-[#1A150D] border border-tertiary/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">warning</span>
                    <h5 className="font-label-md text-label-md text-tertiary">GDPR Data Residency</h5>
                  </div>
                  <span className="text-[10px] font-code-sm font-bold tracking-widest text-tertiary uppercase border border-tertiary/40 px-2 rounded bg-tertiary/10">Medium</span>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-2 ml-6">Verify EU-central-1 bucket replication rules.</p>
              </div>
              
              <div className="bg-[#240A0D] border border-error/30 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-[18px]">error</span>
                    <h5 className="font-label-md text-label-md text-error">RBAC Policy Review</h5>
                  </div>
                  <span className="text-[10px] font-code-sm font-bold tracking-widest text-error uppercase border border-error/40 px-2 rounded bg-error/10">High</span>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-2 ml-6">Admin role has overly permissive S3 access.</p>
              </div>
              
            </div>
            
            <button className="w-full mt-6 btn-secondary py-2.5 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 text-on-surface hover:bg-surface-variant/30 transition-colors">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Run Full Audit
            </button>
            
          </div>
        </div>
        
      </div>
      
    </div>
  )
}
