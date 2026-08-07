import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  containerClassName?: string
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, containerClassName, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("py-24 sm:py-32 relative overflow-hidden", className)}
        {...props}
      >
        <div className={cn("mx-auto max-w-7xl px-6 lg:px-8 relative z-10", containerClassName)}>
          {children}
        </div>
      </section>
    )
  }
)
Section.displayName = "Section"

export { Section }
