import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

export default function CalculationNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Cálculo no encontrado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Puede que el cálculo se haya eliminado o que no tengas permiso para
        verlo.
      </p>
      <Link href="/calculos" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft className="size-4" />
        Volver a cálculos
      </Link>
    </div>
  )
}
