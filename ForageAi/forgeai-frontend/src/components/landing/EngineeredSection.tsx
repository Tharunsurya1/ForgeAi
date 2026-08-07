"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Section } from "@/components/ui/Section"
import { CheckCircle2, Activity } from "lucide-react"

export function EngineeredSection() {
  const features = [
    {
      title: "Drop-in API Replacements",
      description: "Compatible with OpenAI SDKs for seamless migration."
    },
    {
      title: "Enterprise Security",
      description: "SOC2 Type II certified, zero data retention policies available."
    },
    {
      title: "Edge Deployment",
      description: "Push optimized models to the edge for zero-latency operations."
    }
  ]

  return (
    <Section className="py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left Column - Dashboard Mock */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 lg:mb-0"
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#15151c] h-[400px] shadow-2xl overflow-hidden p-4">
               {/* Mock Dashboard Header */}
               <div className="flex gap-4 border-b border-white/5 pb-4 mb-4 text-xs text-gray-500 font-medium">
                 <span className="text-[#818cf8]">Overview</span>
                 <span>Models</span>
                 <span>Deployments</span>
                 <span>Monitoring</span>
                 <span>Security</span>
                 <span>Settings</span>
               </div>
               
               {/* Mock Content */}
               <div className="flex gap-4 h-[calc(100%-60px)]">
                 <div className="flex-1 border border-white/5 bg-[#1a1a24] rounded-lg p-4 flex flex-col justify-between">
                   <div className="text-xs text-gray-400">Inference Latency</div>
                   <div className="flex items-end gap-2">
                     <span className="text-3xl text-white font-bold">412</span>
                     <span className="text-xs text-gray-500 mb-1">ms</span>
                   </div>
                   <div className="w-full h-16 mt-4 opacity-50">
                     <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio-none">
                       <path d="M0,20 Q10,5 20,15 T40,25 T60,5 T80,20 T100,10" fill="none" stroke="#818cf8" strokeWidth="2" />
                     </svg>
                   </div>
                 </div>
                 
                 <div className="flex-[2] border border-white/5 bg-[#1a1a24] rounded-lg p-4 relative overflow-hidden">
                   <div className="text-xs text-gray-400 mb-4">Knowledge Graph Activity</div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-30 mt-8">
                     <svg viewBox="0 0 200 100" className="w-full h-full">
                       <circle cx="50" cy="50" r="4" fill="#818cf8" />
                       <circle cx="100" cy="30" r="6" fill="#c084fc" />
                       <circle cx="150" cy="60" r="5" fill="#818cf8" />
                       <circle cx="90" cy="80" r="4" fill="#818cf8" />
                       <path d="M50,50 L100,30 L150,60 L90,80 Z" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="4" />
                       <path d="M50,50 L90,80" fill="none" stroke="#c084fc" strokeWidth="1" />
                     </svg>
                   </div>
                 </div>
               </div>
               
               <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 bg-[#1a1a24] border border-white/10 px-3 py-2 rounded-lg text-xs text-gray-300 shadow-lg">
                 <div className="w-6 h-6 rounded-full bg-[#5a55e2]/20 flex items-center justify-center">
                   <Activity className="w-3 h-3 text-[#818cf8]" />
                 </div>
                 <div>
                   <div className="font-semibold text-white">Inference Speed</div>
                   <div className="text-[10px] text-gray-500">Optimized to 20 tokens/sec</div>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Right Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pl-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Engineered for the Modern Tech Stack
            </h2>
            <p className="text-sm text-gray-400 mb-10 max-w-lg">
              We abstract away the complexity of ML infrastructure so your team can focus on building product features that matter.
            </p>
            
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-[#5a55e2]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </div>
    </Section>
  )
}
