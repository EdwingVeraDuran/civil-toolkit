"use client"

import { useEffect, useState } from "react"
import { Check, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { updateCalculationFull } from "@/lib/calculations"
import type { ToolSnapshot } from "@/lib/tools/types"

type UpdateCalculationButtonProps = {
  calculationId: string
  title: string
  projectId: string | null
  toolId: string
  snapshot: ToolSnapshot | null
}

export function UpdateCalculationButton({
  calculationId,
  title,
  projectId,
  toolId,
  snapshot,
}: UpdateCalculationButtonProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!updated) return
    const timeout = window.setTimeout(() => setUpdated(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [updated])

  const handleUpdate = async () => {
    if (!snapshot) return

    setError(null)
    setIsUpdating(true)

    const { error: updateError } = await updateCalculationFull(calculationId, {
      title,
      summary: snapshot.summary,
      inputs: snapshot.inputs,
      result: snapshot.result,
      project_id: projectId,
    })

    setIsUpdating(false)

    if (updateError) {
      setError(updateError)
      return
    }

    setUpdated(true)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={!snapshot || isUpdating}
        onClick={handleUpdate}
      >
        {updated ? (
          <>
            <Check className="size-4" />
            Actualizado
          </>
        ) : isUpdating ? (
          <>
            <RefreshCw className="size-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            <RefreshCw className="size-4" />
            Actualizar cálculo
          </>
        )}
      </Button>
    </div>
  )
}
