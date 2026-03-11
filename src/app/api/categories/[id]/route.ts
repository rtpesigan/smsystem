import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const body = await req.json()
    const category = await prisma.storageCategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        units: true,
      },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "UPDATE_CATEGORY",
          entityType: "StorageCategory",
          entityId: category.id,
          description: `Updated category ${category.name}`,
        },
      })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    const { id } = await params

    const unitsCount = await prisma.storageUnit.count({
      where: { categoryId: id },
    })
    if (unitsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing storage units" },
        { status: 400 }
      )
    }

    const existing = await prisma.storageCategory.findUnique({
      where: { id },
      select: { id: true, name: true },
    })

    await prisma.storageCategory.delete({
      where: { id },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_CATEGORY",
          entityType: "StorageCategory",
          entityId: id,
          description: `Deleted category ${existing?.name ?? id}`,
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
