"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Users,
  Shield,
  Building2,
  Briefcase,
  FolderOpen,
  MapPin,
  UserCog,
  Settings,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

const entities = [
  { slug: "users", label: "Usuários", icon: Users, description: "Gerenciar usuários do sistema" },
  { slug: "roles", label: "Cargos", icon: Shield, description: "Gerenciar cargos e permissões" },
  { slug: "branches", label: "Unidades", icon: Building2, description: "Gerenciar unidades/filiais" },
  { slug: "departments", label: "Departamentos", icon: Briefcase, description: "Gerenciar departamentos" },
  { slug: "portfolios", label: "Portfólios", icon: FolderOpen, description: "Gerenciar portfólios" },
  { slug: "directorates", label: "Diretorias", icon: MapPin, description: "Gerenciar diretorias" },
  { slug: "managers", label: "Gestores", icon: UserCog, description: "Gerenciar gestores" },
]

export default function AdminPage() {
  const router = useRouter()

  return (
    <AdminLayout title="Administração">
      <div className="grid grid-cols-2 gap-3">
        {entities.map((entity, i) => {
          const Icon = entity.icon
          return (
            <motion.button
              key={entity.slug}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/admin/${entity.slug}`)}
              className="flex flex-col items-center gap-3 rounded-xl bg-card p-5 text-center ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-ring"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <div>
                <p
                  className="text-sm font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {entity.label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{entity.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </AdminLayout>
  )
}
