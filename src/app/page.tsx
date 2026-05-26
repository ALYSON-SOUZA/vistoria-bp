"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ClipboardCheck, Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [emailOrCpf, setEmailOrCpf] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOrCpf || !password) {
      toast.error("Preencha todos os campos")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrCpf, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login")
        return
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/dashboard")
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-action-success/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-action-primary/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center"
      >
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <ClipboardCheck className="size-10 text-white" />
        </div>

        <h1
          className="mb-1 text-3xl font-extrabold tracking-tight text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          VISTORIA BP
        </h1>
        <p
          className="mb-8 text-sm text-muted-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Sistema de Inspeções Corporativas
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Usuário (email ou CPF)"
              value={emailOrCpf}
              onChange={(e) => setEmailOrCpf(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-10 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              style={{ fontFamily: "var(--font-sans)" }}
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

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-action-primary text-sm font-bold text-white shadow-lg shadow-action-primary/30 transition-all hover:bg-action-hover disabled:opacity-60"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Entrar"
            )}
          </motion.button>
        </form>

        <button
          type="button"
          className="mt-4 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Esqueci minha senha
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/register")}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold text-primary transition-all hover:bg-primary/10"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <UserPlus className="size-4" />
          NOVO USUÁRIO
        </motion.button>

        <p className="mt-8 text-[11px] text-muted-foreground">
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="#" className="underline underline-offset-2 hover:text-foreground">
            Privacidade
          </a>
        </p>
      </motion.div>
    </div>
  )
}
