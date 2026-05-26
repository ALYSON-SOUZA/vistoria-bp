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
  Tag,
  Calendar,
  AlertCircle,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  MapPin,
  Layers,
  ChevronRight,
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

interface Ticket {
  id: number
  ticketNumber: string
  description: string | null
  status: string
  createdAt: string
  createdBy: { fullName: string }
}

interface Inspection {
  id: number
  inspectionNumber: string
  type: string
  room: string
  occurrence: string | null
  occurrenceAudio: string | null
  status: string
  createdAt: string
  sessionId: string | null
  portfolio: { name: string } | null
  branch: { name: string } | null
  department: { name: string } | null
  managerRel: { name: string } | null
  directorate: { name: string } | null
  createdBy: { fullName: string; nickname: string | null }
  images: InspectionImage[]
  signature: InspectionSignature | null
  tickets: Ticket[]
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  conforme: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success", bg: "bg-action-success/10" },
  compliant: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success", bg: "bg-action-success/10" },
  pendente: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  pending: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  nao_conforme: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", bg: "bg-action-primary/10" },
  non_compliant: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", bg: "bg-action-primary/10" },
}

const ticketStatusConfig: Record<string, { label: string; icon: any; color: string }> = {
  open: { label: "ABERTO", icon: Clock, color: "text-yellow-500" },
  in_progress: { label: "EM ANDAMENTO", icon: AlertCircle, color: "text-blue-500" },
  resolved: { label: "RESOLVIDO", icon: CheckCircle2, color: "text-action-success" },
  closed: { label: "FECHADO", icon: CheckCircle2, color: "text-muted-foreground" },
}

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInspection()
  }, [params.id])

  async function fetchInspection() {
    try {
      const res = await fetch(`/api/inspections/${params.id}`)
      if (!res.ok) {
        router.push("/inspections")
        return
      }
      const data = await res.json()
      setInspection(data.inspection)
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10" />
          ))}
        </div>
      </div>
    )
  }

  if (!inspection) return null

  const status = statusConfig[inspection.status] || statusConfig.pendente
  const StatusIcon = status.icon

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
          className="flex-1 truncate text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {inspection.inspectionNumber}
        </h1>
        <button
          type="button"
          onClick={() => router.push(`/reports/${inspection.id}`)}
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
          <div className="flex items-center gap-3 border-b p-4">
            <div className={cn("flex size-12 items-center justify-center rounded-xl", status.bg)}>
              <StatusIcon className={cn("size-6", status.color)} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {inspection.inspectionNumber}
              </p>
              <span className={cn("text-xs font-bold", status.color)}>{status.label}</span>
            </div>
          </div>

          <div className="divide-y">
            <DetailRow icon={Tag} label="Tipo" value={inspection.type} />
            <DetailRow icon={Building2} label="Sala" value={inspection.room} />
            <DetailRow icon={Building2} label="Filial" value={inspection.branch?.name || "—"} />
            <DetailRow icon={Briefcase} label="Departamento" value={inspection.department?.name || "—"} />
            <DetailRow icon={FolderOpen} label="Carteira" value={inspection.portfolio?.name || "—"} />
            <DetailRow icon={User} label="Gestor" value={inspection.managerRel?.name || "—"} />
            <DetailRow icon={MapPin} label="Diretoria" value={inspection.directorate?.name || "—"} />
            <DetailRow icon={User} label="Inspetor" value={inspection.createdBy.fullName} />
            <DetailRow icon={Calendar} label="Data" value={formatDate(inspection.createdAt)} />
          </div>
        </motion.div>

        {inspection.occurrence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="size-4 text-action-primary" />
              <span className="text-xs font-bold text-muted-foreground">OCORRÊNCIA</span>
            </div>
            <p className="text-sm text-foreground">{inspection.occurrence}</p>
          </motion.div>
        )}

        {inspection.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4"
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">FOTOS ({inspection.images.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {inspection.images.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Foto ${img.sequenceNumber}`}
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {inspection.sessionId && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/inspections/session/${inspection.sessionId}`)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="size-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Ver Sessão Completa
              </p>
              <p className="text-xs text-muted-foreground">
                Este registro faz parte de uma vistoria com múltiplos registros
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </motion.button>
        )}

        {inspection.signature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <PenLine className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">ASSINATURA</span>
            </div>
            <img
              src={inspection.signature.managerSignature}
              alt="Assinatura"
              className="max-h-20 rounded-lg bg-white"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Assinado em {formatDate(inspection.signature.signedAt)}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <div className="mb-2 flex items-center gap-2 px-1">
            <Ticket className="size-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">
              CHAMADOS ({inspection.tickets.length})
            </span>
          </div>
          {inspection.tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-6 text-center ring-1 ring-foreground/10">
              <Ticket className="size-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Nenhum chamado vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inspection.tickets.map((ticket) => {
                const tStatus = ticketStatusConfig[ticket.status] || ticketStatusConfig.open
                const TIcon = tStatus.icon
                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl bg-card p-3 ring-1 ring-foreground/10"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {ticket.ticketNumber}
                      </span>
                      <span className={cn("flex items-center gap-1 text-[11px] font-bold", tStatus.color)}>
                        <TIcon className="size-3" />
                        {tStatus.label}
                      </span>
                    </div>
                    {ticket.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{ticket.description}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {ticket.createdBy.fullName} — {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/reports/${inspection.id}`)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-action-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-action-primary/30"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <FileText className="size-5" />
          GERAR RELATÓRIO
        </motion.button>
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

function FolderOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}
