import { CalculationList } from "@/components/calculations/calculation-list"
import { getAllCalculations } from "@/lib/calculations-server"
import { getAllProjects } from "@/lib/projects-server"

export default async function CalculosPage() {
  const [calculations, projects] = await Promise.all([
    getAllCalculations(),
    getAllProjects(),
  ])

  return (
    <CalculationList
      calculations={calculations}
      projects={projects}
      showFilter
    />
  )
}
