import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const inspection = await prisma.inspection.findUnique({
      where: { id: Number(id) },
      include: {
        images: { orderBy: { sequenceNumber: "asc" } },
        signature: true,
        portfolio: true,
        branch: true,
        department: true,
        managerRel: true,
        roomManager: true,
        directorate: true,
        createdBy: { select: { fullName: true, nickname: true } },
        tickets: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })
    if (!inspection) {
      return NextResponse.json({ error: "Vistoria não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ inspection })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
