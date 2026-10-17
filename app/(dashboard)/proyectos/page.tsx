import { FolderKanban } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function ProjectsPage() {
  return (
    <PagePlaceholder
      icon={FolderKanban}
      title="Proyectos"
      description="Aquí encontrarás todos tus proyectos y sus memorias de cálculo asociadas."
    />
  )
}
