import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const inspections = await prisma.inspection.findMany({
      where: { sessionId },
      include: {
        images: { orderBy: { sequenceNumber: "asc" } },
        signature: true,
        portfolio: true,
        branch: true,
        department: true,
        managerRel: true,
        directorate: true,
        createdBy: { select: { fullName: true, nickname: true } },
        tickets: {
          include: { createdBy: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ inspections })
  } catch {
    return NextResponse.json({ inspections: [] })
  }
}
