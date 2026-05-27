"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Share2,
  Download,
  Building2,
  User,
  Calendar,
  HardHat,
  Sparkles,
  PenLine,
  Ticket,
  Plus,
  Trash2,
  QrCode,
  Briefcase,
  MapPin,
  Tag,
  ClipboardCheck,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Link2,
} from "lucide-react"
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

interface TicketItem {
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
  roomManager: { name: string } | null
  createdBy: { fullName: string; nickname: string | null }
  images: InspectionImage[]
  signature: InspectionSignature | null
  tickets: TicketItem[]
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [externalTickets, setExternalTickets] = useState<string[]>([])

  useEffect(() => { fetchInspection() }, [params.id])

  async function fetchInspection() {
    try {
      const res = await fetch(`/api/inspections/${params.id}`)
      if (!res.ok) { router.push("/inspections"); return }
      const data = await res.json()
      setInspection(data.inspection)
    } catch { router.push("/inspections") }
    finally { setLoading(false) }
  }

  function addExternalTicket() { setExternalTickets((p) => [...p, ""]) }
  function updateExternalTicket(i: number, v: string) { setExternalTickets((p) => { const n = [...p]; n[i] = v; return n }) }
  function removeExternalTicket(i: number) { setExternalTickets((p) => p.filter((_, j) => j !== i)) }

  async function handleGeneratePdf() {
    if (!inspection) return
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const m = 15
    let y = m

    const bold = "helvetica"
    const normal = "helvetica"

    // === HEADER BAR ===
    doc.setFillColor(37, 42, 52)
    doc.rect(0, 0, pw, 22, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont(bold, "bold")
    doc.setFontSize(12)
    doc.text("RELATÓRIO DE VISTORIA", pw / 2, 13, { align: "center" })
    doc.setFontSize(7)
    doc.text(inspection.inspectionNumber, pw / 2, 19, { align: "center" })
    y = 28

    // === IDENTITY HEADER ===
    doc.setTextColor(37, 42, 52)
    doc.setFont(bold, "bold")
    doc.setFontSize(16)
    doc.text(inspection.inspectionNumber, pw / 2, y, { align: "center" })
    y += 7

    doc.setFillColor(8, 217, 214)
    doc.setFontSize(7)
    const badgeW = doc.getTextWidth(" CONFORME ") + 6
    doc.roundedRect(pw / 2 - badgeW / 2, y - 2.5, badgeW, 6, 3, 3, "F")
    doc.setTextColor(37, 42, 52)
    doc.setFont(bold, "bold")
    doc.text("CONFORME", pw / 2, y + 1.5, { align: "center" })
    y += 10

    doc.setTextColor(118, 119, 124)
    doc.setFont(normal, "normal")
    doc.setFontSize(7)
    doc.text(`Data: ${formatDate(inspection.createdAt)}   |   Vistoriador: ${inspection.createdBy.fullName}`, pw / 2, y, { align: "center" })
    y += 6

    // === DIVIDER ===
    doc.setDrawColor(198, 198, 204)
    doc.line(m, y, pw - m, y)
    y += 6

    // === INFO GRID (2 col) ===
    const infoFields = [
      ["Sala / Ambiente", inspection.room],
      ["Filial", inspection.branch?.name || "—"],
      ["Carteira", inspection.portfolio?.name || "—"],
      ["Departamento", inspection.department?.name || "—"],
      ["Gestor", inspection.managerRel?.name || "—"],
      ["Gestor da Sala", inspection.roomManager?.name || "—"],
      ["Diretoria", inspection.directorate?.name || "—"],
    ]

    const cw = (pw - m * 2 - 4) / 2
    for (let i = 0; i < infoFields.length; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      const cx = m + col * (cw + 4)
      const cy = y + row * 14

      doc.setFillColor(242, 244, 247)
      doc.roundedRect(cx, cy, cw, 12, 2, 2, "F")
      doc.setDrawColor(8, 217, 214)
      doc.setLineWidth(0.6)
      doc.line(cx, cy, cx, cy + 12)

      doc.setTextColor(118, 119, 124)
      doc.setFont(bold, "bold")
      doc.setFontSize(6)
      doc.text(infoFields[i][0].toUpperCase(), cx + 3, cy + 4)

      doc.setTextColor(37, 42, 52)
      doc.setFont(bold, "bold")
      doc.setFontSize(8)
      const val = infoFields[i][1]
      doc.text(val.length > 22 ? val.substring(0, 21) + "..." : val, cx + 3, cy + 10)
    }
    y += 4 * 14 + 4

    // === OCORRÊNCIA ===
    if (inspection.occurrence) {
      doc.setFillColor(37, 42, 52)
      doc.roundedRect(m, y, pw - m * 2, 18, 3, 3, "F")
      doc.setTextColor(97, 244, 253)
      doc.setFont(bold, "bold")
      doc.setFontSize(8)
      doc.text("OCORRÊNCIA", m + 4, y + 5)
      doc.setTextColor(149, 155, 170)
      doc.setFont(normal, "normal")
      doc.setFontSize(7)
      const lines = doc.splitTextToSize(inspection.occurrence, pw - m * 2 - 8)
      const maxLines = 2
      const short = lines.slice(0, maxLines)
      doc.text(short, m + 4, y + 12)
      y += 22
    }

    // === TIPO + FOTOS ===
    doc.setDrawColor(8, 217, 214)
    doc.setLineWidth(0.6)
    doc.line(m, y, m, y + 10)
    doc.setTextColor(37, 42, 52)
    doc.setFont(bold, "bold")
    doc.setFontSize(10)
    doc.text(inspection.type === "manutencao" ? "MANUTENÇÃO" : "LIMPEZA", m + 5, y + 4)
    y += 12

    if (inspection.images.length > 0) {
      const s = 28, g = 2
      const perRow = Math.floor((pw - m * 2) / (s + g))
      let x = m
      for (let i = 0; i < Math.min(inspection.images.length, 6); i++) {
        if (y > 275) { doc.addPage(); y = m }
        try {
          const d = await fetchImageAsBase64(inspection.images[i].imageUrl)
          doc.addImage(d, "JPEG", x, y, s, s)
        } catch {}
        x += s + g
        if ((i + 1) % perRow === 0) { y += s + g; x = m }
      }
      if (x !== m) y += s + g
    }

    // === ASSINATURA ===
    if (inspection.signature) {
      if (y > 270) { doc.addPage(); y = m }
      try {
        const sd = await fetchImageAsBase64(inspection.signature.managerSignature)
        doc.setFillColor(248, 248, 248)
        doc.roundedRect(m, y, pw - m * 2, 25, 3, 3, "F")
        doc.setDrawColor(198, 198, 204)
        doc.setLineWidth(0.3)
        doc.roundedRect(m, y, pw - m * 2, 25, 3, 3, "S")
        doc.setTextColor(37, 42, 52)
        doc.setFont(bold, "bold")
        doc.setFontSize(8)
        doc.text("Vistoria Assinada", m + 4, y + 6)
        doc.addImage(sd, "PNG", m + 4, y + 9, 35, 13)
        doc.setTextColor(118, 119, 124)
        doc.setFont(normal, "normal")
        doc.setFontSize(6)
        doc.text("Documento validado digitalmente", m + 44, y + 10)
        doc.text("via biometria e certificação BP.", m + 44, y + 15)
        y += 29
      } catch {}
    }

    // === CHAMADOS ===
    const allTickets = [...inspection.tickets.map((t) => t.ticketNumber), ...externalTickets.filter(Boolean)]
    if (allTickets.length > 0) {
      if (y > 270) { doc.addPage(); y = m }
      doc.setDrawColor(198, 198, 204)
      doc.line(m, y, pw - m, y)
      y += 5
      doc.setTextColor(37, 42, 52)
      doc.setFont(bold, "bold")
      doc.setFontSize(10)
      doc.text("Chamados Vinculados", m, y)
      y += 6
      doc.setFont(normal, "normal")
      doc.setFontSize(7)
      for (const tn of allTickets) {
        if (y > 280) { doc.addPage(); y = m }
        doc.text(`- ${tn}`, m, y)
        y += 4
      }
    }

    doc.save(`relatorio-${inspection.inspectionNumber}.pdf`)
  }

  async function fetchImageAsBase64(url: string): Promise<string> {
    const r = await fetch(url)
    const b = await r.blob()
    return new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onloadend = () => res(fr.result as string)
      fr.onerror = rej
      fr.readAsDataURL(b)
    })
  }

  async function handleShare() {
    if (!inspection) return
    try { await navigator.share({ title: `Vistoria ${inspection.inspectionNumber}`, text: `Relatório de Vistoria ${inspection.inspectionNumber}\nTipo: ${inspection.type}\nSala: ${inspection.room}` }) }
    catch { try { await navigator.clipboard.writeText(`Vistoria ${inspection.inspectionNumber}\nTipo: ${inspection.type}\nSala: ${inspection.room}`) } catch {} }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] pb-24">
        <header className="bg-[#252A34] text-white flex items-center gap-3 px-4 py-3 shadow-lg">
          <div className="size-8 animate-pulse rounded-full bg-white/20" />
          <div className="h-5 w-40 animate-pulse rounded bg-white/20" />
        </header>
        <div className="space-y-4 p-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-black/5" />)}</div>
      </div>
    )
  }

  if (!inspection) return null

  return (
    <div className="relative min-h-screen bg-[#F7F9FC] pb-32">
      {/* Header */}
      <header className="bg-[#252A34] text-white sticky top-0 z-40 flex items-center px-4 py-3 shadow-lg">
        <button type="button" onClick={() => router.back()} className="mr-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest opacity-70">Vistoria de Campo</p>
          <h1 className="text-lg font-bold">Relatório</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 pt-5">
        {/* Identity Header */}
        <section>
          <div className="text-center mb-3">
            <h2 className="text-2xl font-black text-[#252A34] tracking-tight">{inspection.inspectionNumber}</h2>
            <span className={cn(
              "inline-flex items-center gap-1 mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              inspection.status === "conforme" || inspection.status === "compliant"
                ? "bg-[#08D9D6]/10 text-[#08D9D6] border border-[#08D9D6]/30"
                : "bg-[#FF2E63]/10 text-[#FF2E63] border border-[#FF2E63]/30"
            )}>
              <CheckCircle2 className="size-3.5" />
              {inspection.status === "conforme" || inspection.status === "compliant" ? "Conforme" : "Não Conforme"}
            </span>
            <p className="text-xs text-[#76777c] mt-2">
              {formatDate(inspection.createdAt)} &mdash; {inspection.createdBy.fullName}
            </p>
          </div>
          <hr className="border-[#c6c6cc]/50" />
        </section>

        {/* Info Grid */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Sala / Ambiente", inspection.room, Building2],
              ["Filial", inspection.branch?.name || "—", MapPin],
              ["Carteira", inspection.portfolio?.name || "—", Briefcase],
              ["Departamento", inspection.department?.name || "—", Building2],
              ["Gestor", inspection.managerRel?.name || "—", User],
              ["Gestor da Sala", inspection.roomManager?.name || "—", User],
              ["Diretoria", inspection.directorate?.name || "—", MapPin],
            ].map(([label, value, Icon], i) => (
              <div key={i} className="bg-[#F2F4F7] rounded-lg p-3 border-l-4 border-[#08D9D6] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#76777c] mb-1">{label as string}</p>
                <p className="text-sm font-bold text-[#252A34]">{value as string}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Occurrence */}
        {inspection.occurrence && (
          <section className="bg-[#252A34] rounded-lg p-4 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-[#61F4FD]" />
                <h3 className="text-sm font-bold text-[#61F4FD]">Ocorrência</h3>
              </div>
              <p className="text-xs text-[#959BAA] leading-relaxed">{inspection.occurrence}</p>
            </div>
            <div className="absolute right-0 top-0 w-32 h-full opacity-5 pointer-events-none">
              <svg className="w-full h-full text-white fill-current" viewBox="0 0 100 100">
                <path d="M0 0 L100 100 M20 0 L100 80 M40 0 L100 60" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </section>
        )}

        {/* Type + Photos */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-8 bg-[#08D9D6] rounded-full" />
            <h3 className="text-base font-bold text-[#252A34]">
              {inspection.type === "manutencao" ? "Manutenção" : "Limpeza"}
            </h3>
          </div>

          {inspection.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {inspection.images.slice(0, 8).map((img) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt=""
                  className="aspect-square rounded-lg object-cover border border-[#c6c6cc]/30"
                />
              ))}
            </div>
          )}
        </section>

        {/* Signature */}
        {inspection.signature && (
          <section className="bg-white rounded-lg p-4 flex items-center gap-4 border border-[#c6c6cc]/20 shadow-sm">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#08D9D6] text-[#252A34] shadow-lg rotate-3">
              <PenLine className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#252A34]">Vistoria Assinada</h3>
              <p className="text-xs text-[#76777c]">Documento validado digitalmente via biometria e certificação BP.</p>
              <img src={inspection.signature.managerSignature} alt="Assinatura" className="mt-2 max-h-10 rounded border border-[#c6c6cc]/30 bg-white" />
            </div>
          </section>
        )}

        {/* Tickets */}
        <section className="bg-white rounded-lg p-4 shadow-sm border border-[#c6c6cc]/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-[#252A34]" />
              <h3 className="text-sm font-bold text-[#252A34]">Chamados Vinculados</h3>
            </div>
            <button type="button" onClick={addExternalTicket} className="flex items-center gap-1 rounded-full bg-[#252A34] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm active:scale-95 transition-transform">
              <Plus className="size-3" />
              Adicionar Nº
            </button>
          </div>

          <div className="space-y-2">
            {inspection.tickets.length === 0 && externalTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 opacity-60">
                <Link2 className="size-6 text-[#76777c] mb-1" />
                <p className="text-xs text-[#76777c]">Nenhum chamado vinculado</p>
              </div>
            )}

            {inspection.tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-3 rounded-lg bg-[#F2F4F7] p-3 border border-[#c6c6cc]/20">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-[#FF2E63]/10">
                  <Ticket className="size-4 text-[#FF2E63]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#252A34]">#{ticket.ticketNumber}</p>
                  <p className="text-[10px] text-[#76777c]">{ticket.status}</p>
                </div>
              </div>
            ))}

            {externalTickets.map((num, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nº do chamado externo"
                  value={num}
                  onChange={(e) => updateExternalTicket(i, e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-[#c6c6cc] bg-white px-3 text-xs outline-none focus:border-[#08D9D6] focus:ring-2 focus:ring-[#08D9D6]/20"
                />
                <button type="button" onClick={() => removeExternalTicket(i)} className="flex size-8 items-center justify-center rounded-full text-[#FF2E63] hover:bg-[#FF2E63]/10">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#c6c6cc]/20 p-4 z-50">
        <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
          <button
            onClick={handleGeneratePdf}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#FF2E63] py-3.5 text-sm font-bold text-white shadow-lg active:scale-95 transition-all"
          >
            <Download className="size-4" />
            GERAR PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#08D9D6] py-3.5 text-sm font-bold text-[#252A34] shadow-lg active:scale-95 transition-all"
          >
            <Share2 className="size-4" />
            COMPARTILHAR
          </button>
        </div>
      </div>

    </div>
  )
}
