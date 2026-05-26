import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compareSync(plain, hashed)
}

export async function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10)
}

export async function authenticateUser(emailOrCpf: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrCpf },
        { cpf: emailOrCpf },
      ],
    },
    include: {
      role: true,
      branch: true,
      department: true,
      portfolio: true,
      directorate: true,
    },
  })

  if (!user) return null

  const valid = await verifyPassword(password, user.password)
  if (!valid) return null

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: true,
      branch: true,
      department: true,
      portfolio: true,
      directorate: true,
    },
  })
  if (!user) return null
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserIdFromSession(): Promise<number | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("session")
    if (!session?.value) return null
    const decoded = JSON.parse(Buffer.from(session.value, "base64").toString())
    return decoded.userId || null
  } catch {
    return null
  }
}
