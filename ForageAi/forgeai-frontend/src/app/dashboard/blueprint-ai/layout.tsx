import * as React from "react"
import BlueprintSidebar from "@/components/blueprint/BlueprintSidebar"

export default function BlueprintAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full w-full">
      <BlueprintSidebar />
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* We can add a gradient or specific background here if needed */}
        <main className="flex-1 overflow-y-auto p-4 md:p-gutter relative z-10 w-full h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
