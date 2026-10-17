"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateProject } from "@/lib/projects"
import { projectFormSchema, type ProjectFormValues } from "@/lib/schemas/project"
import type { Project } from "@/lib/types/project"
import { PROJECT_STATUS_ITEMS } from "@/lib/types/project"

type ProjectEditDialogProps = {
  project: Project
  onProjectUpdated: () => void
}

export function ProjectEditDialog({ project, onProjectUpdated }: ProjectEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      client_name: project.client_name,
      description: project.description ?? "",
      location: project.location ?? "",
      status: project.status,
      start_date: project.start_date ?? "",
      estimated_end_date: project.estimated_end_date ?? "",
    },
  })

  const resetForm = () => {
    form.reset({
      name: project.name,
      client_name: project.client_name,
      description: project.description ?? "",
      location: project.location ?? "",
      status: project.status,
      start_date: project.start_date ?? "",
      estimated_end_date: project.estimated_end_date ?? "",
    })
    setSubmitError(null)
  }

  const onSubmit = async (values: ProjectFormValues) => {
    setSubmitError(null)
    const { error } = await updateProject(project.id, {
      name: values.name.trim(),
      client_name: values.client_name.trim(),
      description: values.description?.trim() || null,
      location: values.location?.trim() || null,
      status: values.status,
      start_date: values.start_date || null,
      estimated_end_date: values.estimated_end_date || null,
    })

    if (error) {
      setSubmitError(error)
      return
    }

    setOpen(false)
    onProjectUpdated()
  }

  const { isSubmitting } = form.formState

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />
            Editar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar proyecto</DialogTitle>
          <DialogDescription>
            Actualiza la información del proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input id="edit-name" placeholder="Edificio Torre Norte" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-client">Cliente *</Label>
              <Input id="edit-client" placeholder="Constructora ABC" {...form.register("client_name")} />
              {form.formState.errors.client_name && (
                <p className="text-sm text-destructive">{form.formState.errors.client_name.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea id="edit-description" placeholder="Breve descripción del proyecto..." rows={3} {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-location">Ubicación</Label>
            <Input id="edit-location" placeholder="Caracas, Venezuela" {...form.register("location")} />
            {form.formState.errors.location && (
              <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label>Estado</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select items={PROJECT_STATUS_ITEMS} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUS_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-start">Fecha inicio</Label>
              <Input id="edit-start" type="date" {...form.register("start_date")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-end">Fecha fin estimada</Label>
              <Input id="edit-end" type="date" {...form.register("estimated_end_date")} />
              {form.formState.errors.estimated_end_date && (
                <p className="text-sm text-destructive">{form.formState.errors.estimated_end_date.message}</p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
