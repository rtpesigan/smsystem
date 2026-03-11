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
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
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
      prisma.rental.count({ where: { customerId: id } }),
      prisma.payment.count({ where: { customerId: id } }),
    ])

    if (rentalsCount > 0 || paymentsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete customer with existing rentals or payments. Cancel/expire rentals first.",
        },
        { status: 400 }
      )
    }

    const existing = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true },
    })

    await prisma.customer.delete({
      where: { id },
    })

    if (session?.user && (session.user as any).id) {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: "DELETE_CUSTOMER",
          entityType: "Customer",
          entityId: id,
          description: `Deleted customer ${existing ? `${existing.firstName} ${existing.lastName}` : id}`,
        },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}
