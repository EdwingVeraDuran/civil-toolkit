import type { LucideIcon } from "lucide-react"

type PagePlaceholderProps = {
  title: string
  description: string
  icon?: LucideIcon
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
      {Icon ? <Icon className="size-8 text-muted-foreground" /> : null}
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
