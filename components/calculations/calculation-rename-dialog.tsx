"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, PencilLine } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCalculationTitle } from "@/lib/calculations"
import {
  calculationTitleSchema,
  type CalculationTitleValues,
} from "@/lib/schemas/calculation"

type CalculationRenameDialogProps = {
  calculationId: string
  initialTitle: string
}

export function CalculationRenameDialog({
  calculationId,
  initialTitle,
}: CalculationRenameDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PencilLine className="size-4" />
            Renombrar
          </Button>
        }
      />
      {open ? (
        <RenameCalculationForm
          calculationId={calculationId}
          initialTitle={initialTitle}
          onOpenChange={setOpen}
          onRenamed={() => router.refresh()}
        />
      ) : null}
    </Dialog>
  )
}

type RenameCalculationFormProps = {
  calculationId: string
  initialTitle: string
  onOpenChange: (open: boolean) => void
  onRenamed: () => void
}

function RenameCalculationForm({
  calculationId,
  initialTitle,
  onOpenChange,
  onRenamed,
}: RenameCalculationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  // El formulario se monta solo al abrir el diálogo para tomar el título actual.
  const form = useForm<CalculationTitleValues>({
    resolver: zodResolver(calculationTitleSchema),
    defaultValues: { title: initialTitle },
  })

  const onSubmit = async (values: CalculationTitleValues) => {
    setSubmitError(null)

    const { error } = await updateCalculationTitle(
      calculationId,
      values.title.trim()
    )

    if (error) {
      setSubmitError(error)
      return
    }

    onOpenChange(false)
    onRenamed()
  }

  const { isSubmitting } = form.formState

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Renombrar cálculo</DialogTitle>
        <DialogDescription>
          Actualiza el nombre con el que se muestra y se guarda este cálculo.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="calculation-rename-title">Nombre *</Label>
          <Input
            id="calculation-rename-title"
            placeholder="Cálculo sin título"
            autoFocus
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
