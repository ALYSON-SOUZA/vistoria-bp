import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYesterday = new Date(startOfDay.getTime() - 86400000)

    const [today, month, yesterday] = await Promise.all([
      prisma.inspection.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.inspection.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.inspection.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfDay } } }),
    ])

    const trend = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : today > 0 ? 100 : 0

    return NextResponse.json({ today, month, trend, goal: 200 })
  } catch {
    return NextResponse.json({ today: 0, month: 0, trend: 0, goal: 200 })
  }
}
