"use client"

import { useMemo, useState } from "react"
import { FolderKanban } from "lucide-react"

import { CalculationItem } from "@/components/calculations/calculation-item"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NO_PROJECT, NO_PROJECT_LABEL } from "@/lib/types/calculation"
import type { CalculationListItem } from "@/lib/types/calculation"
import type { Project } from "@/lib/types/project"

const ALL = "all"

type CalculationListProps = {
  calculations: CalculationListItem[]
  projects: Project[]
  showFilter?: boolean
}

export function CalculationList({
  calculations,
  projects,
  showFilter = false,
}: CalculationListProps) {
  const [projectFilter, setProjectFilter] = useState<string>(ALL)

  const filterItems = useMemo(
    () => [
      { value: ALL, label: "Todos" },
      { value: NO_PROJECT, label: NO_PROJECT_LABEL },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ],
    [projects]
  )

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects]
  )

  const filteredCalculations = useMemo(() => {
    if (!showFilter || projectFilter === ALL) return calculations
    if (projectFilter === NO_PROJECT) {
      return calculations.filter(
        (calculation) => calculation.project_id === null
      )
    }
    return calculations.filter(
      (calculation) => calculation.project_id === projectFilter
    )
  }, [calculations, projectFilter, showFilter])

  if (calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-20 text-center">
        <FolderKanban className="size-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No hay cálculos aún</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Guarda un cálculo desde cualquier herramienta y aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {showFilter && (
        <div className="flex justify-end">
          <div className="w-full max-w-64">
            <Select
              items={filterItems}
              value={projectFilter}
              onValueChange={(next) => {
                if (next) setProjectFilter(next)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredCalculations.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No hay cálculos con este filtro.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCalculations.map((calculation) => (
            <CalculationItem
              key={calculation.id}
              calculation={calculation}
              projectName={
                calculation.project_id
                  ? (projectNames.get(calculation.project_id) ??
                    "Proyecto no disponible")
                  : NO_PROJECT_LABEL
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
