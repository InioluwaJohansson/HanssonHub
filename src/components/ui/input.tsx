import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative w-full group">
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          "h-9 w-full min-w-0 bg-transparent px-0 py-1 text-base outline-none transition-all placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "border-b-2 border-t-0 border-l-0 border-r-0 border-border rounded-none focus:ring-0 focus:border-border",
          className
        )}
        {...props}
      />
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 ease-in-out group-focus-within:w-full" />
    </div>
  )
}

export { Input }
