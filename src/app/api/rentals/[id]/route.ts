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

    const rental = await prisma.rental.update({
      where: { id },
      data: {
        customerId: body.customerId,
        storageUnitId: body.storageUnitId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        monthlyRate: body.monthlyRate,
        status: body.status,
      },
      include: {
        customer: true,
        storageUnit: true,
      },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "UPDATE_RENTAL",
          entityType: "Rental",
          entityId: rental.id,
          description: `Updated rental ${rental.id}`,
        },
      })
    }

    return NextResponse.json(rental)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update rental" },
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

    const paymentsCount = await prisma.payment.count({
      where: { rentalId: id },
    })

    if (paymentsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete rental with existing payments. Delete payments first or cancel the rental instead.",
        },
        { status: 400 }
      )
    }

    const existing = await prisma.rental.findUnique({
      where: { id },
      select: {
        id: true,
        storageUnitId: true,
        customerId: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    await prisma.rental.delete({
      where: { id },
    })

    await prisma.storageUnit.update({
      where: { id: existing.storageUnitId },
      data: { status: "AVAILABLE" },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_RENTAL",
          entityType: "Rental",
          entityId: id,
          description: `Deleted rental ${id}`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete rental" },
      { status: 500 }
    )
  }
}
