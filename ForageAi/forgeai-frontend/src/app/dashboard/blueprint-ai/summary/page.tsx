import * as React from "react"
import Link from "next/link"

export default function SummaryPage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-xl">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8 text-on-surface-variant font-label-md text-label-md">
        <Link href="/dashboard/projects" className="flex items-center gap-1 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">folder</span>
          Projects
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">Project Alpha</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface">Blueprint Summary</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-xl">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface">Blueprint Summary</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            Executive overview and cost estimation for Project Alpha.
          </p>
        </div>
        <button className="btn-secondary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-on-surface hover:bg-surface-variant/30 transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Edit Configuration
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-gutter">
        
        {/* Cost Estimation Block */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
              Cost Estimation
            </h3>
            <div className="flex bg-[#1F1F24] rounded-lg p-1">
              <button className="px-4 py-1.5 rounded-md font-label-md text-label-md bg-[#2B2B32] text-on-surface shadow-sm">Monthly</button>
              <button className="px-4 py-1.5 rounded-md font-label-md text-label-md text-on-surface-variant hover:text-on-surface">Yearly</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[160px]">
            {/* Total Estimate */}
            <div className="glass-panel border border-[#262626] rounded-xl p-md flex flex-col justify-center bg-[#171717]/80">
              <span className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-widest mb-2 font-semibold">Total Estimated</span>
              <span className="text-display-xl font-display-xl text-on-surface font-bold leading-none tracking-tighter">$4,250</span>
            </div>
            
            {/* Breakdown List */}
            <div className="glass-panel border border-[#262626] rounded-xl p-6 flex flex-col justify-center gap-4 bg-[#171717]/80">
              <div className="flex justify-between items-center font-code-sm text-code-sm">
                <span className="flex items-center gap-2 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-secondary"></span> Infrastructure</span>
                <span className="text-on-surface font-semibold">$1,200</span>
              </div>
              <div className="flex justify-between items-center font-code-sm text-code-sm">
                <span className="flex items-center gap-2 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span> AI Tokens</span>
                <span className="text-on-surface font-semibold">$2,800</span>
              </div>
              <div className="flex justify-between items-center font-code-sm text-code-sm">
                <span className="flex items-center gap-2 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Development</span>
                <span className="text-on-surface font-semibold">$250</span>
              </div>
            </div>
            
            {/* Chart Graphic */}
            <div className="glass-panel border border-[#262626] rounded-xl p-md flex items-end justify-center gap-2 bg-[#171717]/80 h-full pt-8 pb-4 px-6">
              <div className="w-8 bg-secondary h-[40%] rounded-t-sm"></div>
              <div className="w-8 bg-secondary h-[80%] rounded-t-sm"></div>
              <div className="w-8 bg-tertiary h-[10%] rounded-t-sm"></div>
              <div className="w-8 bg-primary h-[90%] rounded-t-sm"></div>
              <div className="w-8 bg-secondary h-[45%] rounded-t-sm"></div>
            </div>
          </div>
        </div>
        
        {/* Export Blueprint Block */}
        <div className="w-full xl:w-[400px] flex flex-col gap-4">
          <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">download</span>
            Export Blueprint
          </h3>
          
          <div className="glass-panel border border-[#262626] rounded-xl p-md bg-[#171717]/80 h-[160px] flex flex-col justify-between">
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Download your configuration files or sync directly to your repository.
            </p>
            
            <div className="flex flex-col gap-2 mt-4">
              <button className="w-full bg-[#1F1F24] border border-[#2B2B32] hover:border-primary/50 transition-colors p-3 rounded-lg flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-error/10 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  </div>
                  <div className="text-left">
                    <div className="font-label-md text-label-md text-on-surface">Executive PDF Report</div>
                    <div className="font-code-sm text-[11px] text-on-surface-variant">Formatted for stakeholders</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">download</span>
              </button>
              
              <button className="w-full bg-[#1F1F24] border border-[#2B2B32] hover:border-primary/50 transition-colors p-3 rounded-lg flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">data_object</span>
                  </div>
                  <div className="text-left">
                    <div className="font-label-md text-label-md text-on-surface">Configuration JSON</div>
                    <div className="font-code-sm text-[11px] text-on-surface-variant">Raw IaC definitions</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">download</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
      
    </div>
  )
}
