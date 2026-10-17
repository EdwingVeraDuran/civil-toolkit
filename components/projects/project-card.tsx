import { CalendarDays, MapPin, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
    month: "short",
    year: "numeric",
  })
}

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="gap-4 transition-shadow hover:shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
          <Badge
            variant="secondary"
            className={cn("shrink-0", STATUS_COLORS[project.status])}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="size-3.5" />
          {project.client_name}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {project.location && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {project.location}
          </p>
        )}
        {(project.start_date || project.estimated_end_date) && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {project.start_date && project.estimated_end_date
              ? `${formatDate(project.start_date)} – ${formatDate(project.estimated_end_date)}`
              : project.start_date
                ? `Desde ${formatDate(project.start_date)}`
                : `Hasta ${formatDate(project.estimated_end_date!)}`}
          </p>
        )}
        {project.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
