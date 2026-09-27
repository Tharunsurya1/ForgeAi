"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BlueprintSidebar() {
  const pathname = usePathname()
  const [activeBlueprintId, setActiveBlueprintId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const idFromUrl = urlParams.get("id")
      const idFromStorage = localStorage.getItem("forgeai_active_blueprint_id")
      setActiveBlueprintId(idFromUrl || idFromStorage)
    }
  }, [pathname])

  const modules = [
    { label: "New Blueprint", href: "/dashboard/blueprint-ai/new", icon: "add_circle" },
    { label: "Software Architecture", href: "/dashboard/blueprint-ai/software-architecture", icon: "account_tree" },
    { label: "Database Design", href: "/dashboard/blueprint-ai/database-design", icon: "database" },
    { label: "Deployment Plan", href: "/dashboard/blueprint-ai/deployment-plan", icon: "cloud" },
    { label: "Blueprint Summary", href: "/dashboard/blueprint-ai/summary", icon: "summarize" },
  ]

  return (
    <aside className="w-64 border-r border-outline-variant/30 bg-surface/50 hidden md:flex flex-col h-full overflow-y-auto shrink-0 relative z-10 custom-scrollbar">
      <div className="p-4 border-b border-outline-variant/30 sticky top-0 bg-surface/90 backdrop-blur z-20">
        <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">memory</span>
          Blueprint Studio
        </h3>
      </div>
      <nav className="p-2 flex flex-col gap-0.5">
        {modules.map((item) => {
          const isActive = pathname === item.href
          const hrefWithId = item.href === "/dashboard/blueprint-ai/new" || !activeBlueprintId
            ? item.href
            : `${item.href}?id=${activeBlueprintId}`

          return (
            <Link
              key={item.href}
              href={hrefWithId}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[13px] font-medium ${
                isActive 
                  ? "bg-primary-container/20 text-primary" 
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isActive ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
