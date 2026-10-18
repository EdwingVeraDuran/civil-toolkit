import Link from "next/link"
import { notFound } from "next/navigation"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getToolCategory } from "@/lib/navigation"
import { getToolsByCategory } from "@/lib/tools/catalog"

export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const category = getToolCategory(categoria)

  if (!category) {
    notFound()
  }

  const CategoryIcon = category.icon
  const tools = getToolsByCategory(categoria)

  if (tools.length === 0) {
    return (
      <PagePlaceholder
        icon={CategoryIcon}
        title={category.label}
        description={`Aquí encontrarás las memorias de cálculo y calculadoras de la categoría ${category.label.toLowerCase()}.`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CategoryIcon className="size-5" />
        </span>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{category.label}</h1>
          <p className="text-sm text-muted-foreground">
            {tools.length === 1
              ? "1 herramienta disponible"
              : `${tools.length} herramientas disponibles`}
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const ToolIcon = tool.icon
          return (
            <Link key={tool.id} href={`/herramientas/${categoria}/${tool.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
                <CardHeader>
                  {ToolIcon ? (
                    <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ToolIcon className="size-4.5" />
                    </span>
                  ) : null}
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
