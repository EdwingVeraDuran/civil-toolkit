import { notFound } from "next/navigation"

import { ToolRenderer } from "@/components/tools/tool-renderer"
import { ToolShell } from "@/components/tools/tool-shell"
import { getCalculationById } from "@/lib/calculations-server"
import { getToolCategory } from "@/lib/navigation"
import { getToolInfo } from "@/lib/tools/catalog"

export default async function ToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ toolId: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { toolId } = await params
  const { edit } = await searchParams
  const tool = getToolInfo(toolId)

  if (!tool) {
    notFound()
  }

  const calculation = edit ? await getCalculationById(edit) : null

  if (edit && !calculation) {
    notFound()
  }

  if (edit && calculation && calculation.tool_id !== toolId) {
    notFound()
  }

  const category = getToolCategory(tool.category)

  return (
    <ToolShell
      info={tool}
      backLink={{
        href: edit ? "/calculos" : `/herramientas#${tool.category}`,
        label: edit
          ? "Volver a cálculos"
          : category
            ? `Volver a ${category.label}`
            : "Volver a Herramientas",
      }}
      editMode={
        calculation
          ? {
              calculationId: calculation.id,
              title: calculation.title,
              projectId: calculation.project_id,
            }
          : undefined
      }
    >
      <ToolRenderer
        toolId={tool.id}
        initialInput={calculation?.inputs}
        editMode={
          calculation
            ? {
                calculationId: calculation.id,
                title: calculation.title,
                projectId: calculation.project_id,
              }
            : undefined
        }
      />
    </ToolShell>
  )
}
