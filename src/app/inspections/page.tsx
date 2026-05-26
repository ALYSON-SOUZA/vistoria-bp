"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ClipboardCheck, Plus, Search, Filter } from "lucide-react"
import { FloatingNav } from "@/components/floating-nav"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

interface Inspection {
  id: number
  inspectionNumber: string
  type: string
  room: string
  status: string
  createdAt: string
  createdBy?: { fullName: string }
  portfolio?: { name: string }
  branch?: { name: string } | null
  department?: { name: string } | null
  managerRel?: { name: string } | null
  directorate?: { name: string } | null
}

const statusStyles: Record<string, string> = {
  conforme: "border-l-action-success",
  compliant: "border-l-action-success",
  pendente: "border-l-yellow-500",
  pending: "border-l-yellow-500",
  nao_conforme: "border-l-action-primary",
  non_compliant: "border-l-action-primary",
}

export default function InspectionsPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInspections()
  }, [])

  async function fetchInspections() {
    try {
      const res = await fetch("/api/inspections")
      if (res.ok) {
        const data = await res.json()
        setInspections(data.inspections || data || [])
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const filtered = inspections.filter(
    (i) =>
      i.inspectionNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.room.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1
          className="flex-1 text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Vistorias
        </h1>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Filter className="size-5" />
        </button>
      </header>

      <div className="px-4 pt-4">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por número ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card py-16 text-center ring-1 ring-foreground/10">
            <ClipboardCheck className="size-12 text-muted-foreground/30" />
            <div>
              <p
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nenhuma vistoria encontrada
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search ? "Tente outro termo de busca" : "Crie sua primeira vistoria"}
              </p>
            </div>
            {!search && (
              <button
                type="button"
                onClick={() => router.push("/inspections/new")}
                className="mt-2 flex items-center gap-1.5 rounded-full bg-action-primary px-5 py-2 text-xs font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Plus className="size-4" />
                NOVA VISTORIA
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inspection, i) => (
              <motion.div
                key={inspection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/inspections/${inspection.id}`)}
                className={cn(
                  "cursor-pointer rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-ring",
                  statusStyles[inspection.status] || "border-l-4 border-l-transparent"
                )}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm font-bold text-foreground"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {inspection.inspectionNumber}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        inspection.type === "limpeza"
                          ? "bg-action-success/10 text-action-success"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {inspection.type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {inspection.room}
                    {inspection.portfolio ? ` — ${inspection.portfolio.name}` : ""}
                    {inspection.branch ? ` • ${inspection.branch.name}` : ""}
                    {inspection.managerRel ? ` • ${inspection.managerRel.name}` : ""}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatDate(inspection.createdAt)}</span>
                    <span>{inspection.createdBy?.fullName || "—"}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/inspections/new")}
        className="fixed right-6 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-action-primary text-white shadow-lg shadow-action-primary/40 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="size-6" />
      </button>

      <FloatingNav />
    </div>
  )
}
