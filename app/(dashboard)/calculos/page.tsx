import { Calculator } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"

export default function CalculosPage() {
  return (
    <PagePlaceholder
      icon={Calculator}
      title="Cálculos"
      description="Aquí encontrarás todos tus cálculos y memorias de cálculo guardados."
    />
  )
}