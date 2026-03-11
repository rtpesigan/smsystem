import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [
      totalStorageUnits,
      totalCustomers,
      activeRentals,
      totalRevenue,
      pendingPayments,
      occupancyRate,
    ] = await Promise.all([
      prisma.storageUnit.count(),
      prisma.customer.count(),
      prisma.rental.count({
        where: {
          endDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "COMPLETED",
        },
      }),
      prisma.payment.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.storageUnit.count({
        where: {
          status: "OCCUPIED",
        },
      }),
    ])

    const totalUnits = await prisma.storageUnit.count()
    const occupancy =
      totalUnits > 0 ? Math.round((occupancyRate / totalUnits) * 100) : 0

    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    const revenueByMonth = await prisma.payment.groupBy({
      by: ["createdAt"],
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    })

    const categoryStats = await prisma.storageCategory.findMany({
      include: {
        _count: {
          select: { units: true },
        },
      },
    })

    return NextResponse.json({
      stats: {
        totalStorageUnits,
        totalCustomers,
        activeRentals,
        revenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        occupancyRate: occupancy,
      },
      recentActivity,
      revenueByMonth,
      categoryStats: categoryStats.map((cat) => ({
        name: cat.name,
        units: cat._count.units,
      })),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}
