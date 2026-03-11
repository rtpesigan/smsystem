import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        rental: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const now = new Date()
    const withComputedStatus = payments.map((p) => {
      if (p.status === "PENDING" && p.dueDate && p.dueDate < now) {
        return { ...p, status: "OVERDUE" as const }
      }
      return p
    })

    return NextResponse.json(withComputedStatus)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    if (!body.rentalId) {
      return NextResponse.json({ error: "rentalId is required" }, { status: 400 })
    }
    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: "paymentMethod is required" },
        { status: 400 }
      )
    }

    const requestedStatus = body.status || "PENDING"
    if (!['COMPLETED', 'PENDING', 'OVERDUE', 'CANCELLED'].includes(requestedStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const rental = await prisma.rental.findUnique({
      where: { id: body.rentalId },
      select: { id: true, customerId: true, storageUnitId: true },
    })
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 })
    }

    const paymentDate =
      requestedStatus === "COMPLETED"
        ? new Date()
        : body.paymentDate
          ? new Date(body.paymentDate)
          : undefined

    const createData: any = {
      rentalId: rental.id,
      customerId: rental.customerId,
      storageUnitId: rental.storageUnitId,
      amount: parseFloat(body.amount),
      dueDate: new Date(body.dueDate),
      paymentMethod: body.paymentMethod,
      status: requestedStatus,
    }
    if (paymentDate) createData.paymentDate = paymentDate

    const payment = await prisma.payment.create({
      data: {
        ...(createData as any),
      },
      include: {
        rental: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "CREATE_PAYMENT",
          entityType: "Payment",
          entityId: payment.id,
          description: `Created payment ${payment.id}`,
        },
      })
    }
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}
