import * as React from "react"
import Link from "next/link"

export default function DocumentationPage() {
  return (
    <div className="max-w-[1440px] mx-auto w-full h-full pb-xl">
      
      {/* Pre-Header Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 font-code-sm text-code-sm text-outline-variant uppercase tracking-widest font-semibold">
        <span className="hover:text-on-surface transition-colors cursor-pointer">Documentation</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Core Services</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-xl">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface">Database & API</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-3xl">
            Comprehensive schemas and RESTful endpoints for the AI Agent orchestration layer. Includes PostgreSQL models and MongoDB document structures.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Schema
          </button>
          <Link href="/dashboard/blueprint-ai/summary" className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-[0_0_15px_rgba(88,86,214,0.3)] hover:shadow-[0_0_20px_rgba(88,86,214,0.5)] transition-all">
            <span className="material-symbols-outlined text-[18px]">integration_instructions</span>
            Export to OpenAPI
          </Link>
        </div>
      </div>
      
      {/* Database Design Section */}
      <div className="mb-16">
        <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-secondary-container/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">database</span>
          </div>
          Database Design
        </h3>
        
        <div className="flex flex-col xl:flex-row gap-gutter">
          {/* Left Column: Schema Tables */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Postgres Table */}
            <div className="glass-panel border border-[#262626] rounded-xl overflow-hidden bg-[#171717]/80 shadow-lg">
              <div className="bg-[#0A0A0C] px-5 py-4 flex items-center gap-4 border-b border-[#262626]">
                <span className="bg-[#336791] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">PostgreSQL</span>
                <span className="font-headline-md text-lg text-on-surface font-semibold">public.agents</span>
                <span className="material-symbols-outlined text-outline-variant text-[18px] ml-auto cursor-pointer hover:text-on-surface">content_copy</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#262626] text-on-surface-variant font-label-md text-xs">
                      <th className="py-3 px-5 font-semibold">Column</th>
                      <th className="py-3 px-5 font-semibold">Type</th>
                      <th className="py-3 px-5 font-semibold">Attributes / Relations</th>
                    </tr>
                  </thead>
                  <tbody className="font-code-sm text-[13px]">
                    <tr className="border-b border-[#262626]/50">
                      <td className="py-4 px-5 text-on-surface flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-tertiary text-[14px]">key</span> id
                      </td>
                      <td className="py-4 px-5 text-secondary">uuid</td>
                      <td className="py-4 px-5 text-outline-variant">PK, default: uuid_generate_v4()</td>
                    </tr>
                    <tr className="border-b border-[#262626]/50">
                      <td className="py-4 px-5 text-on-surface font-medium">name</td>
                      <td className="py-4 px-5 text-secondary">varchar(255)</td>
                      <td className="py-4 px-5 text-outline-variant">NOT NULL</td>
                    </tr>
                    <tr className="border-b border-[#262626]/50">
                      <td className="py-4 px-5 text-on-surface flex items-center gap-2 font-medium">
                        <span className="material-symbols-outlined text-outline-variant text-[14px]">link</span> project_id
                      </td>
                      <td className="py-4 px-5 text-secondary">uuid</td>
                      <td className="py-4 px-5 text-outline-variant">FK → public.projects(id), INDEX</td>
                    </tr>
                    <tr className="border-b border-[#262626]/50">
                      <td className="py-4 px-5 text-on-surface font-medium">status</td>
                      <td className="py-4 px-5 text-secondary">enum('active', 'idle', 'error')</td>
                      <td className="py-4 px-5 text-outline-variant">default: 'idle'</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-5 text-on-surface font-medium">created_at</td>
                      <td className="py-4 px-5 text-secondary">timestampz</td>
                      <td className="py-4 px-5 text-outline-variant">default: now()</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* MongoDB Document */}
            <div className="glass-panel border border-[#262626] rounded-xl overflow-hidden bg-[#171717]/80 shadow-lg">
              <div className="bg-[#0A0A0C] px-5 py-4 flex items-center gap-4 border-b border-[#262626]">
                <span className="bg-[#47A248] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">MongoDB</span>
                <span className="font-headline-md text-lg text-on-surface font-semibold">agent_logs</span>
              </div>
              <div className="p-5 font-code-sm text-[13px] overflow-x-auto leading-relaxed">
                <span className="text-on-surface">{"{"}</span><br />
                <span className="text-tertiary ml-4">"_id"</span><span className="text-on-surface">: ObjectId,</span><br />
                <span className="text-tertiary ml-4">"agent_id"</span><span className="text-on-surface">: UUID, </span><span className="text-outline-variant italic">// Ref to Postgres public.agents.id</span><br />
                <span className="text-tertiary ml-4">"event_type"</span><span className="text-on-surface">: </span><span className="text-error">"String"</span><span className="text-on-surface">, </span><span className="text-outline-variant italic">// e.g., 'inference_start', 'tool_call'</span><br />
                <span className="text-tertiary ml-4">"payload"</span><span className="text-on-surface">: {"{"}</span><br />
                <span className="text-tertiary ml-8">"prompt_tokens"</span><span className="text-on-surface">: Int32,</span><br />
                <span className="text-tertiary ml-8">"completion_tokens"</span><span className="text-on-surface">: Int32,</span><br />
                <span className="text-tertiary ml-8">"tools_used"</span><span className="text-on-surface">: [</span><span className="text-error">"String"</span><span className="text-on-surface">]</span><br />
                <span className="text-on-surface ml-4">{"}"},</span><br />
                <span className="text-tertiary ml-4">"timestamp"</span><span className="text-on-surface">: ISODate</span><br />
                <span className="text-on-surface">{"}"}</span>
              </div>
            </div>
            
          </div>
          
          {/* Right Column: SQL Preview */}
          <div className="w-full xl:w-[480px] shrink-0">
            <div className="glass-panel border border-[#262626] rounded-xl flex flex-col overflow-hidden bg-[#171717]/80 h-full min-h-[400px]">
              <div className="bg-[#1A1A1F] px-4 py-3 flex items-center justify-between border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline-variant text-[16px]">terminal</span>
                  <span className="font-label-md text-sm text-on-surface font-semibold">Interactive SQL Preview</span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-[#2B2B32] text-on-surface-variant hover:text-on-surface px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase transition-colors">Format</button>
                  <button className="bg-gradient-primary text-white px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(88,86,214,0.3)]">
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span> Run
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-[#0A0A0C] p-4 font-code-sm text-[13px] leading-relaxed overflow-y-auto">
                <div className="flex text-outline-variant mb-2">
                  <span className="w-6 text-right pr-3 select-none">1</span>
                  <span></span>
                </div>
                <div className="flex text-outline-variant mb-2">
                  <span className="w-6 text-right pr-3 select-none">2</span>
                  <span className="italic">-- Fetch active agents with recent logs</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">3</span>
                  <span className="text-[#cba6f7] font-semibold">SELECT</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">4</span>
                  <span className="ml-4">a.id,</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">5</span>
                  <span className="ml-4">a.name,</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">6</span>
                  <span className="ml-4">a.status,</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">7</span>
                  <span className="ml-4">p.name <span className="text-[#cba6f7] font-semibold">AS</span> project_name</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">8</span>
                  <span className="text-[#cba6f7] font-semibold">FROM</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">9</span>
                  <span className="ml-4">public.agents</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">10</span>
                  <span className="text-[#cba6f7] font-semibold">JOIN</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">11</span>
                  <span className="ml-4">public.projects <span className="text-[#cba6f7] font-semibold">ON</span> a.project_id = p.id</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">12</span>
                  <span className="text-[#cba6f7] font-semibold">WHERE</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">13</span>
                  <span className="ml-4">a.status = <span className="text-[#a6e3a1]">'active'</span></span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">14</span>
                  <span className="text-[#cba6f7] font-semibold">ORDER BY</span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">15</span>
                  <span className="ml-4">a.created_at <span className="text-[#cba6f7] font-semibold">DESC</span></span>
                </div>
                <div className="flex text-on-surface">
                  <span className="w-6 text-right pr-3 select-none text-outline-variant">16</span>
                  <span className="text-[#cba6f7] font-semibold">LIMIT</span> <span className="text-[#fab387]">10</span>;
                </div>
              </div>
              
              <div className="bg-[#1A1A1F] px-4 py-2 flex items-center justify-between border-t border-[#262626] text-[11px] font-code-sm text-outline-variant">
                <span>Query OK, 0 rows affected (0.01 sec)</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span> Read-only Sandbox
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Horizontal Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#262626] to-transparent my-16"></div>
      
      {/* API Endpoints Section */}
      <div>
        <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">api</span>
          </div>
          API Endpoints
        </h3>
        <div className="flex items-center gap-2 mb-8 ml-14">
          <span className="font-label-md text-sm text-on-surface-variant">Base URL</span>
          <span className="bg-[#1A1A1F] px-3 py-1 rounded-md border border-[#262626] font-code-sm text-[13px] text-on-surface">https://api.forgeai.com/v1</span>
        </div>
        
        <div className="space-y-4 ml-14">
          
          {/* Endpoint 1 - Expanded */}
          <div className="glass-panel border border-[#262626] rounded-xl overflow-hidden bg-[#171717]/80 shadow-md">
            <div className="bg-[#1A1A1F] px-5 py-4 flex items-center justify-between border-b border-[#262626] cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="bg-[#1e3a8a] text-[#60a5fa] font-code-sm font-bold px-3 py-1 rounded text-xs">GET</span>
                <span className="font-code-sm font-semibold text-[15px] text-on-surface">/agents</span>
                <span className="text-outline-variant text-sm ml-2 hidden md:inline-block">- List all agents in a project</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant">expand_less</span>
            </div>
            
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Col: Params */}
              <div>
                <h4 className="font-label-md text-sm font-bold text-on-surface mb-4">Query Parameters</h4>
                
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-code-sm font-semibold text-[13px] text-on-surface">project_id</span>
                      <span className="font-code-sm text-[12px] text-secondary ml-2">uuid</span>
                    </div>
                    <span className="bg-error/20 text-error border border-error/30 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">Required</span>
                  </div>
                  <p className="text-body-sm text-sm text-on-surface-variant">Filter agents belonging to a specific project.</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <span className="font-code-sm font-semibold text-[13px] text-on-surface">status</span>
                    <span className="font-code-sm text-[12px] text-secondary ml-2">string</span>
                  </div>
                  <p className="text-body-sm text-sm text-on-surface-variant">Filter by status: 'active', 'idle', or 'error'.</p>
                </div>
              </div>
              
              {/* Right Col: Code Previews */}
              <div className="space-y-4">
                
                {/* Request Box */}
                <div className="bg-[#0A0A0C] border border-[#262626] rounded-lg overflow-hidden">
                  <div className="bg-[#1A1A1F] px-3 py-2 border-b border-[#262626] flex justify-between items-center">
                    <span className="font-code-sm text-[11px] text-outline-variant">Request Example (cURL)</span>
                    <span className="material-symbols-outlined text-outline-variant text-[14px] cursor-pointer hover:text-on-surface">content_copy</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-code-sm text-[12px] text-on-surface">
                      <span className="text-[#f38ba8]">curl</span> -X GET "https://api.forgeai.com/v1/agents?project_id=..." \<br/>
                      <span className="text-on-surface">  -H </span><span className="text-[#a6e3a1]">"Authorization: Bearer wk_test_..."</span>
                    </pre>
                  </div>
                </div>
                
                {/* Response Box */}
                <div className="bg-[#0A0A0C] border border-[#262626] rounded-lg overflow-hidden">
                  <div className="bg-[#1A1A1F] px-3 py-2 border-b border-[#262626] flex justify-between items-center">
                    <span className="font-code-sm text-[11px] text-outline-variant">Response (200 OK)</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="font-code-sm text-[12px] text-on-surface leading-relaxed">
                      {"{\n"}
                      <span className="text-tertiary">  "data"</span>: [{"\n"}
                      {"    {\n"}
                      <span className="text-tertiary">      "id"</span>: <span className="text-error">"8f0e8b24-..."</span>,{"\n"}
                      <span className="text-tertiary">      "name"</span>: <span className="text-error">"Data Extractor Alpha"</span>,{"\n"}
                      <span className="text-tertiary">      "status"</span>: <span className="text-error">"active"</span>,{"\n"}
                      <span className="text-tertiary">      "created_at"</span>: <span className="text-error">"2023-10-27T10:00:00Z"</span>{"\n"}
                      {"    }\n"}
                      {"  ],\n"}
                      <span className="text-tertiary">  "meta"</span>: {"{ "}
                      <span className="text-tertiary">"total"</span>: <span className="text-[#fab387]">1</span>
                      {" }\n"}
                      {"}"}
                    </pre>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          
          {/* Endpoint 2 - Collapsed */}
          <div className="glass-panel border border-[#262626] rounded-xl overflow-hidden bg-[#171717]/50 hover:bg-[#171717]/80 transition-colors cursor-pointer">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-[#1e4620] text-[#4ade80] font-code-sm font-bold px-3 py-1 rounded text-xs">POST</span>
                <span className="font-code-sm font-semibold text-[15px] text-on-surface">/agents</span>
                <span className="text-outline-variant text-sm ml-2 hidden md:inline-block">- Create a new AI Agent</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
          </div>
          
          {/* Endpoint 3 - Collapsed */}
          <div className="glass-panel border border-[#262626] rounded-xl overflow-hidden bg-[#171717]/50 hover:bg-[#171717]/80 transition-colors cursor-pointer">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-[#450a0a] text-[#f87171] font-code-sm font-bold px-3 py-1 rounded text-xs">DEL</span>
                <span className="font-code-sm font-semibold text-[15px] text-on-surface">/agents/{"{id}"}</span>
                <span className="text-outline-variant text-sm ml-2 hidden md:inline-block">- Delete an Agent</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  )
}
