import * as React from "react"

export default function TopNav() {
  return (
    <header className="h-16 border-b border-outline-variant/30 px-6 flex items-center justify-between shrink-0 z-20 sticky top-0 bg-background/80 backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            type="text" 
            placeholder="Command + K to search..." 
            className="w-full bg-[#1A1A1F] border border-outline-variant/30 rounded-lg pl-10 pr-12 py-2 font-code-sm text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="bg-surface-variant/50 border border-outline-variant/30 rounded px-1.5 py-0.5 text-[10px] font-code-sm text-on-surface-variant flex items-center">⌘</kbd>
            <kbd className="bg-surface-variant/50 border border-outline-variant/30 rounded px-1.5 py-0.5 text-[10px] font-code-sm text-on-surface-variant flex items-center">K</kbd>
          </div>
        </div>
      </div>
      
      {/* Action Icons & Avatar */}
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-on-surface transition-colors relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-error"></span>
        </button>
        <button className="btn-primary text-white px-4 py-1.5 rounded-lg font-label-md text-sm shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
          Deploy
        </button>
      </div>
    </header>
  )
}
