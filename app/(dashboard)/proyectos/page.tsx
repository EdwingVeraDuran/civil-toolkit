import { ProjectsList } from "@/components/projects/projects-list"
import { getAllProjects } from "@/lib/projects-server"

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return <ProjectsList projects={projects} />
}
