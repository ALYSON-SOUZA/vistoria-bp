import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const entityMap: Record<string, string> = {
  users: "user",
  roles: "role",
  branches: "branch",
  departments: "department",
  portfolios: "portfolio",
  directorates: "directorate",
  managers: "manager",
}

const prismaModels: Record<string, any> = {
  user: prisma.user,
  role: prisma.role,
  branch: prisma.branch,
  department: prisma.department,
  portfolio: prisma.portfolio,
  directorate: prisma.directorate,
  manager: prisma.manager,
}

export async function PUT(request: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  try {
    const { entity, id } = await params
    const model = entityMap[entity]
    if (!model) return NextResponse.json({ error: "Entidade inválida" }, { status: 400 })

    const prismaModel = prismaModels[model]
    const body = await request.json()

    const data: any = { ...body }
    if (data.password && data.password.length < 20) {
      data.password = bcrypt.hashSync(data.password, 10)
    }
    if (data.id) delete data.id
    if (data.createdAt) delete data.createdAt
    if (data.created_at) delete data.created_at

    const updated = await prismaModel.update({
      where: { id: Number(id) },
      data,
    })
    const { password, ...rest } = updated
    return NextResponse.json(rest)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  try {
    const { entity, id } = await params
    const model = entityMap[entity]
    if (!model) return NextResponse.json({ error: "Entidade inválida" }, { status: 400 })

    const prismaModel = prismaModels[model]
    await prismaModel.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}
