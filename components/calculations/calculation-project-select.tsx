"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCalculationProject } from "@/lib/calculations"
import { NO_PROJECT, NO_PROJECT_LABEL } from "@/lib/types/calculation"
import type { Project } from "@/lib/types/project"

type CalculationProjectSelectProps = {
  calculationId: string
  initialProjectId: string | null
  projects: Project[]
}

export function CalculationProjectSelect({
  calculationId,
  initialProjectId,
  projects,
}: CalculationProjectSelectProps) {
  const router = useRouter()
  const [projectId, setProjectId] = useState(initialProjectId)
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = useMemo(
    () => [
      { value: NO_PROJECT, label: NO_PROJECT_LABEL },
      ...projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    ],
    [projects]
  )

  const handleChange = async (next: string | null) => {
    if (!next) return

    const nextProjectId = next === NO_PROJECT ? null : next
    if (nextProjectId === projectId) return

    const previousProjectId = projectId
    setError(null)
    setProjectId(nextProjectId)
    setIsMoving(true)

    const { error: updateError } = await updateCalculationProject(
      calculationId,
      nextProjectId
    )

    setIsMoving(false)
    if (updateError) {
      setProjectId(previousProjectId)
      setError(updateError)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:max-w-72">
      <div className="flex items-center gap-2">
        <div className="w-full">
          <Select
            items={items}
            value={projectId ?? NO_PROJECT}
            onValueChange={handleChange}
            disabled={isMoving}
          >
            <SelectTrigger className="w-full" aria-label="Proyecto asignado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isMoving && (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
