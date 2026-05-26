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
  User as UserIcon,
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

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  conforme: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success" },
  pendente: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500" },
  nao_conforme: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary" },
  non_compliant: { label: "NÃO CONFORME", icon: XCircle, color: "text-action-primary" },
  pending: { label: "PENDENTE", icon: AlertTriangle, color: "text-yellow-500" },
  compliant: { label: "CONFORME", icon: CheckCircle2, color: "text-action-success" },
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

  return (
    <div className="relative min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            {getGreeting()},
          </p>
          <h1
            className="text-lg font-bold text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {user?.nickname || user?.fullName || "Usuário"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <Bell className="size-5" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-action-primary ring-2 ring-card" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white transition-all hover:bg-primary/80"
            >
              {(user?.fullName || "U").charAt(0).toUpperCase()}
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
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                      {(user?.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
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

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-action-success/10">
                <ClipboardCheck className="size-4 text-action-success" />
              </div>
              <span className="text-xs text-muted-foreground">Vistorias Hoje</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.today}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <TrendingUp className="size-3 text-action-success" />
              <span className="text-action-success">+{stats.trend}%</span>
              <span className="text-muted-foreground">vs ontem</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-action-primary/10">
                <Calendar className="size-4 text-action-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Total do Mês</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.month}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Target className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                Meta: {stats.goal > 0 ? `${Math.round((stats.month / stats.goal) * 100)}%` : "—"}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/inspections/new")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-action-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-action-primary/30"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Plus className="size-5" />
          NOVA VISTORIA
        </motion.button>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2
              className="text-sm font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ÚLTIMAS VISTORIAS
            </h2>
            <button
              type="button"
              onClick={() => router.push("/inspections")}
              className="flex items-center gap-0.5 text-xs text-action-primary"
            >
              Ver todas <ChevronRight className="size-3" />
            </button>
          </div>

          <div className="space-y-3">
            {inspections.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl bg-card py-8 text-center ring-1 ring-foreground/10">
                <ClipboardCheck className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhuma vistoria encontrada</p>
              </div>
            )}
            {inspections.map((inspection, i) => {
              const status = statusConfig[inspection.status] || statusConfig.pending
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={inspection.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleInspectionClick(inspection)}
                  className="cursor-pointer rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-ring"
                >
                  <div className="flex items-center gap-3 p-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        inspection.type === "limpeza"
                          ? "bg-action-success/10"
                          : "bg-primary/10"
                      )}
                    >
                      <Building2
                        className={cn(
                          "size-5",
                          inspection.type === "limpeza"
                            ? "text-action-success"
                            : "text-primary"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate text-sm font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {inspection.inspectionNumber}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {inspection.room}
                        {inspection.portfolio ? ` — ${inspection.portfolio.name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className={cn("size-3.5", status.color)} />
                      <span
                        className={cn("text-[11px] font-bold", status.color)}
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <FloatingNav />
    </div>
  )
}
