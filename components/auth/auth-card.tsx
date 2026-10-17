import { HardHat } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

type AuthCardProps = {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/20" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <HardHat className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Civil Toolkit</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Herramientas para ingeniería civil
          </p>
        </div>
        <Card className="border shadow-sm">
          <CardContent className="px-6 py-8">
            <div className="mb-6 space-y-1 text-center">
              <h2 className="text-balance text-lg font-semibold tracking-tight">{title}</h2>
              {description && (
                <p className="text-pretty text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}