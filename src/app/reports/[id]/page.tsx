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
  Plus,
  Trash2,
} from "lucide-react"
import { FloatingNav } from "@/components/floating-nav"
import { cn, formatDate } from "@/lib/utils"
import { toast } from "sonner"

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
  const [externalTickets, setExternalTickets] = useState<string[]>([])

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

  function addExternalTicket() {
    setExternalTickets((prev) => [...prev, ""])
  }

  function updateExternalTicket(index: number, value: string) {
    setExternalTickets((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function removeExternalTicket(index: number) {
    setExternalTickets((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleGeneratePdf() {
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("RELATÓRIO DE VISTORIA", pageWidth / 2, y, { align: "center" })
    y += 10

    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const fields = [
      ["Nº Vistoria:", inspection!.inspectionNumber],
      ["Data:", formatDate(inspection!.createdAt)],
      ["Inspetor:", inspection!.createdBy.fullName],
      ["Filial:", inspection!.branch?.name || "—"],
      ["Sala / Ambiente:", inspection!.room],
      ["Departamento:", inspection!.department?.name || "—"],
      ["Carteira:", inspection!.portfolio?.name || "—"],
      ["Gestor:", inspection!.managerRel?.name || "—"],
      ["Diretoria:", inspection!.directorate?.name || "—"],
    ]
    for (const [label, value] of fields) {
      doc.setFont("helvetica", "bold")
      doc.text(label, margin, y)
      const labelW = doc.getTextWidth(label)
      doc.setFont("helvetica", "normal")
      doc.text(` ${value}`, margin + labelW, y)
      y += 5
    }

    y += 3
    doc.setDrawColor(200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6

    const records = [inspection!]
    for (const rec of records) {
      if (y > 250) {
        doc.addPage()
        y = margin
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(`Tipo: ${rec.type === "manutencao" ? "MANUTENÇÃO" : "LIMPEZA"}`, margin, y)
      y += 6

      if (rec.occurrence) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Ocorrência:", margin, y)
        y += 4
        doc.setFont("helvetica", "normal")
        const lines = doc.splitTextToSize(rec.occurrence, pageWidth - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 4
      }

      if (rec.images.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Fotos:", margin, y)
        y += 5
        const imgSize = 35
        const gap = 3
        const imgsPerRow = Math.floor((pageWidth - margin * 2) / (imgSize + gap))
        let imgX = margin
        for (let i = 0; i < rec.images.length; i++) {
          if (y > 270) {
            doc.addPage()
            y = margin
          }
          try {
            const imgData = await fetchImageAsBase64(rec.images[i].imageUrl)
            doc.addImage(imgData, "JPEG", imgX, y, imgSize, imgSize)
          } catch {}
          imgX += imgSize + gap
          if ((i + 1) % imgsPerRow === 0) {
            y += imgSize + gap
            imgX = margin
          }
        }
        if (imgX !== margin) y += imgSize + gap
      }

      if (rec.signature) {
        if (y > 260) {
          doc.addPage()
          y = margin
        }
        try {
          const sigData = await fetchImageAsBase64(rec.signature.managerSignature)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.text("Assinatura:", margin, y)
          y += 4
          doc.addImage(sigData, "PNG", margin, y, 60, 25)
          y += 30
        } catch {}
      }

      y += 4
    }

    const allTickets = [
      ...inspection!.tickets.map((t) => t.ticketNumber),
      ...externalTickets.filter(Boolean),
    ]
    if (allTickets.length > 0) {
      if (y > 250) {
        doc.addPage()
        y = margin
      }
      doc.setDrawColor(200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("CHAMADOS", margin, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      for (const tn of allTickets) {
        if (y > 270) {
          doc.addPage()
          y = margin
        }
        doc.text(`- ${tn}`, margin, y)
        y += 5
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
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`)
      } catch {}
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
          className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden"
        >
          <div className="border-b p-4 text-center bg-primary/5">
            <p
              className="text-lg font-extrabold text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              RELATÓRIO DE VISTORIA
            </p>
          </div>

          {/* Cabeçalho */}
          <div className="divide-y">
            <HeaderRow icon={FileText} label="Nº Vistoria" value={inspection.inspectionNumber} />
            <HeaderRow icon={Calendar} label="Data" value={formatDate(inspection.createdAt)} />
            <HeaderRow icon={User} label="Inspetor" value={inspection.createdBy.fullName} />
            <HeaderRow icon={Building2} label="Filial" value={inspection.branch?.name || "—"} />
            <HeaderRow icon={MapPin} label="Sala / Ambiente" value={inspection.room} />
            <HeaderRow icon={Briefcase} label="Departamento" value={inspection.department?.name || "—"} />
            <HeaderRow icon={FolderOpen} label="Carteira" value={inspection.portfolio?.name || "—"} />
            <HeaderRow icon={User} label="Gestor" value={inspection.managerRel?.name || "—"} />
            <HeaderRow icon={MapPin} label="Diretoria" value={inspection.directorate?.name || "—"} />
          </div>
        </motion.div>

        {/* Registro da Vistoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-4 rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden"
        >
          <div className="p-4 bg-primary/5 border-b">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-primary" />
              <h3
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                TIPO: {inspection.type === "manutencao" ? "MANUTENÇÃO" : "LIMPEZA"}
              </h3>
            </div>
          </div>

          {inspection.occurrence && (
            <div className="px-4 py-3 border-b">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="size-3.5 text-action-primary" />
                <span className="text-xs font-bold text-muted-foreground">OCORRÊNCIA</span>
              </div>
              <p className="text-sm text-foreground">{inspection.occurrence}</p>
            </div>
          )}

          {inspection.images.length > 0 && (
            <div className="px-4 py-3 border-b">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">FOTOS</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {inspection.images.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Foto ${img.sequenceNumber}`}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {inspection.signature && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <PenLine className="size-3.5 text-muted-foreground" />
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
            </div>
          )}
        </motion.div>

        {/* Chamados Vinculados + Campo externo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-4 rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden"
        >
          <div className="p-4 bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-primary" />
                <h3
                  className="text-sm font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  CHAMADOS
                </h3>
              </div>
              <button
                type="button"
                onClick={addExternalTicket}
                className="flex items-center gap-1 text-xs font-medium text-action-primary"
              >
                <Plus className="size-3.5" />
                Adicionar Nº
              </button>
            </div>
          </div>

          <div className="space-y-2 p-4">
            {inspection.tickets.length === 0 && externalTickets.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhum chamado vinculado
              </p>
            )}

            {inspection.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
              >
                <Ticket className="size-3.5 text-muted-foreground shrink-0" />
                <span
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {ticket.ticketNumber}
                </span>
              </div>
            ))}

            {externalTickets.map((num, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nº do chamado externo"
                  value={num}
                  onChange={(e) => updateExternalTicket(i, e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-xs outline-none ring-0 focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => removeExternalTicket(i)}
                  className="flex size-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
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

function HeaderRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 flex items-baseline gap-2">
        <span className="text-xs text-muted-foreground font-medium">{label}:</span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
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
