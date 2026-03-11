import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    if (!body.email || !body.name || !body.password) {
      return NextResponse.json(
        { error: "name, email, and password are required" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(String(body.password), 10)

    const user = await prisma.user.create({
      data: {
        email: String(body.email).toLowerCase(),
        name: String(body.name),
        password: passwordHash,
        role: body.role || "STAFF",
        isActive: body.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    if ((session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "CREATE_USER",
          entityType: "User",
          entityId: user.id,
          description: `Created user ${user.email}`,
        },
      })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
