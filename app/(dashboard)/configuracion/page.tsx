import { Settings } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Settings}
      title="Configuración"
      description="Aquí podrás configurar la aplicación y tu perfil."
    />
  )
}
