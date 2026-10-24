import Link from "next/link"
import { ArrowLeft, CalendarDays, FolderKanban, Pencil } from "lucide-react"

import { CalculationDeleteDialog } from "@/components/calculations/calculation-delete-dialog"
import { CalculationProjectSelect } from "@/components/calculations/calculation-project-select"
import { CalculationReport } from "@/components/calculations/calculation-report"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DATE_LONG_OPTIONS, formatDate } from "@/lib/format/date"
import { getToolInfo } from "@/lib/tools/catalog"
import { cn } from "@/lib/utils"
import type { Calculation } from "@/lib/types/calculation"
import type { Project } from "@/lib/types/project"

type CalculationDetailProps = {
  calculation: Calculation
  projects: Project[]
}

export function CalculationDetail({
  calculation,
  projects,
}: CalculationDetailProps) {
  const tool = getToolInfo(calculation.tool_id)
  const toolName = tool?.name ?? calculation.tool_id

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/calculos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a cálculos
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{calculation.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{toolName}</Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>
                Creado el{" "}
                {formatDate(calculation.created_at, DATE_LONG_OPTIONS)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Actualizado el{" "}
                {formatDate(calculation.updated_at, DATE_LONG_OPTIONS)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tool ? (
              <Link
                href={`/herramientas/${calculation.tool_id}?edit=${calculation.id}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Pencil className="size-4" />
                Editar
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "pointer-events-none opacity-50"
                )}
                aria-disabled="true"
                title="Herramienta no disponible"
              >
                <Pencil className="size-4" />
                Editar
              </span>
            )}
            <CalculationDeleteDialog
              calculationId={calculation.id}
              calculationTitle={calculation.title}
            />
          </div>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              <FolderKanban className="size-4 text-muted-foreground" />
              Proyecto
            </p>
            <p className="text-sm text-muted-foreground">
              Asigna este cálculo a un proyecto para organizarlo.
            </p>
          </div>
          <CalculationProjectSelect
            calculationId={calculation.id}
            initialProjectId={calculation.project_id}
            projects={projects}
          />
        </div>
      </Card>

      <Card>
        <CardContent>
          <CalculationReport calculation={calculation} />
        </CardContent>
      </Card>
    </div>
  )
}
