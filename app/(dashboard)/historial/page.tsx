import { History } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function HistorialPage() {
  return (
    <PagePlaceholder
      icon={History}
      title="Historial"
      description="Aquí encontrarás el historial de tus acciones y cambios en la aplicación."
    />
  )
}