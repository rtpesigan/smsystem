import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function monthKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function monthLabelFromKey(key: string) {
  const [y, m] = key.split("-")
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleString("en-US", { month: "long" })
}

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [
      totalRevenueAgg,
      activeRentals,
      totalCustomers,
      avgRentalAgg,
      unitsByCategory,
      rentalStatusAgg,
      payments,
      customers,
    ] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.rental.count({
        where: {
          status: "ACTIVE",
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      }),
      prisma.customer.count(),
      prisma.rental.aggregate({
        _avg: { monthlyRate: true },
        where: {
          status: "ACTIVE",
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      }),
      prisma.storageCategory.findMany({
        select: {
          name: true,
          units: {
            select: { id: true },
          },
        },
      }),
      prisma.rental.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.payment.findMany({
        where: {
          status: "COMPLETED",
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true, amount: true },
      }),
      prisma.customer.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
        },
        select: { createdAt: true },
      }),
    ])

    const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0)
    const avgRentalValue = Number(avgRentalAgg._avg.monthlyRate ?? 0)

    const keys: string[] = []
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo)
      d.setMonth(d.getMonth() + i)
      keys.push(monthKey(d))
    }

    const revenueByKey = new Map<string, number>()
    for (const p of payments) {
      const k = monthKey(p.createdAt)
      revenueByKey.set(k, (revenueByKey.get(k) || 0) + Number(p.amount || 0))
    }

    const customersByKey = new Map<string, number>()
    for (const c of customers) {
      const k = monthKey(c.createdAt)
      customersByKey.set(k, (customersByKey.get(k) || 0) + 1)
    }

    const revenueByMonth = keys.map((k) => ({
      month: monthLabelFromKey(k),
      revenue: revenueByKey.get(k) || 0,
      customers: customersByKey.get(k) || 0,
    }))

    const totalUnits = unitsByCategory.reduce((sum, cat) => sum + (cat.units?.length || 0), 0)
    const categoryDistribution = unitsByCategory
      .map((cat) => ({
        name: cat.name,
        value: totalUnits > 0 ? Math.round(((cat.units?.length || 0) / totalUnits) * 100) : 0,
      }))
      .filter((c) => c.value > 0)

    const rentalStatus = rentalStatusAgg.map((r) => ({
      name: r.status,
      value: r._count._all,
    }))

    return NextResponse.json({
      metrics: {
        totalRevenue,
        activeRentals,
        totalCustomers,
        avgRentalValue,
      },
      revenueByMonth,
      categoryDistribution,
      rentalStatus,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}
