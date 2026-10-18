import { notFound } from "next/navigation"

import { ToolRenderer } from "@/components/tools/tool-renderer"
import { ToolShell } from "@/components/tools/tool-shell"
import { getToolCategory } from "@/lib/navigation"
import { getToolInfo } from "@/lib/tools/catalog"

export default async function ToolPage({
  params,
}: {
  params: Promise<{ categoria: string; toolId: string }>
}) {
  const { categoria, toolId } = await params
  const category = getToolCategory(categoria)
  const tool = getToolInfo(toolId)

  if (!category || !tool || tool.category !== categoria) {
    notFound()
  }

  return (
    <ToolShell
      info={tool}
      backLink={{ href: `/herramientas/${categoria}`, label: `Volver a ${category.label}` }}
    >
      <ToolRenderer toolId={tool.id} />
    </ToolShell>
  )
}
