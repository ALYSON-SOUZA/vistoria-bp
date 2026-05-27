"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Image as ImageIcon,
  PenLine,
  Building2,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardHat,
  Sparkles,
} from "lucide-react"
import { FloatingNav } from "@/components/floating-nav"
import { cn, formatDate } from "@/lib/utils"

interface InspectionImage {
  id: number
  imageUrl: string
  sequenceNumber: number
}

interface InspectionSignature {
  id: number
  managerSignature: string
  signedAt: string
}

interface Inspection {
  id: number
  inspectionNumber: string
  type: string
  room: string
  occurrence: string | null
  status: string
  createdAt: string
  portfolio: { name: string } | null
  branch: { name: string } | null
  department: { name: string } | null
  managerRel: { name: string } | null
  directorate: { name: string } | null
  createdBy: { fullName: string; nickname: string | null }
  images: InspectionImage[]
  signature: InspectionSignature | null
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  conforme: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success", bg: "bg-action-success/10" },
  compliant: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success", bg: "bg-action-success/10" },
  pendente: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  pending: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  nao_conforme: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", bg: "bg-action-primary/10" },
  non_compliant: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", bg: "bg-action-primary/10" },
}

export default function InspectionSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [params.sessionId])

  async function fetchSession() {
    try {
      const res = await fetch(`/api/inspections/session/${params.sessionId}`)
      if (!res.ok) {
        router.push("/inspections")
        return
      }
      const data = await res.json()
      setInspections(data.inspections || [])
      if (!data.inspections?.length) {
        router.push("/inspections")
      }
    } catch {
      router.push("/inspections")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <div className="size-8 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        </header>
        <div className="space-y-4 px-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10" />
          ))}
        </div>
      </div>
    )
  }

  if (!inspections.length) return null

  const firstInsp = inspections[0]
  const totalRecords = inspections.length

  return (
    <div className="relative min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">Resumo da Vistoria</p>
          <h1 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {totalRecords} registro(s)
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/reports/session/${params.sessionId}`)}
          className="flex size-8 items-center justify-center rounded-full bg-action-primary/10 text-action-primary hover:bg-action-primary/20"
        >
          <FileText className="size-4" />
        </button>
      </header>

      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card ring-1 ring-foreground/10"
        >
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardCheck className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  Sessão de Vistoria
                </p>
                <p className="text-xs text-muted-foreground">{totalRecords} registro(s) realizados</p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            <DetailRow icon={User} label="Vistoriador" value={firstInsp.createdBy.fullName} />
            <DetailRow icon={Calendar} label="Início" value={formatDate(firstInsp.createdAt)} />
            <DetailRow icon={ClipboardCheck} label="Registros" value={`${totalRecords} registro(s)`} />
          </div>
        </motion.div>

        <div className="mt-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground px-1" style={{ fontFamily: "var(--font-heading)" }}>
            REGISTROS DA VISTORIA
          </h2>
          {inspections.map((insp, idx) => {
            const status = statusConfig[insp.status] || statusConfig.pendente
            const StatusIcon = status.icon
            return (
              <motion.div
                key={insp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-xl bg-card overflow-hidden ring-1 ring-foreground/10"
              >
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className={cn("flex size-10 items-center justify-center rounded-lg",
                    insp.type === "limpeza" ? "bg-action-success/10" : "bg-primary/10"
                  )}>
                    {insp.type === "limpeza" ? (
                      <Sparkles className="size-5 text-action-success" />
                    ) : (
                      <HardHat className="size-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                      {insp.inspectionNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {insp.type === "manutencao" ? "Manutenção" : "Limpeza"} — {insp.room}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={cn("size-3.5", status.color)} />
                    <span className={cn("text-[11px] font-bold", status.color)}>{status.label}</span>
                  </div>
                </div>

                {insp.occurrence && (
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold text-muted-foreground">OCORRÊNCIA</span>
                    </div>
                    <p className="text-xs text-foreground">{insp.occurrence}</p>
                  </div>
                )}

                {insp.images.length > 0 && (
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold text-muted-foreground">FOTOS ({insp.images.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {insp.images.map((img) => (
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt={`Foto ${img.sequenceNumber}`}
                          className="h-16 w-16 rounded-lg object-cover ring-1 ring-foreground/10"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {insp.signature && (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <PenLine className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold text-muted-foreground">ASSINATURA</span>
                    </div>
                    <img
                      src={insp.signature.managerSignature}
                      alt="Assinatura"
                      className="max-h-12 rounded-lg bg-white"
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/reports/session/${params.sessionId}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-action-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-action-primary/30"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <FileText className="size-5" />
            GERAR RELATÓRIO
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/inspections/new")}
            className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5 text-sm font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <ClipboardCheck className="size-5" />
            NOVA
          </motion.button>
        </div>
      </div>

      <FloatingNav />
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
