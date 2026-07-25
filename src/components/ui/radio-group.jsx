import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, label, id, checked, ...props }, ref) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center space-x-3 rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50/80 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/50 transition-all duration-200 select-none",
        checked && "border-primary bg-primary/[0.02]"
      )}
    >
      <input
        type="radio"
        id={id}
        ref={ref}
        className="sr-only"
        checked={checked}
        {...props}
      />
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 transition-all duration-200",
          checked ? "border-primary bg-primary" : "bg-white"
        )}
      >
        {checked && (
          <div className="h-2.5 w-2.5 rounded-full bg-white" />
        )}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
