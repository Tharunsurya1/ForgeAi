"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BlueprintSidebar() {
  const pathname = usePathname()

  const modules = [
    { label: "New Blueprint", href: "/dashboard/blueprint-ai/new", icon: "add_circle" },
    { label: "Requirements", href: "/dashboard/blueprint-ai/requirements", icon: "format_list_bulleted" },
    { label: "User Stories", href: "/dashboard/blueprint-ai/user-stories", icon: "auto_stories" },
    { label: "Functional Requirements", href: "/dashboard/blueprint-ai/functional-requirements", icon: "rule" },
    { label: "Non-Functional Requirements", href: "/dashboard/blueprint-ai/non-functional-requirements", icon: "fact_check" },
    { label: "Software Architecture", href: "/dashboard/blueprint-ai/software-architecture", icon: "account_tree" },
    { label: "Database Design", href: "/dashboard/blueprint-ai/database-design", icon: "database" },
    { label: "ER Diagram", href: "/dashboard/blueprint-ai/er-diagram", icon: "schema" },
    { label: "API Documentation", href: "/dashboard/blueprint-ai/api-documentation", icon: "api" },
    { label: "Frontend Architecture", href: "/dashboard/blueprint-ai/frontend-architecture", icon: "web" },
    { label: "Backend Architecture", href: "/dashboard/blueprint-ai/backend-architecture", icon: "memory" },
    { label: "Folder Structure", href: "/dashboard/blueprint-ai/folder-structure", icon: "folder" },
    { label: "Deployment Plan", href: "/dashboard/blueprint-ai/deployment-plan", icon: "cloud" },
    { label: "DevOps & CI/CD", href: "/dashboard/blueprint-ai/devops", icon: "all_inclusive" },
    { label: "Security Recommendations", href: "/dashboard/blueprint-ai/security", icon: "security" },
    { label: "Cost Estimation", href: "/dashboard/blueprint-ai/cost-estimation", icon: "attach_money" },
    { label: "Testing Strategy", href: "/dashboard/blueprint-ai/testing", icon: "bug_report" },
    { label: "Documentation", href: "/dashboard/blueprint-ai/documentation", icon: "description" },
    { label: "Blueprint Summary", href: "/dashboard/blueprint-ai/summary", icon: "summarize" },
  ]

  return (
    <aside className="w-64 border-r border-outline-variant/30 bg-surface/50 hidden md:flex flex-col h-full overflow-y-auto shrink-0 relative z-10 custom-scrollbar">
      <div className="p-4 border-b border-outline-variant/30 sticky top-0 bg-surface/90 backdrop-blur z-20">
        <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">memory</span>
          Blueprint AI
        </h3>
      </div>
      <nav className="p-2 flex flex-col gap-0.5">
        {modules.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
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
