import * as React from "react"
import Link from "next/link"

export default function ArchitecturePage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">folder</span>
            <span className="text-body-sm text-on-surface-variant">Project: Project Phoenix</span>
          </div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface">Software Architecture & Tech Stack</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
            AI-generated blueprint optimized for high concurrency and rapid deployment.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export PDF
          </button>
          <Link href="/dashboard/blueprint-ai/database-design" className="btn-primary px-4 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Deploy Architecture
          </Link>
        </div>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Architecture & Tech Stack */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          
          {/* High-Level Architecture Overview */}
          <div className="glass-panel rounded-xl p-md relative overflow-hidden group border border-[#262626]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_tree</span>
                  System Topology
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-1">Microservices architecture with event-driven communication.</p>
              </div>
              <button className="btn-secondary px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">cycle</span>
                AI Regenerate
              </button>
            </div>
            
            {/* Architecture Diagram Placeholder */}
            <div className="w-full h-64 bg-surface-container-low rounded-lg border border-outline-variant/50 flex items-center justify-center relative overflow-hidden mb-4">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-8 w-full px-8">
                {/* Load Balancer */}
                <div className="bg-surface-variant border border-outline px-6 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">dns</span>
                  <span className="font-label-md text-label-md">API Gateway</span>
                </div>
                
                {/* Connectors */}
                <div className="flex justify-center w-full gap-24 relative">
                  <div className="absolute top-0 left-1/2 w-px h-8 bg-outline-variant -translate-x-1/2 -mt-8"></div>
                  <div className="absolute top-0 left-1/4 w-1/2 h-px bg-outline-variant"></div>
                  
                  {/* Service 1 */}
                  <div className="bg-surface-variant border border-outline px-4 py-3 rounded-lg shadow-lg flex flex-col items-center gap-1 w-32 relative">
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-outline-variant -translate-x-1/2"></div>
                    <span className="material-symbols-outlined text-primary">person</span>
                    <span className="font-code-sm text-code-sm text-center">Auth Svc</span>
                  </div>
                  
                  {/* Service 2 */}
                  <div className="bg-surface-variant border border-outline px-4 py-3 rounded-lg shadow-lg flex flex-col items-center gap-1 w-32 relative">
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-outline-variant -translate-x-1/2"></div>
                    <span className="material-symbols-outlined text-primary">database</span>
                    <span className="font-code-sm text-code-sm text-center">Core API</span>
                  </div>
                  
                  {/* Service 3 */}
                  <div className="bg-surface-variant border border-outline px-4 py-3 rounded-lg shadow-lg flex flex-col items-center gap-1 w-32 relative">
                    <div className="absolute -top-8 left-1/2 w-px h-8 bg-outline-variant -translate-x-1/2"></div>
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    <span className="font-code-sm text-code-sm text-center">Worker</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Technology Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Frontend */}
            <div className="glass-panel border border-[#262626] rounded-xl p-md group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-body-lg font-body-lg text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">devices</span>
                  Frontend
                </h4>
                <button className="text-outline-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-[#61DAFB] font-bold text-xs">Re</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">React 18</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">Core Framework</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-white font-bold text-xs">Next</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Next.js 14</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">SSR & Routing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-[#38B2AC] font-bold text-xs">Tw</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Tailwind CSS</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">Styling Engine</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Backend & DB */}
            <div className="glass-panel border border-[#262626] rounded-xl p-md group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-body-lg font-body-lg text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">memory</span>
                  Backend & Data
                </h4>
                <button className="text-outline-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-[#3776AB] font-bold text-xs">Py</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Python / FastAPI</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">High-performance API</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-[#336791] font-bold text-xs">Pg</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">PostgreSQL</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">Primary Relational DB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/30">
                  <div className="w-8 h-8 rounded bg-[#141414] border border-[#333] flex items-center justify-center text-[#D62424] font-bold text-xs">Rd</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Redis</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant">Caching & Queue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Architecture Decisions */}
          <div className="glass-panel border border-[#262626] rounded-xl p-md group">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Key Architecture Decisions
              </h3>
              <button className="btn-secondary px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">cycle</span>
                AI Regenerate
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-2 border-primary/50 pl-4 py-1">
                <h5 className="font-label-md text-label-md text-on-surface mb-1">Serverless vs Containers</h5>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Opted for <span className="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs tracking-wider uppercase">Containers (K8s)</span> over serverless to maintain predictable latency for core ML processing pipelines and avoid cold starts during traffic spikes.
                </p>
              </div>
              <div className="border-l-2 border-tertiary/50 pl-4 py-1">
                <h5 className="font-label-md text-label-md text-on-surface mb-1">Event-Driven Pattern</h5>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Implementing an event bus (Kafka/RabbitMQ) for asynchronous processing of AI tasks, decoupling the web API from heavy compute workers to ensure UI responsiveness.
                </p>
              </div>
              <div className="border-l-2 border-secondary/50 pl-4 py-1">
                <h5 className="font-label-md text-label-md text-on-surface mb-1">Scalability Notes</h5>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Database read replicas configured for reporting queries. Web sockets utilized for real-time status updates on long-running generations.
                </p>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Right Column: Folder Structure (IDE Style) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="glass-panel border border-[#262626] rounded-xl flex flex-col h-full overflow-hidden border-t-2 border-t-outline-variant/30 min-h-[600px]">
            {/* IDE Header */}
            <div className="bg-surface-container-high px-4 py-3 border-b border-outline-variant flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline-variant text-[18px]">account_tree</span>
                <span className="font-code-sm text-code-sm text-on-surface uppercase tracking-widest text-xs">Project Scaffold</span>
              </div>
              <div className="flex gap-2">
                <button className="text-outline hover:text-primary transition-colors" title="Copy Structure">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <button className="text-outline hover:text-primary transition-colors" title="Regenerate">
                  <span className="material-symbols-outlined text-[16px]">cycle</span>
                </button>
              </div>
            </div>
            
            {/* IDE Body (Tree) */}
            <div className="bg-[#0A0A0C] flex-1 overflow-y-auto p-4 font-code-sm text-code-sm text-outline font-mono leading-relaxed">
              
              <div className="flex items-center gap-2 text-on-surface mb-1 cursor-pointer hover:bg-surface-variant/30 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>phoenix-monorepo/</span>
              </div>
              
              <div className="ml-4 relative border-l border-[#262626] pl-3 py-1">
                <div className="flex items-center gap-2 text-on-surface mb-1 cursor-pointer hover:bg-surface-variant/30 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                  <span>apps/</span>
                </div>
                
                <div className="ml-4 relative border-l border-[#262626] pl-3 py-1">
                  <div className="flex items-center gap-2 text-on-surface mb-1 cursor-pointer hover:bg-surface-variant/30 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[16px] text-secondary">folder</span>
                    <span>web/</span>
                  </div>
                  <div className="ml-4 relative border-l border-[#262626] pl-3 py-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                      <span>package.json</span>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                      <span>next.config.js</span>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">folder</span>
                      <span>src/</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 relative border-l border-[#262626] pl-3 py-1 mt-2">
                  <div className="flex items-center gap-2 text-on-surface mb-1 cursor-pointer hover:bg-surface-variant/30 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                    <span>api/</span>
                  </div>
                  <div className="ml-4 relative border-l border-[#262626] pl-3 py-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                      <span>requirements.txt</span>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                      <span>main.py</span>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">folder</span>
                      <span>routers/</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 relative border-l border-[#262626] pl-3 py-1 mt-2">
                <div className="flex items-center gap-2 text-on-surface mb-1 cursor-pointer hover:bg-surface-variant/30 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                  <span>packages/</span>
                </div>
                <div className="ml-4 relative border-l border-[#262626] pl-3 py-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">folder</span>
                    <span>ui-components/</span>
                  </div>
                  <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">folder</span>
                    <span>database-schema/</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 mt-2 flex flex-col gap-1">
                <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                  <span>docker-compose.yml</span>
                </div>
                <div className="flex items-center gap-2 hover:bg-surface-variant/30 px-2 py-1 rounded cursor-pointer">
                  <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                  <span>.gitignore</span>
                </div>
              </div>
              
            </div>
            
            {/* IDE Footer */}
            <div className="bg-surface-container-lowest px-4 py-2 border-t border-outline-variant flex justify-between items-center text-xs text-outline-variant shrink-0">
              <span>Ready to initialize</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Valid Configuration
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
