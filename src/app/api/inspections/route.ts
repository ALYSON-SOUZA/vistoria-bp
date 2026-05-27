import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const inspections = await prisma.inspection.findMany({
      include: {
        portfolio: true,
        branch: true,
        department: true,
        managerRel: true,
        directorate: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: Number(limit) } : {}),
    })
    return NextResponse.json({ inspections })
  } catch {
    return NextResponse.json({ inspections: [] })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { inspectionNumber, type, room, branchId, departmentId, portfolioId, managerId, roomManagerId, directorateId, occurrence, photos, signature, sessionId } = body

    const inspection = await prisma.inspection.create({
      data: {
        inspectionNumber,
        type,
        room,
        branchId: branchId || null,
        departmentId: departmentId || null,
        portfolioId: portfolioId || null,
        managerId: managerId || null,
        roomManagerId: roomManagerId || null,
        directorateId: directorateId || null,
        occurrence: occurrence || null,
        sessionId: sessionId || null,
        createdById: userId,
        status: "conforme",
        ...(photos?.length
          ? {
              images: {
                create: photos.map((url: string, i: number) => ({
                  imageUrl: url,
                  sequenceNumber: i + 1,
                })),
              },
            }
          : {}),
        ...(signature
          ? {
              signature: {
                create: {
                  managerSignature: signature,
                },
              },
            }
          : {}),
      },
      include: { images: true, signature: true },
    })

    return NextResponse.json({ inspection })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar vistoria" }, { status: 500 })
  }
}
