import * as React from "react"
import { cn } from "../../lib/utils"

const Label = React.forwardRef(({ className, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-semibold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-0.5",
      className
    )}
    {...props}
  >
    {props.children}
    {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
  </label>
))
Label.displayName = "Label"

export { Label }
