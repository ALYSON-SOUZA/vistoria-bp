"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Mic,
  Camera,
  X,
  HardHat,
  Sparkles,
  Save,
  PenLine,
  User,
  Building2,
  ClipboardCheck,
  CheckCircle2,
  Plus,
  List,
  LogOut,
  ThumbsUp,
} from "lucide-react"
import { toast } from "sonner"
import { generateInspectionNumber } from "@/lib/utils"

interface SelectOption {
  id: number
  name: string
}

interface UserData {
  id: number
  fullName: string
  nickname?: string
}

interface RecordItem {
  type: "" | "manutencao" | "limpeza"
  room: string
  branchId: string
  departmentId: string
  portfolioId: string
  managerId: string
  directorateId: string
  occurrence: string
  photos: string[]
  signature: string | null
}

function createEmptyRecord(): RecordItem {
  return {
    type: "",
    room: "",
    branchId: "",
    departmentId: "",
    portfolioId: "",
    managerId: "",
    directorateId: "",
    occurrence: "",
    photos: [],
    signature: null,
  }
}

export default function NewInspectionPage() {
  const router = useRouter()
  const [sessionId] = useState(() => crypto.randomUUID())
  const [user, setUser] = useState<UserData | null>(null)

  const [records, setRecords] = useState<RecordItem[]>([createEmptyRecord()])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedCount, setSavedCount] = useState(0)

  const [branches, setBranches] = useState<SelectOption[]>([])
  const [departments, setDepartments] = useState<SelectOption[]>([])
  const [portfolios, setPortfolios] = useState<SelectOption[]>([])
  const [managers, setManagers] = useState<SelectOption[]>([])
  const [directorates, setDirectorates] = useState<SelectOption[]>([])
  const [showSignatureFirst, setShowSignatureFirst] = useState(false)
  const [showNewInspectionPrompt, setShowNewInspectionPrompt] = useState(false)
  const [saving, setSaving] = useState(false)
  const [listening, setListening] = useState(false)
  const [showRecordsList, setShowRecordsList] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef2 = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const current = records[currentIndex] || createEmptyRecord()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    async function fetchSelects() {
      try {
        const [branchesRes, departmentsRes, portfoliosRes, managersRes, directoratesRes] =
          await Promise.all([
            fetch("/api/branches"),
            fetch("/api/departments"),
            fetch("/api/portfolios"),
            fetch("/api/managers"),
            fetch("/api/directorates"),
          ])
        if (branchesRes.ok) {
          const d = await branchesRes.json()
          setBranches(d.branches || [])
        }
        if (departmentsRes.ok) {
          const d = await departmentsRes.json()
          setDepartments(d.departments || [])
        }
        if (portfoliosRes.ok) {
          const d = await portfoliosRes.json()
          setPortfolios(d.portfolios || [])
        }
        if (managersRes.ok) {
          const d = await managersRes.json()
          setManagers(d.managers || [])
        }
        if (directoratesRes.ok) {
          const d = await directoratesRes.json()
          setDirectorates(d.directorates || [])
        }
      } catch {}
    }
    fetchSelects()
  }, [])

  function updateCurrent(field: keyof RecordItem, value: any) {
    setRecords((prev) => {
      const updated = [...prev]
      updated[currentIndex] = { ...updated[currentIndex], [field]: value }
      return updated
    })
  }

  function handlePhotoCapture() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const remaining = 5 - current.photos.length
    const toAdd = Array.from(files).slice(0, remaining)
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          updateCurrent("photos", [...current.photos, ev.target!.result as string].slice(0, 5))
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  function removePhoto(index: number) {
    updateCurrent("photos", current.photos.filter((_, i) => i !== index))
  }

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
      updateCurrent("occurrence", current.occurrence ? `${current.occurrence}\n${transcript}` : transcript)
      setListening(false)
    }
    recognition.onerror = () => {
      setListening(false)
      toast.error("Erro no reconhecimento de voz")
    }
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvas.onmousemove = draw
    canvas.ontouchmove = drawTouch
  }

  function draw(e: MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  function drawTouch(e: TouchEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top)
    ctx.stroke()
  }

  function stopDrawing() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.onmousemove = null
    canvas.ontouchmove = null
  }

  function clearSignature(canvas: HTMLCanvasElement | null) {
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  function getSignatureData(canvas: HTMLCanvasElement | null): string | null {
    if (!canvas) return null
    const data = canvas.toDataURL("image/png")
    if (data.length < 1000) return null
    return data
  }

  async function saveCurrentRecord(signatureData: string | null) {
    const rec = records[currentIndex]
    if (!rec.type || !rec.room) {
      toast.error("Preencha o tipo e a sala/ambiente")
      return false
    }

    setSaving(true)
    try {
      const body = {
        inspectionNumber: generateInspectionNumber(),
        type: rec.type,
        room: rec.room,
        branchId: rec.branchId ? Number(rec.branchId) : null,
        departmentId: rec.departmentId ? Number(rec.departmentId) : null,
        portfolioId: rec.portfolioId ? Number(rec.portfolioId) : null,
        managerId: rec.managerId ? Number(rec.managerId) : null,
        directorateId: rec.directorateId ? Number(rec.directorateId) : null,
        occurrence: rec.occurrence,
        photos: rec.photos,
        signature: signatureData,
        sessionId,
      }
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao salvar registro")
        return false
      }
      return true
    } catch {
      toast.error("Erro ao salvar registro")
      return false
    } finally {
      setSaving(false)
    }
  }

  function handleFinalizeClick() {
    const rec = records[currentIndex]
    if (!rec.type || !rec.room) {
      toast.error("Preencha o tipo e a sala/ambiente")
      return
    }
    setShowSignatureFirst(true)
  }

  async function handleSignatureConfirm() {
    const sig = getSignatureData(canvasRef.current)
    if (!sig) {
      toast.error("Desenhe sua assinatura antes de confirmar")
      return
    }
    updateCurrent("signature", sig)
    setShowSignatureFirst(false)

    const ok = await saveCurrentRecord(sig)
    if (!ok) return

    setSavedCount((c) => c + 1)
    setShowNewInspectionPrompt(true)
  }

  function handleNewInspectionYes() {
    setShowNewInspectionPrompt(false)
    const updated = { ...records[currentIndex] }
    updated.type = "" as any
    updated.occurrence = ""
    updated.photos = []
    updated.signature = null
    setRecords((prev) => {
      const next = [...prev]
      next[currentIndex] = updated
      return next
    })
  }

  function handleNewInspectionNo() {
    setShowNewInspectionPrompt(false)
    toast.success("Vistoria concluída com sucesso!")
    router.push(`/inspections/session/${sessionId}`)
  }

  function switchToRecord(index: number) {
    setCurrentIndex(index)
    setShowRecordsList(false)
  }

  const totalRecords = records.length
  const hasUnsavedData = current.type || current.room || current.photos.length > 0 || current.occurrence

  return (
    <div className="relative min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">Nova Vistoria</p>
          <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Registro {currentIndex + 1} de {totalRecords}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowRecordsList(!showRecordsList)}
              className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
            >
              <List className="size-4" />
            </button>
          )}
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <User className="size-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {user?.nickname || user?.fullName || "Inspetor"}
            </span>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showRecordsList && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b bg-card"
          >
            <div className="space-y-1 px-4 py-3">
              <p className="text-xs font-bold text-muted-foreground mb-2">REGISTROS SALVOS</p>
              {records.slice(0, -1).map((rec, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => switchToRecord(i)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-action-success/10">
                    <CheckCircle2 className="size-3.5 text-action-success" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      {rec.type === "manutencao" ? "Manutenção" : "Limpeza"}
                    </span>
                    <span className="ml-2 text-muted-foreground">{rec.room}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 px-4 pt-4 pb-32">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => updateCurrent("type", "manutencao")}
            className={`flex flex-col items-center gap-2 rounded-xl p-5 ring-1 transition-all ${
              current.type === "manutencao"
                ? "bg-primary text-white ring-primary"
                : "bg-card text-foreground ring-foreground/10"
            }`}
          >
            <HardHat className="size-8" />
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              MANUTENÇÃO
            </span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => updateCurrent("type", "limpeza")}
            className={`flex flex-col items-center gap-2 rounded-xl p-5 ring-1 transition-all ${
              current.type === "limpeza"
                ? "bg-tertiary text-white ring-tertiary"
                : "bg-card text-foreground ring-foreground/10"
            }`}
          >
            <Sparkles className="size-8" />
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              LIMPEZA
            </span>
          </motion.button>
        </div>

        <div className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">SALA / AMBIENTE</label>
            <input
              type="text"
              placeholder="Ex: Sala 204, Bloco A"
              value={current.room}
              onChange={(e) => updateCurrent("room", e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>
          <SelectField
            label="FILIAL"
            value={current.branchId}
            options={branches}
            onChange={(v) => updateCurrent("branchId", v)}
          />
          <SelectField
            label="DEPARTAMENTO"
            value={current.departmentId}
            options={departments}
            onChange={(v) => updateCurrent("departmentId", v)}
          />
          <SelectField
            label="CARTEIRA"
            value={current.portfolioId}
            options={portfolios}
            onChange={(v) => updateCurrent("portfolioId", v)}
          />
          <SelectField
            label="GESTOR"
            value={current.managerId}
            options={managers}
            onChange={(v) => updateCurrent("managerId", v)}
          />
          <SelectField
            label="DIRETORIA"
            value={current.directorateId}
            options={directorates}
            onChange={(v) => updateCurrent("directorateId", v)}
          />
        </div>

        <div className="relative rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">OCORRÊNCIA</label>
          <textarea
            placeholder="Descreva a ocorrência..."
            value={current.occurrence}
            onChange={(e) => updateCurrent("occurrence", e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <button
            type="button"
            onClick={handleVoiceDictation}
            disabled={listening}
            className={`absolute right-6 bottom-5 flex size-9 items-center justify-center rounded-full transition-all ${
              listening
                ? "bg-action-primary text-white animate-pulse shadow-lg shadow-action-primary/40"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Mic className="size-4" />
          </button>
        </div>

        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">FOTOS ({current.photos.length}/5)</label>
            {current.photos.length < 5 && (
              <button
                type="button"
                onClick={handlePhotoCapture}
                className="flex items-center gap-1 text-xs font-medium text-action-primary"
              >
                <Camera className="size-3.5" />
                Adicionar
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {current.photos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {current.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="h-20 w-20 rounded-lg object-cover ring-1 ring-foreground/10"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white shadow"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={handlePhotoCapture}
              className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-6 transition-colors hover:border-muted-foreground/50"
            >
              <Camera className="size-6 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 flex-1 items-center justify-center rounded-xl border border-input bg-card text-sm font-medium text-muted-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={handleFinalizeClick}
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-action-primary text-sm font-bold text-white shadow-lg shadow-action-primary/30"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            FINALIZAR
          </button>
        </div>
      </div>

      {/* Signature Modal (shown first) */}
      <AnimatePresence>
        {showSignatureFirst && (
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
              <div className="mb-4 text-center">
                <h3
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Assinatura Digital
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Assine abaixo com o dedo ou mouse
                </p>
              </div>
              <div className="mb-4 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-white">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={160}
                  className="size-full touch-none"
                  style={{ cursor: "crosshair" }}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { clearSignature(canvasRef.current); setShowSignatureFirst(false) }}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-input bg-background text-xs font-medium text-muted-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleSignatureConfirm}
                  disabled={saving}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-action-primary text-xs font-bold text-white disabled:opacity-60"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {saving ? "SALVANDO..." : "FINALIZAR"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nova Vistoria? Prompt */}
      <AnimatePresence>
        {showNewInspectionPrompt && (
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
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-action-success/10">
                  <ClipboardCheck className="size-7 text-action-success" />
                </div>
                <h3
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Vistoria Salva!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deseja fazer outra vistoria?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleNewInspectionNo}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-card text-sm font-medium text-muted-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <LogOut className="size-4" />
                  NÃO
                </button>
                <button
                  type="button"
                  onClick={handleNewInspectionYes}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-action-primary text-sm font-bold text-white shadow-lg shadow-action-primary/30"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <ThumbsUp className="size-4" />
                  SIM
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: SelectOption[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-ring focus:ring-2 focus:ring-ring/20"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  )
}
