import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { ToolPreferencesActions } from "@/components/tools/tool-preferences-actions"
import { Button } from "@/components/ui/button"
import type { EditMode, ToolInfo } from "@/lib/tools/types"

type ToolShellProps = {
  info: ToolInfo
  backLink?: { href: string; label: string }
  editMode?: EditMode
  children: ReactNode
}

export function ToolShell({
  info,
  backLink,
  editMode,
  children,
}: ToolShellProps) {
  const Icon = info.icon

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {backLink ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          render={<Link href={backLink.href} />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          {backLink.label}
        </Button>
      ) : null}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {editMode ? `Editando: ${editMode.title}` : info.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {editMode
                ? "Modifica las entradas y actualiza el cálculo guardado."
                : info.description}
            </p>
            {info.reference ? (
              <p className="text-xs text-muted-foreground/80">
                {info.reference}
              </p>
            ) : null}
          </div>
        </div>
        <ToolPreferencesActions toolId={info.id} />
      </header>
      {children}
    </div>
  )
}
