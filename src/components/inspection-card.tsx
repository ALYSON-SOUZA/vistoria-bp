"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn, formatDate } from "@/lib/utils"

interface InspectionCardProps {
  inspection: {
    id: number
    inspectionNumber: string
    type: string
    room: string
    status: string
    createdAt: string | Date
    portfolio?: { name: string } | null
    managerRel?: { name: string } | null
    createdBy?: { fullName: string } | null
  }
  index?: number
}

const statusBorder: Record<string, string> = {
  conforme: "border-l-action-success",
  compliant: "border-l-action-success",
  pendente: "border-l-yellow-500",
  pending: "border-l-yellow-500",
  nao_conforme: "border-l-action-primary",
  non_compliant: "border-l-action-primary",
}

const statusLabel: Record<string, string> = {
  conforme: "CONFORME",
  compliant: "CONFORME",
  pendente: "PENDENTE",
  pending: "PENDENTE",
  nao_conforme: "NÃO CONFORME",
  non_compliant: "NÃO CONFORME",
}

export function InspectionCard({ inspection, index = 0 }: InspectionCardProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/inspections/${inspection.id}`)}
      className={cn(
        "cursor-pointer rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-ring",
        "border-l-4",
        statusBorder[inspection.status] || "border-l-transparent"
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
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{formatDate(inspection.createdAt)}</span>
          <span>{inspection.createdBy?.fullName || "—"}</span>
        </div>
      </div>
    </motion.div>
  )
}
