import { UserRound } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function ProfilePage() {
  return (
    <PagePlaceholder
      icon={UserRound}
      title="Mi Cuenta"
      description="Aquí podrás editar tu información personal y profesional."
    />
  )
}
