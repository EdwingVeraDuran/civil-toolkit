"use client"

import { useState } from "react"
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
import { createProject } from "@/lib/projects"
import { projectFormSchema, type ProjectFormValues } from "@/lib/schemas/project"
import { PROJECT_STATUS_ITEMS } from "@/lib/types/project"

type ProjectFormProps = {
  onProjectCreated: () => void
}

export function ProjectForm({ onProjectCreated }: ProjectFormProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      client_name: "",
      description: "",
      location: "",
      status: "planning",
      start_date: "",
      estimated_end_date: "",
    },
  })

  const resetForm = () => {
    form.reset()
    setSubmitError(null)
  }

  const onSubmit = async (values: ProjectFormValues) => {
    setSubmitError(null)
    const { error } = await createProject({
      name: values.name.trim(),
      client_name: values.client_name.trim(),
      description: values.description?.trim() || undefined,
      location: values.location?.trim() || undefined,
      status: values.status,
      start_date: values.start_date || undefined,
      estimated_end_date: values.estimated_end_date || undefined,
    })

    if (error) {
      setSubmitError(error)
      return
    }

    setOpen(false)
    resetForm()
    onProjectCreated()
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
      <DialogTrigger render={<Button />}>Nuevo proyecto</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Crea un nuevo proyecto para organizar tus cálculos y memorias.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Edificio Torre Norte" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input id="client" placeholder="Constructora ABC" {...form.register("client_name")} />
              {form.formState.errors.client_name && (
                <p className="text-sm text-destructive">{form.formState.errors.client_name.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" placeholder="Breve descripción del proyecto..." rows={3} {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input id="location" placeholder="Caracas, Venezuela" {...form.register("location")} />
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
              <Label htmlFor="start">Fecha inicio</Label>
              <Input id="start" type="date" {...form.register("start_date")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end">Fecha fin estimada</Label>
              <Input id="end" type="date" {...form.register("estimated_end_date")} />
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
                  Creando...
                </>
              ) : (
                "Crear proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
