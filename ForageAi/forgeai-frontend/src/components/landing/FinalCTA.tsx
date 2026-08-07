import * as React from "react"
import { Section } from "@/components/ui/Section"
import { Button } from "@/components/ui/Button"

export function FinalCTA() {
  return (
    <Section className="py-32">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Ready To Build Your Next AI Product?
        </h2>
        <p className="text-sm text-gray-400 mb-10">
          Join thousands of developers building the future with ForgeAI's infrastructure.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="default" className="rounded-md bg-white hover:bg-gray-100 text-black border-0 px-6 font-medium">
            Create Free Account
          </Button>
          <Button variant="outline" size="default" className="rounded-md bg-[#16161c] hover:bg-[#1a1a24] border border-white/10 text-white px-6 font-medium">
            Read the Docs
          </Button>
        </div>
      </div>
    </Section>
  )
}
