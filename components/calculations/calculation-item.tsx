import Link from "next/link"
import { ChevronRight, FolderKanban } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format/date"
import { getToolInfo } from "@/lib/tools/catalog"
import type { CalculationListItem } from "@/lib/types/calculation"

type CalculationItemProps = {
  calculation: CalculationListItem
  projectName: string
}

export function CalculationItem({
  calculation,
  projectName,
}: CalculationItemProps) {
  const tool = getToolInfo(calculation.tool_id)
  const toolName = tool?.name ?? calculation.tool_id

  return (
    <Card className="group relative h-full gap-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base leading-snug">
              <Link
                href={`/calculos/${calculation.id}`}
                className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {calculation.title}
              </Link>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{toolName}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(calculation.created_at)}
              </span>
            </div>
          </div>
          <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {calculation.summary}
        </p>
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <FolderKanban className="size-3.5 shrink-0" />
          <span className="truncate">{projectName}</span>
        </p>
      </CardContent>
    </Card>
  )
}
