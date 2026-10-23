"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getToolCategory } from "@/lib/navigation"
import type { ToolInfo } from "@/lib/tools/types"

type ToolCardProps = {
  tool: ToolInfo
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  showCategory?: boolean
}

export function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
  showCategory = false,
}: ToolCardProps) {
  const Icon = tool.icon
  const category = getToolCategory(tool.category)

  return (
    <Card className="relative h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {Icon ? (
            <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </span>
          ) : (
            <span />
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative z-10 -mt-1 -mr-1 text-muted-foreground hover:text-foreground"
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Quitar ${tool.name} de favoritas`
                : `Añadir ${tool.name} a favoritas`
            }
            onClick={() => onToggleFavorite(tool.id)}
          >
            <Star
              className={cn(
                "size-4",
                isFavorite && "fill-current text-amber-500"
              )}
            />
          </Button>
        </div>
        <CardTitle className="text-base">
          <Link
            href={`/herramientas/${tool.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {tool.name}
          </Link>
        </CardTitle>
        <CardDescription>{tool.description}</CardDescription>
        {showCategory && category ? (
          <Badge variant="secondary" className="mt-1 w-fit">
            {category.label}
          </Badge>
        ) : null}
      </CardHeader>
    </Card>
  )
}
