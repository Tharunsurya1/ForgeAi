"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { ThreeBackground } from "@/components/landing/ThreeBackground"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a24] border border-white/5 mb-8 text-xs font-medium text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              v2.0 Models Large Live
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Build AI Solutions<br />
              That Actually <span className="text-[#a5b4fc]">Grow<br />Your Business</span>
            </h1>
            
            <p className="mt-4 text-base md:text-lg text-gray-400 max-w-lg mb-10">
              Deploy enterprise-grade language models, custom agents, and machine learning workflows in minutes. Built for developers, designed for scale.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto rounded-md bg-[#5a55e2] hover:bg-[#4a45d2] border-0 shadow-none text-white px-6">
                Start Building Free
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-md bg-[#16161c] hover:bg-[#1a1a24] border border-white/10 text-white px-6">
                Book a Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white">99.9%</h3>
                <p className="text-xs text-gray-400 mt-1">Uptime SLA</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">50ms</h3>
                <p className="text-xs text-gray-400 mt-1">Avg Latency</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">10B+</h3>
                <p className="text-xs text-gray-400 mt-1">Tokens Processed</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 mt-16 lg:mt-0 relative"
          >
            <div className="relative rounded-xl border border-white/5 bg-[#15151c] h-[450px] shadow-2xl flex flex-col p-4 overflow-hidden">
               {/* 3D Animation Background */}
               <ThreeBackground />
               
               <div className="inline-flex bg-[#1a1a24] border border-white/5 px-3 py-1 rounded text-xs text-gray-400 self-start relative z-10 shadow-md">
                 Status: optimizing_weights
               </div>
               
               <div className="mt-auto self-end relative z-10">
                 <div className="inline-flex items-center gap-2 bg-[#1a1a24] border border-white/5 px-3 py-1.5 rounded-full text-xs text-gray-300 shadow-md backdrop-blur-md">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></div>
                   GPU Cluster Active
                 </div>
               </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}
