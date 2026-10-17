"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FolderKanban, Search } from "lucide-react"

import { ProjectCard } from "@/components/projects/project-card"
import { ProjectForm } from "@/components/projects/project-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getProjects } from "@/lib/projects"
import type { Project } from "@/lib/types/project"
import { PROJECT_STATUS_ITEMS } from "@/lib/types/project"

const ALL = "all"

const FILTER_ITEMS = [
  { value: ALL, label: "Todos" },
  ...PROJECT_STATUS_ITEMS,
]

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(ALL)

  useEffect(() => {
    let cancelled = false
    void getProjects().then((data) => {
      if (!cancelled) {
        setProjects(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshProjects = useCallback(async () => {
    const data = await getProjects()
    setProjects(data)
  }, [])

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(search.toLowerCase()))

      const matchesStatus = statusFilter === ALL || p.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select items={FILTER_ITEMS} value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ProjectForm onProjectCreated={refreshProjects} />
        </div>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <FolderKanban className="size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {projects.length === 0 ? "No hay proyectos aún" : "Sin resultados"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {projects.length === 0
              ? "Crea tu primer proyecto para empezar a organizar tus cálculos."
              : "No se encontraron proyectos con esos filtros."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
