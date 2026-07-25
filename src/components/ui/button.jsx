import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-custom text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        {
          "bg-primary text-white hover:bg-primary-hover hover:shadow-md": variant === "default",
          "bg-secondary text-primary hover:bg-secondary-hover hover:shadow-md": variant === "secondary",
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50": variant === "outline",
          "bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary-gray",
          "text-primary hover:underline underline-offset-4": variant === "link",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-custom px-3 text-xs": size === "sm",
          "h-12 rounded-custom px-8 text-base": size === "lg",
          "h-14 rounded-custom px-10 text-lg": size === "xl",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
