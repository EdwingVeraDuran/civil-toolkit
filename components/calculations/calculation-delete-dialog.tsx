"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteCalculation } from "@/lib/calculations"

type CalculationDeleteDialogProps = {
  calculationId: string
  calculationTitle: string
}

export function CalculationDeleteDialog({
  calculationId,
  calculationTitle,
}: CalculationDeleteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) setError(null)
  }

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)
    const { error: deleteError } = await deleteCalculation(calculationId)
    setIsDeleting(false)

    if (deleteError) {
      setError(deleteError)
      return
    }

    setOpen(false)
    router.replace("/calculos")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar cálculo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar{" "}
            <strong>{calculationTitle}</strong>? Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
