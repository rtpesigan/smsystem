import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const rentals = await prisma.rental.findMany({
      include: {
        customer: true,
        storageUnit: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(rentals)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const rental = await prisma.rental.create({
      data: {
        customerId: body.customerId,
        storageUnitId: body.storageUnitId,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        monthlyRate: parseFloat(body.monthlyRate),
        status: body.status || "ACTIVE",
      },
      include: {
        customer: true,
        storageUnit: true,
      },
    })

    await prisma.storageUnit.update({
      where: { id: body.storageUnitId },
      data: { status: "OCCUPIED" },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "CREATE_RENTAL",
          entityType: "Rental",
          entityId: rental.id,
          description: `Created rental for unit ${rental.storageUnit.unitNumber}`,
        },
      })
    }

    return NextResponse.json(rental, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    )
  }
}
