import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "mb-1.5 block text-sm font-medium leading-4 select-none peer-disabled:pointer-events-none peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }