"use client"

import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ClipboardCheck, Ticket, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inspections", label: "Vistorias", icon: ClipboardCheck },
  { href: "/tickets", label: "Chamados", icon: Ticket },
  { href: "/admin", label: "Admin", icon: User },
]

export function FloatingNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-2 custom-shadow ring-1 ring-white/10">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-white/20 text-tertiary-fixed-dim shadow-[0_0_15px_rgba(8,217,214,0.3)]"
                : "text-white/60 hover:text-white/90"
            )}
          >
            <Icon className={cn("size-4", isActive && "fill-tertiary-fixed-dim")} />
            <span className="font-label-md text-label-md">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
