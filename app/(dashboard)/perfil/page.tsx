import { UserRound } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function ProfilePage() {
  return (
    <PagePlaceholder
      icon={UserRound}
      title="Modificar perfil"
      description="Aquí podrás editar tu información personal y profesional."
    />
  )
}
