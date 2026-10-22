"use client"

import { useEffect, useState } from "react"
import { Check, Save } from "lucide-react"

import { SaveCalculationDialog } from "@/components/calculations/save-calculation-dialog"
import { Button } from "@/components/ui/button"
import type { ToolSnapshot } from "@/lib/tools/types"

type SaveCalculationButtonProps = {
  toolId: string
  toolName: string
  snapshot: ToolSnapshot | null
}

export function SaveCalculationButton({
  toolId,
  toolName,
  snapshot,
}: SaveCalculationButtonProps) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timeout = window.setTimeout(() => setSaved(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [saved])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!snapshot}
        onClick={() => setOpen(true)}
      >
        {saved ? (
          <>
            <Check className="size-4" />
            Guardado
          </>
        ) : (
          <>
            <Save className="size-4" />
            Guardar cálculo
          </>
        )}
      </Button>
      <SaveCalculationDialog
        open={open}
        onOpenChange={setOpen}
        toolId={toolId}
        toolName={toolName}
        snapshot={snapshot}
        onSaved={() => setSaved(true)}
      />
    </>
  )
}
