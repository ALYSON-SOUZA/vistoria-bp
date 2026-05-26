"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, UserPlus, Building2, Shield, Briefcase, FolderOpen, MapPin, Phone } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SelectOption {
  id: number
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: "",
    nickname: "",
    cpf: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    branchId: "",
    departmentId: "",
    portfolioId: "",
    directorateId: "",
  })

  const [roles, setRoles] = useState<SelectOption[]>([])
  const [branches, setBranches] = useState<SelectOption[]>([])
  const [departments, setDepartments] = useState<SelectOption[]>([])
  const [portfolios, setPortfolios] = useState<SelectOption[]>([])
  const [directorates, setDirectorates] = useState<SelectOption[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [rolesRes, branchesRes, departmentsRes, portfoliosRes, directoratesRes] =
          await Promise.all([
            fetch("/api/admin/roles"),
            fetch("/api/admin/branches"),
            fetch("/api/admin/departments"),
            fetch("/api/admin/portfolios"),
            fetch("/api/admin/directorates"),
          ])
        if (rolesRes.ok) {
          const d = await rolesRes.json()
          setRoles(d.data || [])
        }
        if (branchesRes.ok) {
          const d = await branchesRes.json()
          setBranches(d.data || [])
        }
        if (departmentsRes.ok) {
          const d = await departmentsRes.json()
          setDepartments(d.data || [])
        }
        if (portfoliosRes.ok) {
          const d = await portfoliosRes.json()
          setPortfolios(d.data || [])
        }
        if (directoratesRes.ok) {
          const d = await directoratesRes.json()
          setDirectorates(d.data || [])
        }
      } catch {
        toast.error("Erro ao carregar dados")
      }
    }
    fetchData()
  }, [])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error("Senhas não conferem")
      return
    }
    if (form.password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          nickname: form.nickname || undefined,
          cpf: form.cpf || undefined,
          phone: form.phone || undefined,
          email: form.email,
          password: form.password,
          roleId: form.roleId ? Number(form.roleId) : undefined,
          branchId: form.branchId ? Number(form.branchId) : undefined,
          departmentId: form.departmentId ? Number(form.departmentId) : undefined,
          portfolioId: form.portfolioId ? Number(form.portfolioId) : undefined,
          directorateId: form.directorateId ? Number(form.directorateId) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar usuário")
        return
      }
      toast.success("Usuário criado com sucesso!")
      router.push("/")
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const SelectField = ({
    label,
    icon: Icon,
    value,
    options,
    field,
  }: {
    label: string
    icon: any
    value: string
    options: SelectOption[]
    field: string
  }) => (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold text-muted-foreground"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-input bg-card pl-10 pr-8 text-sm outline-none ring-0 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
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
    </div>
  )

  return (
    <div className="relative min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => {
            if (step === 1) {
              router.push("/")
            } else {
              setStep(1)
            }
          }}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1
          className="flex-1 text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Novo Usuário
        </h1>
      </header>

      <div className="px-4 pt-4">
        <div className="mb-6 flex items-center gap-2">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
              step === 1 ? "bg-action-primary text-white" : "bg-action-success text-white"
            )}
          >
            1
          </div>
          <div className="h-px flex-1 bg-muted-foreground/20" />
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
              step === 2 ? "bg-action-primary text-white" : "bg-muted text-muted-foreground"
            )}
          >
            2
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Apelido
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Como gostaria de ser chamado"
                    value={form.nickname}
                    onChange={(e) => updateField("nickname", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  CPF
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) => updateField("cpf", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="(41) 99999-9999"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Email *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-10 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-semibold text-muted-foreground"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-10 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    style={{ fontFamily: "var(--font-sans)" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-action-primary text-sm font-bold text-white shadow-lg shadow-action-primary/30 transition-all hover:bg-action-hover"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                PRÓXIMO
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <SelectField
                label="Cargo"
                icon={Shield}
                value={form.roleId}
                options={roles}
                field="roleId"
              />
              <SelectField
                label="Unidade"
                icon={Building2}
                value={form.branchId}
                options={branches}
                field="branchId"
              />
              <SelectField
                label="Departamento"
                icon={Briefcase}
                value={form.departmentId}
                options={departments}
                field="departmentId"
              />
              <SelectField
                label="Carteira"
                icon={FolderOpen}
                value={form.portfolioId}
                options={portfolios}
                field="portfolioId"
              />
              <SelectField
                label="Diretoria"
                icon={MapPin}
                value={form.directorateId}
                options={directorates}
                field="directorateId"
              />

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-action-primary text-sm font-bold text-white shadow-lg shadow-action-primary/30 transition-all hover:bg-action-hover disabled:opacity-60"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    CRIAR USUÁRIO
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  )
}
