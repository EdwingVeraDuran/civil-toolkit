import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import type { ToolInfo } from "@/lib/tools/types"

type ToolShellProps = {
  info: ToolInfo
  backLink?: { href: string; label: string }
  children: ReactNode
}

export function ToolShell({ info, backLink, children }: ToolShellProps) {
  const Icon = info.icon

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {backLink ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          render={<Link href={backLink.href} />}
        >
          <ArrowLeft className="size-4" />
          {backLink.label}
        </Button>
      ) : null}
      <header className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{info.name}</h1>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          {info.reference ? (
            <p className="text-xs text-muted-foreground/80">{info.reference}</p>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  )
}
