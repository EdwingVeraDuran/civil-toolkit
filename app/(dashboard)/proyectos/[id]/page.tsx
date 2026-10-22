import { notFound } from "next/navigation"

import { ProjectDetail } from "@/components/projects/project-detail"
import { getCalculationsByProject } from "@/lib/calculations-server"
import { getAllProjects, getProjectById } from "@/lib/projects-server"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const [calculations, projects] = await Promise.all([
    getCalculationsByProject(id),
    getAllProjects(),
  ])

  return (
    <ProjectDetail
      project={project}
      calculations={calculations}
      projects={projects}
    />
  )
}
