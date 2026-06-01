"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardCheck,
  Bell,
  TrendingUp,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  HardHat,
  Calendar,
  Target,
  LogOut,
  Mail,
  Clock,
  Shield,
  Warehouse,
  Wrench,
} from "lucide-react"
import { FloatingNav } from "@/components/floating-nav"
import { cn } from "@/lib/utils"

interface UserData {
  id: number
  fullName: string
  nickname?: string
  email?: string
  avatar?: string
  role?: { name: string }
  branch?: { name: string }
}

interface Inspection {
  id: number
  inspectionNumber: string
  type: string
  room: string
  status: string
  createdAt: string
  portfolio?: { name: string }
  managerRel?: { name: string } | null
  sessionId?: string | null
}

const typeIcons: Record<string, { icon: typeof Building2; color: string }> = {
  facilities: { icon: Building2, color: "text-primary" },
  limpeza: { icon: ClipboardCheck, color: "text-action-success" },
  seguranca: { icon: Shield, color: "text-action-primary" },
  manutencao: { icon: Wrench, color: "text-yellow-500" },
  predial: { icon: Warehouse, color: "text-tertiary-fixed-dim" },
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; borderColor: string }> = {
  conforme: { label: "CONFORME", icon: CheckCircle2, color: "text-tertiary-fixed-dim", borderColor: "border-l-tertiary-fixed-dim" },
  pendente: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", borderColor: "border-l-yellow-500" },
  nao_conforme: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", borderColor: "border-l-action-primary" },
  non_compliant: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary", borderColor: "border-l-action-primary" },
  pending: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500", borderColor: "border-l-yellow-500" },
  compliant: { label: "CONFORME", icon: CheckCircle2, color: "text-tertiary-fixed-dim", borderColor: "border-l-tertiary-fixed-dim" },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

function formatSessionTime(start: number): string {
  const diff = Date.now() - start
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [stats, setStats] = useState({ today: 0, month: 0, trend: 0, goal: 0 })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sessionStart, setSessionStart] = useState(Date.now())
  const [sessionTime, setSessionTime] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
      let start = localStorage.getItem("sessionStart")
      if (!start) {
        start = String(Date.now())
        localStorage.setItem("sessionStart", start)
      }
      setSessionStart(Number(start))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(formatSessionTime(sessionStart))
    }, 10000)
    setSessionTime(formatSessionTime(sessionStart))
    return () => clearInterval(timer)
  }, [sessionStart])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const [inspRes, statsRes] = await Promise.all([
          fetch("/api/inspections?limit=5"),
          fetch("/api/inspections/stats"),
        ])
        if (inspRes.ok) {
          const data = await inspRes.json()
          setInspections(data.inspections || data || [])
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
      } catch {
        /* ignore */
      }
    }
    fetchData()
  }, [])

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {}
    localStorage.removeItem("user")
    localStorage.removeItem("sessionStart")
    router.push("/")
  }

  function handleInspectionClick(inspection: Inspection) {
    if (inspection.sessionId) {
      router.push(`/inspections/session/${inspection.sessionId}`)
    } else {
      router.push(`/inspections/${inspection.id}`)
    }
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2).toUpperCase()
    : "AD"

  return (
    <div className="relative min-h-screen bg-background pb-32">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background px-4 py-4">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface-variant/70">
            {getGreeting()},
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            {user?.nickname || user?.fullName || "Usuário"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-transform duration-150"
          >
            <Bell className="size-6 text-on-surface" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-action-primary border-2 border-background" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex size-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-white border-2 border-white custom-shadow overflow-hidden"
            >
              {initials}
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-foreground/10"
                >
                  <div className="border-b border-border p-4 text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary-container text-lg font-bold text-white border-2 border-white custom-shadow overflow-hidden">
                      {initials}
                    </div>
                    <p className="font-headline-sm text-sm font-bold text-foreground">
                      {user?.fullName}
                    </p>
                    {user?.nickname && (
                      <p className="text-xs text-muted-foreground">@{user.nickname}</p>
                    )}
                  </div>
                  <div className="space-y-1 p-2">
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{user?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        Sessão: {sessionTime || "iniciando..."}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      <span className="font-medium">Sair da conta</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 flex flex-col border-l-4 border-tertiary-fixed-dim"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm">assignment_turned_in</span>
              <span className="font-label-md text-label-md text-on-surface-variant">Vistorias Hoje</span>
            </div>
            <p className="font-headline-lg text-headline-lg text-on-surface mb-1">{stats.today}</p>
            <div className="flex items-center gap-1 text-tertiary-fixed-dim font-bold text-xs">
              <TrendingUp className="size-3" />
              <span>+{stats.trend}% <span className="font-normal text-on-surface-variant/60">vs ontem</span></span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 flex flex-col border-l-4 border-action-primary"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="size-4 text-action-primary" />
              <span className="font-label-md text-label-md text-on-surface-variant">Total do Mês</span>
            </div>
            <p className="font-headline-lg text-headline-lg text-on-surface mb-1">{stats.month}</p>
            <div className="flex items-center gap-1 text-on-surface-variant/80 font-bold text-xs">
              <Target className="size-3" />
              <span>Meta: {stats.goal > 0 ? `${Math.round((stats.month / stats.goal) * 100)}%` : "—"}</span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/inspections/new")}
            className="w-full bg-action-primary text-white font-button-text text-button-text py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest custom-shadow active:scale-[0.98] transition-transform duration-150"
          >
            <Plus className="size-5 font-bold" />
            NOVA VISTORIA
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open("/cotacao_materiais.html", "_blank")}
            className="w-full bg-primary text-white font-button-text text-button-text py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest custom-shadow active:scale-[0.98] transition-transform duration-150"
          >
            <ClipboardCheck className="size-5 font-bold" />
            COTAÇÃO DE MATERIAIS
          </motion.button>
        </div>

        {/* Recent Inspections */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight uppercase text-sm font-bold">
              ÚLTIMAS VISTORIAS
            </h2>
            <button
              type="button"
              onClick={() => router.push("/inspections")}
              className="text-action-primary font-label-md text-label-md flex items-center gap-0.5"
            >
              Ver todas
              <ChevronRight className="size-3" />
            </button>
          </div>

          <div className="space-y-2">
            {inspections.length === 0 && (
              <div className="glass-card rounded-2xl py-10 text-center">
                <ClipboardCheck className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma vistoria encontrada</p>
              </div>
            )}
            {inspections.map((inspection, i) => {
              const status = statusConfig[inspection.status] || statusConfig.pending
              const StatusIcon = status.icon
              const typeIcon = typeIcons[inspection.type] || typeIcons.facilities
              const TypeIconComponent = typeIcon.icon
              return (
                <motion.div
                  key={inspection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleInspectionClick(inspection)}
                  className={cn(
                    "glass-card rounded-2xl p-3 flex items-center justify-between border-l-4 cursor-pointer active:scale-[0.99] transition-transform",
                    status.borderColor
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-surface-container">
                      <TypeIconComponent className={cn("size-5", typeIcon.color)} />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-on-surface text-sm">
                        {inspection.inspectionNumber}
                      </p>
                      <p className="text-on-surface-variant/70 text-xs">
                        {inspection.room}
                        {inspection.portfolio ? ` — ${inspection.portfolio.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className={cn("size-3.5", status.color)} style={{ fontVariationSettings: "'FILL' 1" }} />
                    <span className={cn("text-[10px] font-bold tracking-wider uppercase", status.color)}>
                      {status.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </main>

      <FloatingNav />
    </div>
  )
}
