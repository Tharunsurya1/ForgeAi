import * as React from "react"
import Sidebar from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full antialiased text-slate-100 bg-[#0c0d0e] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-[#0c0d0e]">
        <main className="flex-1 p-4 md:p-8 z-10 relative max-w-[1680px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

