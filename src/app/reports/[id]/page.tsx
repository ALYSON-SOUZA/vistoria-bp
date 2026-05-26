"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  FileText,
  Share2,
  Download,
  Building2,
  Tag,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ticket,
  Image as ImageIcon,
  PenLine,
  Briefcase,
  MapPin,
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
  tickets: Ticket[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  conforme: { label: "CONFORME", color: "text-action-success" },
  compliant: { label: "CONFORME", color: "text-action-success" },
  pendente: { label: "PENDENTE", color: "text-yellow-500" },
  pending: { label: "PENDENTE", color: "text-yellow-500" },
  nao_conforme: { label: "NÃO CONFORME", color: "text-action-primary" },
  non_compliant: { label: "NÃO CONFORME", color: "text-action-primary" },
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
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

  async function handleGeneratePdf() {
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("RELATÓRIO DE VISTORIA", pageWidth / 2, y, { align: "center" })
    y += 12

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Nº: ${inspection!.inspectionNumber}`, margin, y)
    y += 6
    doc.text(`Tipo: ${inspection!.type}`, margin, y)
    y += 6
    doc.text(`Sala: ${inspection!.room}`, margin, y)
    y += 6
    doc.text(`Filial: ${inspection!.branch?.name || "—"}`, margin, y)
    y += 6
    doc.text(`Departamento: ${inspection!.department?.name || "—"}`, margin, y)
    y += 6
    doc.text(`Carteira: ${inspection!.portfolio?.name || "—"}`, margin, y)
    y += 6
    doc.text(`Gestor: ${inspection!.managerRel?.name || "—"}`, margin, y)
    y += 6
    doc.text(`Diretoria: ${inspection!.directorate?.name || "—"}`, margin, y)
    y += 6
    doc.text(`Inspetor: ${inspection!.createdBy.fullName}`, margin, y)
    y += 6
    doc.text(`Data: ${formatDate(inspection!.createdAt)}`, margin, y)
    y += 6
    const status = statusConfig[inspection!.status] || statusConfig.pendente
    doc.text(`Status: ${status.label}`, margin, y)
    y += 10

    if (inspection!.occurrence) {
      doc.setFont("helvetica", "bold")
      doc.text("OCORRÊNCIA:", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(inspection!.occurrence, pageWidth - margin * 2)
      doc.text(lines, margin, y)
      y += lines.length * 5 + 6
    }

    if (inspection!.images.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("FOTOS:", margin, y)
      y += 8
      for (const img of inspection!.images) {
        if (y > 270) {
          doc.addPage()
          y = margin
        }
        try {
          const imgData = await fetchImageAsBase64(img.imageUrl)
          const imgProps = doc.getImageProperties(imgData)
          const maxW = pageWidth - margin * 2
          const ratio = maxW / imgProps.width
          const imgH = imgProps.height * ratio
          if (imgH > 60) {
            const r2 = 60 / imgProps.height
            doc.addImage(imgData, "JPEG", margin, y, imgProps.width * r2, 60)
            y += 65
          } else {
            doc.addImage(imgData, "JPEG", margin, y, maxW, imgH)
            y += imgH + 5
          }
        } catch {
          y += 5
        }
      }
    }

    if (inspection!.tickets.length > 0) {
      if (y > 250) {
        doc.addPage()
        y = margin
      }
      doc.setFont("helvetica", "bold")
      doc.text("CHAMADOS VINCULADOS:", margin, y)
      y += 8
      doc.setFont("helvetica", "normal")
      for (const ticket of inspection!.tickets) {
        if (y > 270) {
          doc.addPage()
          y = margin
        }
        doc.text(`${ticket.ticketNumber} - ${ticket.status}`, margin, y)
        y += 5
        if (ticket.description) {
          const descLines = doc.splitTextToSize(ticket.description, pageWidth - margin * 2)
          doc.text(descLines, margin, y)
          y += descLines.length * 5 + 3
        }
      }
    }

    doc.save(`relatorio-${inspection!.inspectionNumber}.pdf`)
  }

  async function fetchImageAsBase64(url: string): Promise<string> {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async function handleShare() {
    if (!inspection) return
    const shareData = {
      title: `Vistoria ${inspection.inspectionNumber}`,
      text: `Relatório de Vistoria ${inspection.inspectionNumber}\nTipo: ${inspection.type}\nSala: ${inspection.room}\nStatus: ${inspection.status}`,
    }
    try {
      await navigator.share(shareData)
    } catch {
      try {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}`
        )
      } catch {
        /* ignore */
      }
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
          Relatório
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Share2 className="size-4" />
        </button>
      </header>

      <div className="px-4 pt-4" ref={reportRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card ring-1 ring-foreground/10"
        >
          <div className="border-b p-4 text-center">
            <p
              className="text-lg font-extrabold text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RELATÓRIO DE VISTORIA
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{inspection.inspectionNumber}</p>
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
            <DetailRow
              icon={inspection.status === "conforme" || inspection.status === "compliant" ? CheckCircle2 : XCircle}
              label="Status"
              value={status.label}
              valueClass={status.color}
            />
          </div>
        </motion.div>

        {inspection.occurrence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="size-4 text-action-primary" />
              <span
                className="text-xs font-bold text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                OCORRÊNCIA
              </span>
            </div>
            <p className="text-sm text-foreground">{inspection.occurrence}</p>
          </motion.div>
        )}

        {(inspection.images.length > 0 || inspection.signature) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4"
          >
            <div className="mb-3 flex items-center gap-2 px-1">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span
                className="text-xs font-bold text-muted-foreground"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                FOTOS E ASSINATURA
              </span>
            </div>

            {/* Miniaturas lado a lado */}
            <div className="flex gap-3">
              {inspection.images.length > 0 && (
                <div className="flex-1 space-y-2">
                  {inspection.images.map((img) => (
                    <div
                      key={img.id}
                      className="overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Foto ${img.sequenceNumber}`}
                        className="w-full object-cover"
                        style={{ maxHeight: 100 }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {inspection.signature && (
                <div className="flex-1 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
                  <div className="mb-1 flex items-center gap-1.5">
                    <PenLine className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">ASSINATURA</span>
                  </div>
                  <img
                    src={inspection.signature.managerSignature}
                    alt="Assinatura"
                    className="max-h-20 rounded-lg bg-white"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(inspection.signature.signedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Fotos grandes abaixo */}
            {inspection.images.length > 0 && (
              <div className="mt-4 space-y-4">
                {inspection.images.map((img) => (
                  <div key={img.id} className="rounded-xl bg-card overflow-hidden ring-1 ring-foreground/10">
                    <img
                      src={img.imageUrl}
                      alt={`Foto ${img.sequenceNumber}`}
                      className="w-full object-contain bg-black/5"
                      style={{ maxHeight: 300 }}
                    />
                    <div className="flex items-center gap-2 px-3 py-2 border-t border-border">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{inspection.room}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {inspection.type === "manutencao" ? "Manutenção" : "Limpeza"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="mb-2 flex items-center gap-2 px-1">
            <Ticket className="size-4 text-muted-foreground" />
            <span
              className="text-xs font-bold text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              CHAMADOS VINCULADOS
            </span>
          </div>
          {inspection.tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-6 text-center ring-1 ring-foreground/10">
              <Ticket className="size-6 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Nenhum chamado vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inspection.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xl bg-card p-3 ring-1 ring-foreground/10"
                >
                  <span
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {ticket.ticketNumber}
                  </span>
                  {ticket.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{ticket.description}</p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {ticket.createdBy.fullName} — {formatDate(ticket.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGeneratePdf}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-action-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-action-primary/30"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Download className="size-5" />
            GERAR PDF
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5 text-sm font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Share2 className="size-5" />
            COMPARTILHAR
          </motion.button>
        </div>
      </div>

      <FloatingNav />
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: any
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <div className="flex-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className={cn("text-sm font-medium text-foreground", valueClass)}>{value}</p>
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
