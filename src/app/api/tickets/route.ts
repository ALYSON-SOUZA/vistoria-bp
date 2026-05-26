import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromSession } from "@/lib/auth"

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        inspection: { select: { id: true, inspectionNumber: true, room: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ tickets })
  } catch {
    return NextResponse.json({ tickets: [] })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { ticketNumber, inspectionId, description, expectedCompletionDate } = body

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        inspectionId: Number(inspectionId),
        description,
        expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : null,
        createdById: userId,
        status: "open",
      },
    })

    return NextResponse.json({ ticket })
  } catch {
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}
