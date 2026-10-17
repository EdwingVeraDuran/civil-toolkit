import { notFound } from "next/navigation"

import { PagePlaceholder } from "@/components/page-placeholder"
import { getToolCategory } from "@/lib/navigation"

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

  return (
    <PagePlaceholder
      icon={CategoryIcon}
      title={category.label}
      description={`Aquí encontrarás las memorias de cálculo y calculadoras de la categoría ${category.label.toLowerCase()}.`}
    />
  )
}
