import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const directorates = await prisma.directorate.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ directorates })
  } catch {
    return NextResponse.json({ directorates: [] })
  }
}
