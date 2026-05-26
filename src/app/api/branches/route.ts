import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ branches })
  } catch {
    return NextResponse.json({ branches: [] })
  }
}
