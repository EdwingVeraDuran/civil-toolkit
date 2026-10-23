"use client"

import { useMemo, useState } from "react"
import { Clock, Search, Star, type LucideIcon } from "lucide-react"

import { ToolCard } from "@/components/tools/tool-card"
import { Input } from "@/components/ui/input"
import { useToolPreferences } from "@/hooks/use-tool-preferences"
import { getToolCategory, toolCategories } from "@/lib/navigation"
import { getToolsByCategory, TOOL_CATALOG } from "@/lib/tools/catalog"
import type { ToolInfo } from "@/lib/tools/types"

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

type ToolSectionProps = {
  id?: string
  icon: LucideIcon
  title: string
  tools: ToolInfo[]
  emptyMessage: string
  favoriteIds: readonly string[]
  onToggleFavorite: (id: string) => void
  showCategory?: boolean
}

function ToolSection({
  id,
  icon: Icon,
  title,
  tools,
  emptyMessage,
  favoriteIds,
  onToggleFavorite,
  showCategory = false,
}: ToolSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {tools.length === 1
              ? "1 herramienta"
              : `${tools.length} herramientas`}
          </p>
        </div>
      </header>

      {tools.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favoriteIds.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
              showCategory={showCategory}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function ToolsExplorer() {
  const [query, setQuery] = useState("")
  const { favorites, recents, toggleFavorite } = useToolPreferences()

  const toolsById = useMemo(
    () => new Map(TOOL_CATALOG.map((tool) => [tool.id, tool])),
    []
  )

  const favoriteTools = useMemo(
    () =>
      favorites
        .map((id) => toolsById.get(id))
        .filter((tool): tool is ToolInfo => Boolean(tool)),
    [favorites, toolsById]
  )

  const recentTools = useMemo(
    () =>
      recents
        .map((id) => toolsById.get(id))
        .filter((tool): tool is ToolInfo => Boolean(tool)),
    [recents, toolsById]
  )

  const normalizedQuery = normalizeSearchText(query.trim())

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return []

    return TOOL_CATALOG.filter((tool) => {
      const category = getToolCategory(tool.category)
      const searchableText = normalizeSearchText(
        `${tool.name} ${tool.description} ${category?.label ?? ""}`
      )

      return searchableText.includes(normalizedQuery)
    })
  }, [normalizedQuery])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Herramientas</h1>
          <p className="text-sm text-muted-foreground">
            Todas las calculadoras y memorias de cálculo, organizadas por
            categoría.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar herramientas…"
            aria-label="Buscar herramientas"
            className="pl-8"
          />
        </div>
      </header>

      {normalizedQuery ? (
        <ToolSection
          icon={Search}
          title="Resultados"
          tools={searchResults}
          emptyMessage={`No encontramos herramientas para “${query.trim()}”.`}
          favoriteIds={favorites}
          onToggleFavorite={toggleFavorite}
          showCategory
        />
      ) : (
        <>
          <ToolSection
            id="favoritas"
            icon={Star}
            title="Favoritas"
            tools={favoriteTools}
            emptyMessage="Toca la estrella de una herramienta para guardarla aquí."
            favoriteIds={favorites}
            onToggleFavorite={toggleFavorite}
            showCategory
          />

          <ToolSection
            id="recientes"
            icon={Clock}
            title="Recientes"
            tools={recentTools}
            emptyMessage="Las herramientas que abras aparecerán aquí automáticamente."
            favoriteIds={favorites}
            onToggleFavorite={toggleFavorite}
            showCategory
          />

          {toolCategories.map((category) => (
            <ToolSection
              key={category.slug}
              id={category.slug}
              icon={category.icon}
              title={category.label}
              tools={getToolsByCategory(category.slug)}
              emptyMessage="Próximamente: todavía no hay herramientas en esta categoría."
              favoriteIds={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </>
      )}
    </div>
  )
}
