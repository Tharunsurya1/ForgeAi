"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -80% 0px" }
    )

    const sections = document.querySelectorAll("h2[id]")
    sections.forEach((section) => observer.observe(section))

    return () => sections.forEach((section) => observer.unobserve(section))
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-24 px-6 md:px-12 w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-16 relative z-10">
        
        {/* Sticky Left Sidebar (TOC) */}
        <aside className="hidden md:block">
          <div className="sticky top-32 h-[calc(100vh-128px)] overflow-y-auto pr-4">
            <div className="mb-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-6">Legal</h1>
            
            <nav className="flex flex-col border-l border-white/10">
              {/* Privacy Policy Section */}
              <div className="mb-6">
                <h4 className="text-sm text-white pl-6 py-2 mb-2 uppercase tracking-wider font-semibold">Privacy Policy</h4>
                <a 
                  href="#p-introduction"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 'p-introduction' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >1. Introduction</a>
                <a 
                  href="#p-data-collection"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 'p-data-collection' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >2. Data Collection</a>
                <a 
                  href="#p-data-usage"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 'p-data-usage' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >3. Data Usage</a>
                <a 
                  href="#p-security"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 'p-security' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >4. Security</a>
              </div>

              {/* Terms of Service Section */}
              <div>
                <h4 className="text-sm text-white pl-6 py-2 mb-2 uppercase tracking-wider font-semibold mt-4">Terms of Service</h4>
                <a 
                  href="#t-acceptance"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 't-acceptance' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >1. Acceptance</a>
                <a 
                  href="#t-account"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 't-account' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >2. Account Terms</a>
                <a 
                  href="#t-api"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 't-api' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >3. API Usage</a>
                <a 
                  href="#t-liability"
                  className={`block pl-6 py-1.5 text-sm transition-all border-l-2 ${activeSection === 't-liability' ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5' : 'text-gray-400 border-transparent hover:text-indigo-400 hover:bg-indigo-500/5'}`}
                >4. Limitation of Liability</a>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <article className="bg-[#15151c] border border-white/5 rounded-2xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Subtle top-weighted border-gradient for depth */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Last Updated: October 2024</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Privacy Policy & Terms</h1>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">Please read these documents carefully before using ForgeAI's services. They dictate the structural rules of our engagement and data handling practices.</p>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .doc-content h2 {
                font-size: 24px;
                font-weight: 600;
                margin-top: 48px;
                margin-bottom: 16px;
                color: #ffffff;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 8px;
            }
            .doc-content p {
                margin-bottom: 16px;
                line-height: 1.7;
                color: #9ca3af;
            }
            .doc-content ul {
                list-style-type: disc;
                margin-left: 24px;
                margin-bottom: 16px;
                color: #9ca3af;
                line-height: 1.7;
            }
            .doc-content li {
                margin-bottom: 8px;
            }
          `}} />

          <div className="doc-content">
            {/* PRIVACY POLICY CONTENT */}
            <section className="mb-16 pb-16 border-b border-white/10" id="privacy-policy">
              <h2 className="scroll-mt-32" id="p-introduction">1. Introduction</h2>
              <p>At ForgeAI, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
              <p>This policy is designed for a developer-centric audience, ensuring clarity on exactly what telemetric and operational data is processed during the use of our high-performance APIs and SDKs.</p>
              
              <h2 className="scroll-mt-32" id="p-data-collection">2. Data Collection</h2>
              <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul>
                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, products and services, including API request payloads (which may be temporarily cached for performance), frequency, and latency metrics.</li>
              </ul>
              
              <h2 className="scroll-mt-32" id="p-data-usage">3. Data Usage</h2>
              <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul>
                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests, particularly concerning the continuous improvement of our model accuracy.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
              
              <h2 className="scroll-mt-32" id="p-security">4. Security</h2>
              <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
              
              <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  <Lock className="text-indigo-400 w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-semibold text-white mb-2">End-to-End Encryption</h4>
                    <p className="text-sm text-gray-400 m-0">All API traffic is secured via TLS 1.3. Data at rest is encrypted using AES-256 standards across all distributed nodes.</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* TERMS OF SERVICE CONTENT */}
            <section id="terms-of-service">
              <h2 className="scroll-mt-32" id="t-acceptance">1. Acceptance of Terms</h2>
              <p>By accessing or using the ForgeAI API, SDK, or related services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.</p>
              
              <h2 className="scroll-mt-32" id="t-account">2. Account Terms</h2>
              <p>To access certain features of the Service, you must register for an account.</p>
              <ul>
                <li>You must provide accurate, complete, and current information.</li>
                <li>You are responsible for safeguarding the password and API keys that you use to access the Service.</li>
                <li>You agree not to disclose your password or keys to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
              </ul>
              
              <h2 className="scroll-mt-32" id="t-api">3. API Usage and Rate Limiting</h2>
              <p>Usage of the ForgeAI API is subject to rate limiting based on your subscription tier.</p>
              <p>You agree not to attempt to circumvent rate limits or to use the API in a manner that excessively burdens our infrastructure. We reserve the right to temporarily or permanently suspend access if we detect abusive patterns.</p>
              
              <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mt-8 font-mono text-sm text-gray-400 overflow-x-auto">
                HTTP/1.1 429 Too Many Requests<br/>
                Retry-After: 3600<br/>
                X-RateLimit-Limit: 1000<br/>
                X-RateLimit-Remaining: 0<br/>
                X-RateLimit-Reset: 1609459200
              </div>
              
              <h2 className="scroll-mt-32" id="t-liability">4. Limitation of Liability</h2>
              <p>In no event shall ForgeAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.</p>
            </section>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  )
}
