"use client"

import { useEffect, useState } from "react"
import { Eye, RefreshCw } from "lucide-react"

import { CalculationReport } from "@/components/calculations/calculation-report"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getCalculation } from "@/lib/calculations"
import type { Calculation } from "@/lib/types/calculation"

type CalculationReportDialogProps = {
  calculationId: string
  title: string
  projectName: string
}

export function CalculationReportDialog({
  calculationId,
  title,
  projectName,
}: CalculationReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    void getCalculation(calculationId).then(({ calculation, error }) => {
      if (cancelled) return

      if (error) {
        setError(error)
        setCalculation(null)
      } else {
        setCalculation(calculation ?? null)
        setError(calculation ? null : "No se encontró el cálculo")
      }

      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [open, calculationId, reloadKey])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)

    if (next) {
      setCalculation(null)
      setError(null)
      setIsLoading(true)
    }
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setReloadKey((value) => value + 1)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ver reporte de ${title}`}
          >
            <Eye className="size-4" />
          </Button>
        }
      />

      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Reporte de solo lectura con los datos y resultados guardados.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <ReportSkeleton />
          ) : error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center"
            >
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
            </div>
          ) : calculation ? (
            <CalculationReport
              calculation={calculation}
              projectName={projectName}
            />
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}
