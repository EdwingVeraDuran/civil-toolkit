import { notFound } from "next/navigation"

import { CalculationDetail } from "@/components/calculations/calculation-detail"
import { getCalculationById } from "@/lib/calculations-server"
import { getAllProjects } from "@/lib/projects-server"

export default async function CalculationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [calculation, projects] = await Promise.all([
    getCalculationById(id),
    getAllProjects(),
  ])

  if (!calculation) {
    notFound()
  }

  return <CalculationDetail calculation={calculation} projects={projects} />
}
