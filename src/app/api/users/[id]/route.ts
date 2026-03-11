import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const data: any = {
      name: body.name,
      email: body.email ? String(body.email).toLowerCase() : undefined,
      role: body.role,
      isActive: body.isActive,
    }

    if (body.password) {
      data.password = await bcrypt.hash(String(body.password), 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data,
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
          action: "UPDATE_USER",
          entityType: "User",
          entityId: user.id,
          description: `Updated user ${user.email}`,
        },
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    if ((session.user as any).id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    const activityCount = await prisma.activityLog.count({ where: { userId: id } })
    if (activityCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with existing activity logs. Deactivate instead." },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    })

    await prisma.user.delete({ where: { id } })

    if ((session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_USER",
          entityType: "User",
          entityId: id,
          description: `Deleted user ${existing?.email ?? id}`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
