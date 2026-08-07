import * as React from "react"
import Link from "next/link"

export default function NewProjectPage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-full flex flex-col xl:flex-row gap-gutter">
      
      {/* Left Column: Core Generation Area (Bento Layout) */}
      <div className="flex-1 flex flex-col gap-lg">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/projects" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Projects
            </Link>
          </div>
          <h2 className="font-display-xl text-display-xl text-on-surface mb-2">New Blueprint</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Describe your software idea in natural language, or upload existing documentation. Our AI agents will generate comprehensive project requirements.
          </p>
        </div>
        
        {/* Prompt Input Area (The Command Center) */}
        <div className="relative glass-card rounded-xl p-1 flex flex-col flex-1 min-h-[300px] overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:z-10">
          <div className="custom-input bg-[#0F0F0F] rounded-lg flex-1 flex flex-col p-4 relative overflow-hidden group">
            {/* Decorative gradient background hint */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            
            <textarea 
              className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-on-surface font-body-lg placeholder-on-surface-variant/50 relative z-10 outline-none" 
              placeholder="Describe your software idea... e.g., 'I want to build a decentralized finance app that lets users pool funds for micro-loans...'"
            ></textarea>
            
            {/* Toolbar inside prompt */}
            <div className="flex justify-between items-center mt-4 relative z-10 border-t border-outline-variant/30 pt-3">
              <div className="flex gap-2">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-variant/50" title="Attach Files">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-variant/50" title="Voice Input">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <div className="h-6 w-px bg-outline-variant/50 mx-2 self-center"></div>
                <span className="text-xs font-code-sm text-on-surface-variant/70 self-center px-2 py-1 bg-surface-container rounded">Claude 3.5 Sonnet</span>
              </div>
              <Link href="/dashboard/blueprint-ai/software-architecture" className="btn-primary px-6 py-2 flex items-center gap-2 font-label-md text-label-md">
                Generate
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Suggestions & Uploads Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
          {/* AI Suggestions */}
          <div className="md:col-span-2 glass-card p-5 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">lightbulb</span>
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">AI Suggestions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['SaaS Platform', 'FinTech App', 'AI Agent Workflow', 'E-commerce Backend'].map((suggestion) => (
                <button key={suggestion} className="px-3 py-1.5 rounded-full border border-outline-variant bg-surface-container-high hover:border-primary text-xs font-code-sm text-on-surface transition-all whitespace-nowrap">
                  {suggestion}
                </button>
              ))}
              <button className="px-3 py-1.5 rounded-full border border-primary bg-primary-container/10 text-primary text-xs font-code-sm transition-all whitespace-nowrap">
                CRM System
              </button>
            </div>
          </div>
          
          {/* Upload Zone */}
          <div className="glass-card p-5 rounded-xl border-dashed border-2 border-outline-variant/50 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group bg-[#171717]/50 hover:bg-[#171717]">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3 group-hover:bg-primary-container/20 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">upload_file</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-1">Upload Docs</h4>
            <p className="text-xs font-body-sm text-on-surface-variant">PDF, Images, Flowcharts</p>
          </div>
        </div>
        
      </div>
      
      {/* Right Column: Quick Templates (Glassmorphic) */}
      <div className="w-full xl:w-80 flex flex-col gap-sm shrink-0">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Quick Templates</h3>
        
        {/* Template Card 1 */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
            </div>
            <span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">E-Comm</span>
          </div>
          <h4 className="font-headline-md text-base font-semibold text-on-surface mb-1">Modern Storefront</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">Complete requirements for a headless e-commerce setup with Stripe integration.</p>
        </div>
        
        {/* Template Card 2 */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[20px]">group</span>
            </div>
            <span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">SaaS</span>
          </div>
          <h4 className="font-headline-md text-base font-semibold text-on-surface mb-1">Internal HR Tool</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">Employee directory, time-off tracking, and performance review workflows.</p>
        </div>
        
        {/* Template Card 3 */}
        <div className="glass-panel p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded bg-tertiary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[20px]">smart_toy</span>
            </div>
            <span className="px-2 py-1 rounded bg-surface-container-high text-[10px] font-code-sm text-on-surface-variant uppercase tracking-widest">AI</span>
          </div>
          <h4 className="font-headline-md text-base font-semibold text-on-surface mb-1">Customer Support Bot</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">RAG-based AI assistant integrated with existing knowledge bases.</p>
        </div>
        
      </div>
      
    </div>
  )
}
