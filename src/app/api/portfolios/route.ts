import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ portfolios })
  } catch {
    return NextResponse.json({ portfolios: [] })
  }
}
