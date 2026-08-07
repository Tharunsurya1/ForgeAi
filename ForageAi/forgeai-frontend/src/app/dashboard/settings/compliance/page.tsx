"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShieldCheck,
  Sparkles,
  Check,
  Lock,
  Globe,
  Award,
} from "lucide-react"

export default function CompliancePage() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  return (
    <div className="w-full min-h-screen text-slate-100 font-sans pb-16 flex flex-col gap-6">
      {toastMessage && (
        <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-pulse fixed top-5 right-5 z-50">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="w-full bg-[#12141c]/90 backdrop-blur-xl border border-[#222534] rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Enterprise SSO & Compliance Center</h1>
            <p className="text-xs text-slate-400">Configure SAML 2.0, Okta, Azure AD, SOC2 Type II, ISO27001, and HIPAA compliance policy.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {[
          { name: "SOC 2 Type II Certification", desc: "Annual audit report & security controls compliance", status: "VERIFIED 🟢" },
          { name: "ISO 27001 Information Security", desc: "Global ISMS policy audit verified", status: "VERIFIED 🟢" },
          { name: "GDPR & HIPAA Data Privacy", desc: "Zero AI training on customer data & zero retention", status: "VERIFIED 🟢" },
          { name: "SAML 2.0 Single Sign-On", desc: "Okta, Azure AD, & Google Workspace SSO integration", status: "ACTIVE 🟢" },
        ].map((item, idx) => (
          <div key={idx} className="p-5 bg-[#141620] border border-[#232736] rounded-2xl flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between">
              <strong className="text-white text-xs">{item.name}</strong>
              <span className="text-[10px] text-emerald-400 font-bold">{item.status}</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
