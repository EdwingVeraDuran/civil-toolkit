"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCalculation } from "@/lib/calculations"
import { getProjects } from "@/lib/projects"
import {
  calculationFormSchema,
  type CalculationFormValues,
} from "@/lib/schemas/calculation"
import type { ToolSnapshot } from "@/lib/tools/types"
import { NO_PROJECT, NO_PROJECT_LABEL } from "@/lib/types/calculation"
import type { Project } from "@/lib/types/project"

type SaveCalculationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  toolId: string
  toolName: string
  snapshot: ToolSnapshot | null
  onSaved: () => void
}

export function SaveCalculationDialog({
  open,
  onOpenChange,
  toolId,
  toolName,
  snapshot,
  onSaved,
}: SaveCalculationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SaveCalculationForm
          toolId={toolId}
          toolName={toolName}
          snapshot={snapshot}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      ) : null}
    </Dialog>
  )
}

type SaveCalculationFormProps = {
  toolId: string
  toolName: string
  snapshot: ToolSnapshot | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function SaveCalculationForm({
  toolId,
  toolName,
  snapshot,
  onOpenChange,
  onSaved,
}: SaveCalculationFormProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // El formulario se monta solo cuando el diálogo está abierto, por lo que
  // los valores iniciales se recalculan en cada apertura sin usar efectos.
  const form = useForm<CalculationFormValues>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: {
      title: snapshot?.summary ?? toolName,
      project_id: null,
    },
  })

  useEffect(() => {
    let cancelled = false

    void getProjects().then((data) => {
      if (cancelled) return
      setProjects(data)
      setIsLoadingProjects(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const projectItems = useMemo(
    () => [
      { value: NO_PROJECT, label: NO_PROJECT_LABEL },
      ...projects.map((project) => ({ value: project.id, label: project.name })),
    ],
    [projects],
  )

  const onSubmit = async (values: CalculationFormValues) => {
    if (!snapshot) return

    setSubmitError(null)

    const { error } = await createCalculation({
      tool_id: toolId,
      title: values.title.trim(),
      summary: snapshot.summary,
      inputs: snapshot.inputs,
      result: snapshot.result,
      project_id: values.project_id,
    })

    if (error) {
      setSubmitError(error)
      return
    }

    onOpenChange(false)
    onSaved()
  }

  const { isSubmitting } = form.formState

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Guardar cálculo</DialogTitle>
        <DialogDescription>
          {snapshot
            ? snapshot.summary
            : "Completa los datos de la herramienta para guardar el cálculo."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="calculation-title">Nombre *</Label>
          <Input
            id="calculation-title"
            placeholder="Cálculo sin título"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Proyecto</Label>
          <Controller
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <Select
                items={projectItems}
                value={field.value ?? NO_PROJECT}
                onValueChange={(next) => {
                  if (!next) return
                  field.onChange(next === NO_PROJECT ? null : next)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            {isLoadingProjects
              ? "Cargando proyectos..."
              : "Puedes asociarlo a un proyecto o guardarlo de forma independiente."}
          </p>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !snapshot}>
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
