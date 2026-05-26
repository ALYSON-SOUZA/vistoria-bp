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
  User,
  Calendar,
  HardHat,
  Sparkles,
  PenLine,
  Image as ImageIcon,
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

export default function ReportSessionPage() {
  const params = useParams()
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedImage, setExpandedImage] = useState<{ url: string; room: string; type: string } | null>(null)

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

  async function handleGeneratePdf() {
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("RELATÓRIO DE VISTORIA", pageWidth / 2, y, { align: "center" })
    y += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Inspetor: ${inspections[0].createdBy.fullName}`, margin, y)
    y += 6
    doc.text(`Data: ${formatDate(inspections[0].createdAt)}`, margin, y)
    y += 6
    doc.text(`Total de Registros: ${inspections.length}`, margin, y)
    y += 10

    for (const insp of inspections) {
      if (y > 250) {
        doc.addPage()
        y = margin
      }
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(`${insp.inspectionNumber} - ${insp.type === "manutencao" ? "Manutenção" : "Limpeza"} - ${insp.room}`, margin, y)
      y += 7

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`Filial: ${insp.branch?.name || "—"}`, margin + 5, y)
      y += 5
      doc.text(`Departamento: ${insp.department?.name || "—"}`, margin + 5, y)
      y += 5
      doc.text(`Ocorrência: ${insp.occurrence || "—"}`, margin + 5, y)
      y += 7

      if (insp.images.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("Fotos:", margin + 5, y)
        y += 6
        for (const img of insp.images) {
          if (y > 260) {
            doc.addPage()
            y = margin
          }
          try {
            const imgData = await fetchImageAsBase64(img.imageUrl)
            const imgProps = doc.getImageProperties(imgData)
            const maxW = (pageWidth - margin * 2) * 0.4
            const ratio = maxW / imgProps.width
            const imgH = imgProps.height * ratio
            if (imgH > 50) {
              const r2 = 50 / imgProps.height
              doc.addImage(imgData, "JPEG", margin + 5, y, imgProps.width * r2, 50)
              y += 55
            } else {
              doc.addImage(imgData, "JPEG", margin + 5, y, maxW, imgH)
              y += imgH + 5
            }
          } catch {
            y += 5
          }
        }
      }

      if (insp.signature) {
        if (y > 260) {
          doc.addPage()
          y = margin
        }
        try {
          const sigData = await fetchImageAsBase64(insp.signature.managerSignature)
          doc.addImage(sigData, "PNG", margin + 5, y, 60, 20)
          y += 25
        } catch {
          y += 5
        }
      }

      y += 5
    }

    doc.save(`relatorio-sessao.pdf`)
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
    const shareData = {
      title: "Relatório de Vistoria",
      text: `Relatório de Vistoria\nInspetor: ${inspections[0]?.createdBy.fullName}\nRegistros: ${inspections.length}`,
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
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10" />
          ))}
        </div>
      </div>
    )
  }

  if (!inspections.length) return null

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
            <p className="mt-1 text-xs text-muted-foreground">
              {inspections.length} registro(s) — {inspections[0].createdBy.fullName}
            </p>
          </div>

          <div className="divide-y">
            <DetailRow icon={User} label="Inspetor" value={inspections[0].createdBy.fullName} />
            <DetailRow icon={Calendar} label="Data" value={formatDate(inspections[0].createdAt)} />
            <DetailRow icon={FileText} label="Total de Registros" value={String(inspections.length)} />
          </div>
        </motion.div>

        {/* Tabela de registros */}
        <div className="mt-6 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              REGISTROS DA VISTORIA
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Nº</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Sala</th>
                  <th className="px-4 py-2 font-medium">Fotos</th>
                  <th className="px-4 py-2 font-medium">Assinatura</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{insp.inspectionNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {insp.type === "limpeza" ? (
                          <Sparkles className="size-3.5 text-action-success" />
                        ) : (
                          <HardHat className="size-3.5 text-primary" />
                        )}
                        <span className="text-xs text-foreground">
                          {insp.type === "manutencao" ? "Manutenção" : "Limpeza"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">{insp.room}</td>
                    <td className="px-4 py-3">
                      {insp.images.length > 0 ? (
                        <div className="flex gap-1">
                          {insp.images.map((img) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setExpandedImage({ url: img.imageUrl, room: insp.room, type: insp.type })}
                            >
                              <img
                                src={img.imageUrl}
                                alt=""
                                className="h-10 w-10 rounded object-cover ring-1 ring-foreground/10"
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {insp.signature ? (
                        <img
                          src={insp.signature.managerSignature}
                          alt="Assinatura"
                          className="h-8 rounded bg-white object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-action-success">CONFORME</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Imagens ampliadas no final */}
        {inspections.some((i) => i.images.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <div className="mb-3 flex items-center gap-2 px-1">
              <ImageIcon className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">GALERIA DE IMAGENS</span>
            </div>
            <div className="space-y-4">
              {inspections.map((insp) =>
                insp.images.length > 0 ? (
                  <div key={insp.id} className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
                    <p className="mb-2 text-xs font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                      {insp.room} — {insp.type === "manutencao" ? "Manutenção" : "Limpeza"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {insp.images.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setExpandedImage({ url: img.imageUrl, room: insp.room, type: insp.type })}
                          className="aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
                        >
                          <img
                            src={img.imageUrl}
                            alt=""
                            className="size-full object-cover transition-transform hover:scale-105"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </motion.div>
        )}

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

      {/* Modal de imagem expandida */}
      {expandedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setExpandedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-lg"
          >
            <img
              src={expandedImage.url}
              alt=""
              className="max-h-[80vh] w-auto rounded-xl"
            />
            <p className="mt-2 text-center text-sm font-bold text-white">
              {expandedImage.room} — {expandedImage.type === "manutencao" ? "Manutenção" : "Limpeza"}
            </p>
          </motion.div>
        </motion.div>
      )}

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
