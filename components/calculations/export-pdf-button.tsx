"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ExportPdfButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="print:hidden"
      title="Se abrirá el diálogo de impresión; elige «Guardar como PDF»"
      onClick={() => window.print()}
    >
      <Printer className="size-4" />
      Exportar PDF
    </Button>
  )
}
