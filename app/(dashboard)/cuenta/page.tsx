import { CircleUser } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function AccountPage() {
  return (
    <PagePlaceholder
      icon={CircleUser}
      title="Configuración de cuenta"
      description="Aquí podrás gestionar tu cuenta, seguridad y preferencias."
    />
  )
}
