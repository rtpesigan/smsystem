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

    const requestedStatus = body.status
    const paymentDate =
      requestedStatus === "COMPLETED"
        ? new Date()
        : body.paymentDate
          ? new Date(body.paymentDate)
          : undefined

    const updateData: any = {
      amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paymentMethod: body.paymentMethod,
      status: requestedStatus,
      notes: body.notes,
    }
    if (paymentDate) updateData.paymentDate = paymentDate

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
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
          action: "UPDATE_PAYMENT",
          entityType: "Payment",
          entityId: payment.id,
          description: `Updated payment ${payment.id}`,
        },
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to update payment" },
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

    const existing = await prisma.payment.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    await prisma.payment.delete({
      where: { id },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_PAYMENT",
          entityType: "Payment",
          entityId: id,
          description: `Deleted payment ${id}`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}
