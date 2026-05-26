"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Ticket,
  Search,
  Plus,
  CalendarDays,
  FileText,
  Mic,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Building2,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { FloatingNav } from "@/components/floating-nav"
import { toast } from "sonner"
import { cn, generateTicketNumber, formatDate } from "@/lib/utils"

interface Inspection {
  id: number
  inspectionNumber: string
  room: string
  type: string
  portfolio?: { name: string }
  managerRel?: { name: string } | null
}

interface TicketItem {
  id: number
  ticketNumber: string
  description?: string
  expectedCompletionDate?: string
  status: string
  createdAt: string
  inspection?: { id: number; inspectionNumber: string; room: string }
  createdBy?: { fullName: string }
}

const statusMap: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  open: { label: "ABERTO", icon: Clock, color: "text-blue-500" },
  in_progress: { label: "EM ANDAMENTO", icon: Clock, color: "text-yellow-500" },
  resolved: { label: "RESOLVIDO", icon: CheckCircle2, color: "text-action-success" },
  closed: { label: "FECHADO", icon: XCircle, color: "text-muted-foreground" },
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [searchInspection, setSearchInspection] = useState("")
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [ticketDescription, setTicketDescription] = useState("")
  const [expectedDate, setExpectedDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [listening, setListening] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)

  useEffect(() => {
    fetchTickets()
    fetchInspections()
  }, [])

  async function fetchTickets() {
    try {
      const res = await fetch("/api/tickets")
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || data || [])
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  async function fetchInspections() {
    try {
      const res = await fetch("/api/inspections?limit=50")
      if (res.ok) {
        const data = await res.json()
        const inspectionsList = data.inspections || data || []
        const sorted = [...inspectionsList].sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setInspections(sorted)
      }
    } catch {
      /* ignore */
    }
  }

  const filteredInspections = inspections.filter(
    (i) =>
      i.inspectionNumber.toLowerCase().includes(searchInspection.toLowerCase()) ||
      i.room.toLowerCase().includes(searchInspection.toLowerCase())
  )

  function handleVoiceDictation() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Reconhecimento de voz não disponível")
      return
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "pt-BR"
    recognition.interimResults = false
    setListening(true)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setTicketDescription((prev) => (prev ? `${prev}\n${transcript}` : transcript))
      setListening(false)
    }
    recognition.onerror = () => {
      setListening(false)
      toast.error("Erro no reconhecimento de voz")
    }
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  async function handleCreateTicket() {
    if (!selectedInspection || !ticketDescription) {
      toast.error("Selecione uma vistoria e descreva o chamado")
      return
    }
    setSaving(true)
    try {
      const body = {
        ticketNumber: generateTicketNumber(),
        inspectionId: selectedInspection.id,
        description: ticketDescription,
        expectedCompletionDate: expectedDate ? new Date(expectedDate).toISOString() : null,
      }
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao criar chamado")
        return
      }
      toast.success("Chamado criado com sucesso!")
      setShowCreate(false)
      setSelectedInspection(null)
      setTicketDescription("")
      setExpectedDate("")
      setSearchInspection("")
      fetchTickets()
    } catch {
      toast.error("Erro ao criar chamado")
    } finally {
      setSaving(false)
    }
  }

  const filteredTickets = tickets.filter(
    (t) =>
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.inspection?.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
          Chamados
        </h1>
      </header>

      <div className="px-4 pt-4">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar chamado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-card py-16 text-center ring-1 ring-foreground/10">
            <Ticket className="size-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-semibold text-foreground">Nenhum chamado encontrado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Crie seu primeiro chamado a partir de uma vistoria
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket, i) => {
              const status = statusMap[ticket.status] || statusMap.open
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    if (ticket.inspection?.id) {
                      router.push(`/inspections/${ticket.inspection.id}`)
                    } else {
                      setSelectedTicket(ticket)
                    }
                  }}
                  className="cursor-pointer rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-ring"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {ticket.ticketNumber}
                      </p>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          status.color
                        )}
                      >
                        <StatusIcon className="size-3" />
                        {status.label}
                      </span>
                    </div>
                    {ticket.inspection && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ticket.inspection.inspectionNumber} — {ticket.inspection.room}
                      </p>
                    )}
                    {ticket.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {ticket.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{formatDate(ticket.createdAt)}</span>
                      {ticket.expectedCompletionDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {formatDate(ticket.expectedCompletionDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-12"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    {selectedTicket.ticketNumber}
                  </h3>
                  {selectedTicket.inspection && (
                    <p className="text-xs text-muted-foreground">
                      {selectedTicket.inspection.inspectionNumber} — {selectedTicket.inspection.room}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedTicket.description && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertCircle className="size-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-bold text-muted-foreground">DESCRIÇÃO</span>
                    </div>
                    <p className="text-sm text-foreground">{selectedTicket.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="size-3.5" />
                  <span>{selectedTicket.createdBy?.fullName || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  <span>Criado em {formatDate(selectedTicket.createdAt)}</span>
                </div>
                {selectedTicket.expectedCompletionDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    <span>Previsão: {formatDate(selectedTicket.expectedCompletionDate)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                    statusMap[selectedTicket.status]?.color || "text-muted-foreground"
                  )}>
                    {(statusMap[selectedTicket.status]?.label) || selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const inspNum = selectedTicket.inspection?.inspectionNumber
                    if (inspNum) {
                      const found = tickets.find(t => t.ticketNumber === selectedTicket.ticketNumber)
                      if (found?.inspection) {
                        router.push(`/inspections?search=${found.inspection.inspectionNumber}`)
                      }
                    }
                    setSelectedTicket(null)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-action-primary py-3 text-sm font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <ExternalLink className="size-4" />
                  VER VISTORIA VINCULADA
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex w-full items-center justify-center rounded-xl border border-input py-3 text-xs font-medium text-muted-foreground"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Ticket Bottom Sheet */}
      <motion.div
        initial={false}
        animate={showCreate ? { y: 0, opacity: 1 } : { y: 400, opacity: 0 }}
        className={`fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-card p-4 shadow-xl ring-1 ring-foreground/10 transition-all ${
          showCreate ? "" : "pointer-events-none"
        }`}
      >
        {showCreate && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                Novo Chamado
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-xs text-muted-foreground underline"
              >
                Fechar
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Vincular Vistoria
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar vistoria..."
                  value={searchInspection}
                  onChange={(e) => setSearchInspection(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-input bg-background">
                {(searchInspection ? filteredInspections : inspections).slice(0, 15).map((insp) => (
                  <button
                    key={insp.id}
                    type="button"
                    onClick={() => {
                      setSelectedInspection(insp)
                      setSearchInspection(insp.inspectionNumber)
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted ${
                      selectedInspection?.id === insp.id ? "bg-action-primary/10" : ""
                    }`}
                  >
                    <FileText className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{insp.inspectionNumber}</span>
                    <span className="text-muted-foreground truncate">— {insp.room}</span>
                  </button>
                ))}
                {inspections.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Nenhuma vistoria encontrada</p>
                )}
              </div>
              {selectedInspection && (
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-action-success/10 px-3 py-1.5">
                  <Building2 className="size-3.5 text-action-success" />
                  <span className="text-xs font-medium text-action-success">
                    {selectedInspection.inspectionNumber} — {selectedInspection.room}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInspection(null)
                      setSearchInspection("")
                    }}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Descrição</label>
              <textarea
                placeholder="Descreva o chamado..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-xs outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={handleVoiceDictation}
                disabled={listening}
                className={`absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full ${
                  listening
                    ? "bg-action-primary text-white animate-pulse"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Mic className="size-3.5" />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Previsão de Conclusão
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none ring-0 focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex h-9 flex-1 items-center justify-center rounded-lg border border-input text-xs font-medium text-muted-foreground"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleCreateTicket}
                disabled={saving}
                className="flex h-9 flex-1 items-center justify-center rounded-lg bg-action-primary text-xs font-bold text-white disabled:opacity-60"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {saving ? "CRIANDO..." : "CRIAR CHAMADO"}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="fixed right-6 bottom-24 z-30 flex size-14 items-center justify-center rounded-full bg-action-primary text-white shadow-lg shadow-action-primary/40 transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="size-6" />
      </button>

      <FloatingNav />
    </div>
  )
}
