"use client"

import { useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { useToolPreferences } from "@/hooks/use-tool-preferences"
import { recordRecentTool } from "@/lib/tools/preferences"

export function ToolPreferencesActions({ toolId }: { toolId: string }) {
  const { isFavorite, toggleFavorite } = useToolPreferences()
  const favorite = isFavorite(toolId)

  useEffect(() => {
    recordRecentTool(toolId)
  }, [toolId])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={favorite}
      aria-label={favorite ? "Quitar de favoritas" : "Añadir a favoritas"}
      onClick={() => toggleFavorite(toolId)}
    >
      <Star
        className={cn("size-4", favorite && "fill-current text-amber-500")}
      />
    </Button>
  )
}
