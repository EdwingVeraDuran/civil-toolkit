"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  FolderKanban,
  ListTodo,
  MapPin,
  User,
} from "lucide-react"

import { CalculationList } from "@/components/calculations/calculation-list"
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog"
import { ProjectEditDialog } from "@/components/projects/project-edit-dialog"
import { TaskList } from "@/components/tasks/task-list"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Calculation } from "@/lib/types/calculation"
import type { Project, ProjectStatus } from "@/lib/types/project"
import { PROJECT_STATUS_LABELS } from "@/lib/types/project"

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  on_hold: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

type ProjectDetailProps = {
  project: Project
  calculations: Calculation[]
  projects: Project[]
}

export function ProjectDetail({
  project,
  calculations,
  projects,
}: ProjectDetailProps) {
  const router = useRouter()
  const [taskCount, setTaskCount] = useState(0)

  const handleProjectUpdated = useCallback(() => {
    router.refresh()
  }, [router])

  const handleProjectDeleted = useCallback(() => {
    router.push("/proyectos")
  }, [router])

  const handleTasksChanged = useCallback((count: number) => {
    setTaskCount(count)
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/proyectos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Volver a proyectos
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn(STATUS_COLORS[project.status])}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">{project.client_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProjectEditDialog project={project} onProjectUpdated={handleProjectUpdated} />
            <ProjectDeleteDialog
              projectId={project.id}
              projectName={project.name}
              onProjectDeleted={handleProjectDeleted}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">
            <ClipboardList className="size-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="tareas">
            <CheckSquare className="size-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="calculos">
            <FolderKanban className="size-4" />
            Cálculos
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="size-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="detalles">
            <ListTodo className="size-4" />
            Detalles
          </TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="mt-4">
          <div className="flex flex-col gap-6">
            {/* Estadísticas */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="gap-2 py-4">
                <CardContent className="flex flex-col items-center gap-1 pt-0">
                  <FolderKanban className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{calculations.length}</span>
                  <span className="text-xs text-muted-foreground">Cálculos</span>
                </CardContent>
              </Card>
              <Card className="gap-2 py-4">
                <CardContent className="flex flex-col items-center gap-1 pt-0">
                  <FileText className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">0</span>
                  <span className="text-xs text-muted-foreground">Documentos</span>
                </CardContent>
              </Card>
              <Card className="gap-2 py-4">
                <CardContent className="flex flex-col items-center gap-1 pt-0">
                  <CheckSquare className="size-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{taskCount}</span>
                  <span className="text-xs text-muted-foreground">Tareas</span>
                </CardContent>
              </Card>
            </div>

            {/* Info rápida */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <InfoRow icon={User} label="Cliente" value={project.client_name} />
                {project.location && <InfoRow icon={MapPin} label="Ubicación" value={project.location} />}
                {project.start_date && (
                  <InfoRow icon={CalendarDays} label="Inicio" value={formatDateShort(project.start_date)} />
                )}
                {project.estimated_end_date && (
                  <InfoRow
                    icon={CalendarDays}
                    label="Fin estimado"
                    value={formatDateShort(project.estimated_end_date)}
                  />
                )}
                {project.description && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tareas/Entregables */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tareas y entregables</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList
                  projectId={project.id}
                  onTasksChanged={handleTasksChanged}
                  readOnly
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Tareas */}
        <TabsContent value="tareas" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tareas y entregables</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList projectId={project.id} onTasksChanged={handleTasksChanged} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cálculos */}
        <TabsContent value="calculos" className="mt-4">
          <CalculationList calculations={calculations} projects={projects} />
        </TabsContent>

        {/* Tab Documentos */}
        <TabsContent value="documentos" className="mt-4">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-20 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No hay documentos aún</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Los documentos y archivos asociados a este proyecto aparecerán aquí.
            </p>
          </div>
        </TabsContent>

        {/* Tab Detalles */}
        <TabsContent value="detalles" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalles del proyecto</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium">{project.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Cliente</span>
                  <span className="text-sm font-medium">{project.client_name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Estado</span>
                  <Badge variant="secondary" className={cn("w-fit", STATUS_COLORS[project.status])}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Ubicación</span>
                  <span className="text-sm font-medium">{project.location ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Fecha de inicio</span>
                  <span className="text-sm font-medium">
                    {project.start_date ? formatDate(project.start_date) : "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Fecha de fin estimada</span>
                  <span className="text-sm font-medium">
                    {project.estimated_end_date ? formatDate(project.estimated_end_date) : "—"}
                  </span>
                </div>
              </div>

              {project.description && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Descripción</span>
                    <p className="text-sm">{project.description}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Creado</span>
                  <span className="text-sm font-medium">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Última actualización</span>
                  <span className="text-sm font-medium">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
