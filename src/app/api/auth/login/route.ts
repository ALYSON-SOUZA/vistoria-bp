import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { emailOrCpf, password } = await request.json()

    if (!emailOrCpf || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const user = await authenticateUser(emailOrCpf, password)

    if (!user) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos" },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    const sessionToken = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email })
    ).toString("base64")

    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        branch: user.branch,
        department: user.department,
        portfolio: user.portfolio,
        directorate: user.directorate,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
