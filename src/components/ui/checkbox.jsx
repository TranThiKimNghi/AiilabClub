import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef(({ className, label, id, checked, ...props }, ref) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center space-x-3 rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50/80 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/50 transition-all duration-200 select-none",
        checked && "border-primary bg-primary/[0.02]"
      )}
    >
      <input
        type="checkbox"
        id={id}
        ref={ref}
        className="sr-only"
        checked={checked}
        {...props}
      />
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-slate-300 transition-all duration-200",
          checked ? "border-primary bg-primary text-white" : "bg-white"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
