"use client"

import { useMemo, useState } from "react"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteCalculation, updateCalculationProject } from "@/lib/calculations"
import { getToolInfo } from "@/lib/tools/catalog"
import { NO_PROJECT, NO_PROJECT_LABEL } from "@/lib/types/calculation"
import type { Calculation } from "@/lib/types/calculation"
import type { Project } from "@/lib/types/project"

type CalculationItemProps = {
  calculation: Calculation
  projects: Project[]
  onChanged: () => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function CalculationItem({
  calculation,
  projects,
  onChanged,
}: CalculationItemProps) {
  const [currentProjectId, setCurrentProjectId] = useState(
    calculation.project_id
  )
  const [isMoving, setIsMoving] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const tool = getToolInfo(calculation.tool_id)
  const toolName = tool?.name ?? calculation.tool_id

  const projectItems = useMemo(
    () => [
      { value: NO_PROJECT, label: NO_PROJECT_LABEL },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ],
    [projects]
  )

  const handleMove = async (next: string | null) => {
    if (!next) return

    const projectId = next === NO_PROJECT ? null : next
    if (projectId === currentProjectId) return

    const previousProjectId = currentProjectId
    setMoveError(null)
    setCurrentProjectId(projectId)
    setIsMoving(true)

    const { error } = await updateCalculationProject(calculation.id, projectId)

    setIsMoving(false)
    if (error) {
      setCurrentProjectId(previousProjectId)
      setMoveError(error)
      return
    }

    onChanged()
  }

  const handleDelete = async () => {
    setDeleteError(null)
    setIsDeleting(true)
    const { error } = await deleteCalculation(calculation.id)
    setIsDeleting(false)

    if (error) {
      setDeleteError(error)
      return
    }

    setDeleteOpen(false)
    onChanged()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base">{calculation.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{toolName}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(calculation.created_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {tool ? (
              <Button
                variant="ghost"
                size="icon-sm"
                render={
                  <Link
                    href={`/herramientas/${calculation.tool_id}?edit=${calculation.id}`}
                    aria-label={`Editar ${calculation.title}`}
                  />
                }
                nativeButton={false}
              >
                <Pencil className="size-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                disabled
                aria-label={`Editar ${calculation.title}`}
              >
                <Pencil className="size-4" />
              </Button>
            )}

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${calculation.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Eliminar cálculo</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que quieres eliminar{" "}
                    <strong>{calculation.title}</strong>? Esta acción no se
                    puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                {deleteError && (
                  <p className="text-sm text-destructive">{deleteError}</p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{calculation.summary}</p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Proyecto</span>
          <div className="w-full max-w-64">
            <Select
              items={projectItems}
              value={currentProjectId ?? NO_PROJECT}
              onValueChange={handleMove}
              disabled={isMoving}
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
          </div>
          {isMoving && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {moveError && <p className="text-sm text-destructive">{moveError}</p>}
      </CardContent>
    </Card>
  )
}
