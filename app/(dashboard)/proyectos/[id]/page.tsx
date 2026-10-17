import { notFound } from "next/navigation"

import { ProjectDetail } from "@/components/projects/project-detail"
import { getProjectById } from "@/lib/projects-server"

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

  return <ProjectDetail project={project} />
}
