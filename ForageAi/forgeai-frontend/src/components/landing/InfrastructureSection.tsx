"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Section } from "@/components/ui/Section"
import { Code2, Bot, BrainCircuit } from "lucide-react"

export function InfrastructureSection() {
  const cards = [
    {
      title: "AI Software Dev",
      description: "Custom model integration, fine-tuning workflows, and robust deployment pipelines tailored to your stack.",
      icon: Code2
    },
    {
      title: "Autonomous Agents",
      description: "Deploy multi-agent systems that can plan, execute tools, and handle complex reasoning tasks independently.",
      icon: Bot
    },
    {
      title: "ML Solutions",
      description: "Predictive analytics, classification models, and anomaly detection built on cutting-edge architectures.",
      icon: BrainCircuit
    }
  ]

  return (
    <Section className="py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
          Comprehensive AI Infrastructure
        </h2>
        <p className="text-sm text-gray-400">
          Everything you need to integrate intelligence into your applications, from raw compute to high-level APIs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#15151c] border border-white/5 rounded-2xl p-8 hover:bg-[#1a1a24] transition-colors"
            >
              <div className="w-10 h-10 rounded bg-[#5a55e2]/10 flex items-center justify-center mb-6 border border-[#5a55e2]/20">
                <Icon className="w-5 h-5 text-[#818cf8]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}
