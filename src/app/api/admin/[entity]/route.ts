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

export async function GET(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params
    const model = entityMap[entity]
    if (!model) return NextResponse.json({ data: [] })

    const prismaModel = prismaModels[model]
    if (!prismaModel) return NextResponse.json({ data: [] })

    const include: any = {}
    if (model === "user") {
      include.role = true
      include.branch = true
      include.department = true
      include.portfolio = true
      include.directorate = true
    }

    const data = await prismaModel.findMany({
      ...(Object.keys(include).length ? { include } : {}),
      orderBy: { id: "asc" }
    })

    const sanitized = data.map((item: any) => {
      const { password, ...rest } = item
      return rest
    })

    return NextResponse.json({ data: sanitized })
  } catch {
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const { entity } = await params
    const model = entityMap[entity]
    if (!model) return NextResponse.json({ error: "Entidade inválida" }, { status: 400 })

    const prismaModel = prismaModels[model]
    const body = await request.json()

    const data: any = { ...body }
    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 10)
    }
    if (data.id) delete data.id
    if (data.createdAt) delete data.createdAt
    if (data.created_at) delete data.created_at

    if (data.roleId) data.roleId = Number(data.roleId)
    if (data.branchId) data.branchId = Number(data.branchId)
    if (data.departmentId) data.departmentId = Number(data.departmentId)
    if (data.portfolioId) data.portfolioId = Number(data.portfolioId)
    if (data.directorateId) data.directorateId = Number(data.directorateId)
    if (data.managerId) data.managerId = Number(data.managerId)

    const created = await prismaModel.create({ data })
    const { password, ...rest } = created
    return NextResponse.json(rest)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}
