"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Settings } from "lucide-react"

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-action-primary" />
          <h1 className="font-headline-sm" style={{ fontFamily: "var(--font-heading)" }}>
            {title || "Administração"}
          </h1>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
