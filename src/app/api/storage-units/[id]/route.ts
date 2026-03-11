import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const unit = await prisma.storageUnit.update({
      where: { id },
      data: {
        unitNumber: body.unitNumber,
        categoryId: body.categoryId,
        size: body.size,
        floorLevel: body.floorLevel ?? body.floor,
        pricePerMonth: parseFloat(body.pricePerMonth),
        status: body.status,
      },
      include: {
        category: true,
      },
    })
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)

    const [rentalsCount, paymentsCount] = await Promise.all([
      prisma.rental.count({ where: { storageUnitId: id } }),
      prisma.payment.count({ where: { storageUnitId: id } }),
    ])

    if (rentalsCount > 0 || paymentsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete unit with existing rentals or payments. Cancel/expire rentals first.",
        },
        { status: 400 }
      )
    }

    const existing = await prisma.storageUnit.findUnique({
      where: { id },
      select: { id: true, unitNumber: true },
    })

    await prisma.storageUnit.delete({
      where: { id },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_STORAGE_UNIT",
          entityType: "StorageUnit",
          entityId: id,
          description: `Deleted storage unit ${existing?.unitNumber ?? id}`,
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    )
  }
}
