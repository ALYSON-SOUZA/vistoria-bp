"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  X,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const entityLabels: Record<string, { name: string; singular: string }> = {
  users: { name: "Usuários", singular: "Usuário" },
  roles: { name: "Cargos", singular: "Cargo" },
  branches: { name: "Unidades", singular: "Unidade" },
  departments: { name: "Departamentos", singular: "Departamento" },
  portfolios: { name: "Portfólios", singular: "Portfólio" },
  directorates: { name: "Diretorias", singular: "Diretoria" },
  managers: { name: "Gestores", singular: "Gestor" },
}

export default function AdminEntityPage() {
  const params = useParams<{ entity: string }>()
  const router = useRouter()
  const entity = params?.entity || ""
  const label = entityLabels[entity]

  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("id")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const pageSize = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${entity}`)
      if (res.ok) {
        const result = await res.json()
        setData(result.data || result[entity] || result || [])
      } else {
        setData([])
      }
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [entity])

  useEffect(() => {
    if (entity && entityLabels[entity]) fetchData()
  }, [entity, fetchData])

  const parsedData = (Array.isArray(data) ? data : []).filter(
    (item: any) =>
      !search ||
      Object.values(item).some(
        (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
      )
  )

  const sorted = [...parsedData].sort((a: any, b: any) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (aVal == null) return 1
    if (bVal == null) return -1
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return sortDir === "asc" ? cmp : -cmp
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function getFields() {
    if (sorted.length === 0) return []
    const sample = sorted[0]
    return Object.keys(sample).filter((k) => k !== "password")
  }

  function openCreate() {
    setEditing(null)
    setFormData({})
    setShowModal(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    const fd: Record<string, any> = {}
    for (const key of getFields()) {
      fd[key] = item[key] ?? ""
    }
    setFormData(fd)
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editing
        ? `/api/admin/${entity}/${editing.id}`
        : `/api/admin/${entity}`
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao salvar")
        return
      }
      toast.success(editing ? "Atualizado com sucesso!" : "Criado com sucesso!")
      setShowModal(false)
      fetchData()
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir?")) return
    try {
      const res = await fetch(`/api/admin/${entity}/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erro ao excluir")
        return
      }
      toast.success("Excluído com sucesso!")
      fetchData()
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  if (!label) {
    return (
      <AdminLayout title="Administração">
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Entidade não encontrada</p>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="text-xs text-action-primary underline"
          >
            Voltar ao admin
          </button>
        </div>
      </AdminLayout>
    )
  }

  const columns = getFields().slice(0, 5)

  return (
    <AdminLayout title={label.name}>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Buscar ${label.name.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-action-primary px-4 text-xs font-bold text-white shadow-lg shadow-action-primary/30"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <Plus className="size-4" />
          NOVO
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-card py-16 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            {search ? "Nenhum resultado encontrado" : `Nenhum ${label.singular.toLowerCase()} cadastrado`}
          </p>
          {!search && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-full bg-action-primary px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="size-3.5" />
              CRIAR {label.singular.toUpperCase()}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="cursor-pointer px-3 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col}</span>
                        {sortField === col &&
                          (sortDir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="w-20 px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    {columns.map((col) => (
                      <td key={col} className="max-w-[160px] truncate px-3 py-2.5 text-xs text-foreground">
                        {col === "id" ? (
                          <span className="font-mono text-muted-foreground">#{item[col]}</span>
                        ) : col === "email" ? (
                          <span className="text-action-primary">{item[col]}</span>
                        ) : col === "createdAt" || col === "created_at" ? (
                          <span className="text-muted-foreground">
                            {item[col] ? new Date(item[col]).toLocaleDateString("pt-BR") : "—"}
                          </span>
                        ) : typeof item[col] === "boolean" ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              item[col]
                                ? "bg-action-success/10 text-action-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item[col] ? "Sim" : "Não"}
                          </span>
                        ) : (
                          String(item[col] ?? "—")
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 items-center justify-center rounded-lg border border-input bg-card px-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 items-center justify-center rounded-lg border border-input bg-card px-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-12 sm:items-center"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3
                  className="text-base font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {editing ? `Editar ${label.singular}` : `Novo ${label.singular}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                {getFields()
                  .filter((f) => f !== "id" && f !== "createdAt" && f !== "created_at" && f !== "password")
                  .map((field) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        {field}
                      </label>
                      <input
                        type={field.includes("email") ? "email" : field.includes("password") ? "password" : "text"}
                        placeholder={field}
                        value={formData[field] ?? ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                      />
                    </div>
                  ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-input text-xs font-medium text-muted-foreground"
                >
                  CANCELAR
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-action-primary text-xs font-bold text-white disabled:opacity-60"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Save className="size-4" />
                  {saving ? "SALVANDO..." : "SALVAR"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
