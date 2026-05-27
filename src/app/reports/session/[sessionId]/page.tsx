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
  ClipboardCheck,
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
}

export default function ReportSessionPage() {
  const params = useParams()
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedImage, setExpandedImage] = useState<{ url: string; room: string; type: string } | null>(null)
  const [externalTickets, setExternalTickets] = useState<string[]>([])

  useEffect(() => { fetchSession() }, [params.sessionId])

  async function fetchSession() {
    try {
      const res = await fetch(`/api/inspections/session/${params.sessionId}`)
      if (!res.ok) { router.push("/inspections"); return }
      const data = await res.json()
      setInspections(data.inspections || [])
      if (!data.inspections?.length) router.push("/inspections")
    } catch { router.push("/inspections") }
    finally { setLoading(false) }
  }

  function addExternalTicket() { setExternalTickets((p) => [...p, ""]) }
  function updateExternalTicket(i: number, v: string) { setExternalTickets((p) => { const n = [...p]; n[i] = v; return n }) }
  function removeExternalTicket(i: number) { setExternalTickets((p) => p.filter((_, j) => j !== i)) }

  async function handleGeneratePdf() {
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("p", "mm", "a4")
    const pw = doc.internal.pageSize.getWidth()
    const m = 15
    let y = m

    const first = inspections[0]

    doc.setFillColor(37, 42, 52)
    doc.rect(0, 0, pw, 22, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("RELATÓRIO DE VISTORIA", pw / 2, 13, { align: "center" })
    doc.setFontSize(7)
    doc.text(`${inspections.length} registro(s)`, pw / 2, 19, { align: "center" })
    y = 28

    doc.setTextColor(37, 42, 52)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text(first.inspectionNumber, pw / 2, y, { align: "center" })
    y += 7

    doc.setTextColor(118, 119, 124)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.text(`Data: ${formatDate(first.createdAt)}   |   Vistoriador: ${first.createdBy.fullName}   |   ${inspections.length} registro(s)`, pw / 2, y, { align: "center" })
    y += 6

    doc.setDrawColor(198, 198, 204)
    doc.line(m, y, pw - m, y)
    y += 6

    const infoFields = [
      ["Sala / Ambiente", first.room],
      ["Filial", first.branch?.name || "—"],
      ["Carteira", first.portfolio?.name || "—"],
      ["Departamento", first.department?.name || "—"],
      ["Gestor", first.managerRel?.name || "—"],
      ["Gestor da Sala", first.roomManager?.name || "—"],
      ["Diretoria", first.directorate?.name || "—"],
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
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6)
      doc.text(infoFields[i][0].toUpperCase(), cx + 3, cy + 4)
      doc.setTextColor(37, 42, 52)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.text(infoFields[i][1].length > 22 ? infoFields[i][1].substring(0, 21) + "..." : infoFields[i][1], cx + 3, cy + 10)
    }
    y += 4 * 14 + 4

    for (const insp of inspections) {
      if (y > 265) { doc.addPage(); y = m }

      if (insp.occurrence) {
        doc.setFillColor(37, 42, 52)
        doc.roundedRect(m, y, pw - m * 2, 16, 3, 3, "F")
        doc.setTextColor(97, 244, 253)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7)
        doc.text("OCORRÊNCIA", m + 4, y + 4)
        doc.setTextColor(149, 155, 170)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(6)
        const lines = doc.splitTextToSize(insp.occurrence, pw - m * 2 - 8)
        doc.text(lines.slice(0, 2), m + 4, y + 10)
        y += Math.min(lines.length, 2) * 3 + 18
      }

      doc.setDrawColor(8, 217, 214)
      doc.setLineWidth(0.6)
      doc.line(m, y, m, y + 8)
      doc.setTextColor(37, 42, 52)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text(insp.type === "manutencao" ? "MANUTENÇÃO" : "LIMPEZA", m + 5, y + 3)
      y += 10

      if (insp.images.length > 0) {
        const s = 24, g = 2
        const perRow = Math.floor((pw - m * 2) / (s + g))
        let x = m
        for (let i = 0; i < Math.min(insp.images.length, 4); i++) {
          if (y > 275) { doc.addPage(); y = m }
          try {
            const d = await fetchImageAsBase64(insp.images[i].imageUrl)
            doc.addImage(d, "JPEG", x, y, s, s)
          } catch {}
          x += s + g
          if ((i + 1) % perRow === 0) { y += s + g; x = m }
        }
        if (x !== m) y += s + g
      }

      if (insp.signature) {
        if (y > 275) { doc.addPage(); y = m }
        try {
          const sd = await fetchImageAsBase64(insp.signature.managerSignature)
          doc.setFillColor(248, 248, 248)
          doc.roundedRect(m, y, pw - m * 2, 22, 3, 3, "F")
          doc.setDrawColor(198, 198, 204)
          doc.setLineWidth(0.3)
          doc.roundedRect(m, y, pw - m * 2, 22, 3, 3, "S")
          doc.setTextColor(37, 42, 52)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(7)
          doc.text("Vistoria Assinada", m + 4, y + 5)
          doc.addImage(sd, "PNG", m + 4, y + 8, 30, 11)
          doc.setTextColor(118, 119, 124)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(5)
          doc.text("Documento validado digitalmente", m + 38, y + 8)
          doc.text("via biometria e certificação BP.", m + 38, y + 12)
          y += 26
        } catch {}
      }
      y += 3
    }

    const allTickets = [...externalTickets.filter(Boolean)]
    if (allTickets.length > 0) {
      if (y > 270) { doc.addPage(); y = m }
      doc.setDrawColor(198, 198, 204)
      doc.line(m, y, pw - m, y)
      y += 5
      doc.setTextColor(37, 42, 52)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("Chamados Vinculados", m, y)
      y += 6
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      for (const tn of allTickets) {
        if (y > 280) { doc.addPage(); y = m }
        doc.text(`- ${tn}`, m, y)
        y += 4
      }
    }

    doc.save("relatorio-sessao.pdf")
  }

  async function fetchImageAsBase64(url: string): Promise<string> {
    const r = await fetch(url); const b = await r.blob()
    return new Promise((res, rej) => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = rej; fr.readAsDataURL(b) })
  }

  async function handleShare() {
    try { await navigator.share({ title: "Relatório de Vistoria", text: `Relatório de Vistoria\nVistoriador: ${inspections[0]?.createdBy.fullName}\nRegistros: ${inspections.length}` }) }
    catch { try { await navigator.clipboard.writeText(`Relatório de Vistoria\nVistoriador: ${inspections[0]?.createdBy.fullName}\nRegistros: ${inspections.length}`) } catch {} }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] pb-32">
        <header className="bg-[#252A34] text-white flex items-center px-4 py-3 shadow-lg">
          <div className="size-8 animate-pulse rounded-full bg-white/20" />
          <div className="ml-3 h-5 w-40 animate-pulse rounded bg-white/20" />
        </header>
        <div className="space-y-4 p-4">{[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-white ring-1 ring-black/5" />)}</div>
      </div>
    )
  }

  if (!inspections.length) return null

  const first = inspections[0]

  return (
    <div className="relative min-h-screen bg-[#F7F9FC] pb-32">
      <header className="bg-[#252A34] text-white sticky top-0 z-40 flex items-center px-4 py-3 shadow-lg">
        <button type="button" onClick={() => router.back()} className="mr-3 hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest opacity-70">Vistoria de Campo</p>
          <h1 className="text-lg font-bold">Relatório &mdash; {inspections.length} registro(s)</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 pt-5">
        {/* Identity Header */}
        <section>
          <div className="text-center mb-3">
            <h2 className="text-2xl font-black text-[#252A34] tracking-tight">{first.inspectionNumber}</h2>
            <p className="text-xs text-[#76777c] mt-2">
              {formatDate(first.createdAt)} &mdash; {first.createdBy.fullName} &mdash; {inspections.length} registro(s)
            </p>
          </div>
          <hr className="border-[#c6c6cc]/50" />
        </section>

        {/* Info Grid */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Sala / Ambiente", first.room],
              ["Filial", first.branch?.name || "—"],
              ["Carteira", first.portfolio?.name || "—"],
              ["Departamento", first.department?.name || "—"],
              ["Gestor", first.managerRel?.name || "—"],
              ["Gestor da Sala", first.roomManager?.name || "—"],
              ["Diretoria", first.directorate?.name || "—"],
            ].map(([label, value], i) => (
              <div key={i} className="bg-[#F2F4F7] rounded-lg p-3 border-l-4 border-[#08D9D6] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#76777c] mb-1">{label as string}</p>
                <p className="text-sm font-bold text-[#252A34]">{value as string}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inspections */}
        <div className="space-y-4">
          {inspections.map((insp, idx) => (
            <section key={insp.id}>
              {/* Occurrence */}
              {insp.occurrence && (
                <div className="bg-[#252A34] rounded-lg p-4 mb-3 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="size-4 text-[#61F4FD]" />
                      <h3 className="text-sm font-bold text-[#61F4FD]">Ocorrência</h3>
                    </div>
                    <p className="text-xs text-[#959BAA] leading-relaxed">{insp.occurrence}</p>
                  </div>
                  <div className="absolute right-0 top-0 w-32 h-full opacity-5 pointer-events-none">
                    <svg className="w-full h-full text-white fill-current" viewBox="0 0 100 100">
                      <path d="M0 0 L100 100 M20 0 L100 80 M40 0 L100 60" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Type */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-1 h-8 rounded-full",
                  insp.status === "conforme" || insp.status === "compliant"
                    ? "bg-[#08D9D6]" : "bg-[#FF2E63]"
                )} />
                <div className="flex-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    insp.status === "conforme" || insp.status === "compliant"
                      ? "bg-[#08D9D6]/10 text-[#08D9D6] border border-[#08D9D6]/30"
                      : "bg-[#FF2E63]/10 text-[#FF2E63] border border-[#FF2E63]/30"
                  )}>
                    <CheckCircle2 className="size-3" />
                    {insp.status === "conforme" || insp.status === "compliant" ? "Conforme" : "Não Conforme"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#252A34]">
                  {insp.type === "manutencao" ? "Manutenção" : "Limpeza"}
                </h3>
              </div>

              {/* Photos */}
              {insp.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {insp.images.slice(0, 8).map((img) => (
                    <button key={img.id} type="button" onClick={() => setExpandedImage({ url: img.imageUrl, room: insp.room, type: insp.type })}>
                      <img src={img.imageUrl} alt="" className="aspect-square rounded-lg object-cover border border-[#c6c6cc]/30 transition-transform hover:scale-105" />
                    </button>
                  ))}
                </div>
              )}

              {/* Signature */}
              {insp.signature && (
                <div className="bg-white rounded-lg p-4 flex items-center gap-4 border border-[#c6c6cc]/20 shadow-sm">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#08D9D6] text-[#252A34] shadow-lg rotate-3">
                    <PenLine className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#252A34]">Vistoria Assinada</h3>
                    <p className="text-xs text-[#76777c]">Documento validado digitalmente via biometria e certificação BP.</p>
                    <img src={insp.signature.managerSignature} alt="Assinatura" className="mt-2 max-h-10 rounded border border-[#c6c6cc]/30 bg-white" />
                  </div>
                </div>
              )}

              {idx < inspections.length - 1 && <hr className="my-4 border-[#c6c6cc]/30" />}
            </section>
          ))}
        </div>

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
            {externalTickets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 opacity-60">
                <Link2 className="size-6 text-[#76777c] mb-1" />
                <p className="text-xs text-[#76777c]">Nenhum chamado vinculado</p>
              </div>
            )}
            {externalTickets.map((num, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text" placeholder="Nº do chamado externo" value={num}
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

      {expandedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setExpandedImage(null)}
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative max-w-lg">
            <img src={expandedImage.url} alt="" className="max-h-[80vh] w-auto rounded-xl" />
            <p className="mt-2 text-center text-sm font-bold text-white">
              {expandedImage.room} &mdash; {expandedImage.type === "manutencao" ? "Manutenção" : "Limpeza"}
            </p>
          </motion.div>
        </motion.div>
      )}

    </div>
  )
}
