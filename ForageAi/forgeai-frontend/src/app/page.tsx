import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { InfrastructureSection } from "@/components/landing/InfrastructureSection"
import { EngineeredSection } from "@/components/landing/EngineeredSection"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <HeroSection />
      <InfrastructureSection />
      <EngineeredSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
