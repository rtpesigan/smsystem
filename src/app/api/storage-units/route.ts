import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const units = await prisma.storageUnit.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Received data:", body) // Debug log
    
    const unit = await prisma.storageUnit.create({
      data: {
        unitNumber: body.unitNumber,
        categoryId: body.categoryId,
        size: body.size,
        floorLevel: parseInt(body.floorLevel) || 1,
        pricePerMonth: parseFloat(body.pricePerMonth) || 0,
        status: body.status || "AVAILABLE",
        description: body.description || null,
      },
      include: {
        category: true,
      },
    })
    return NextResponse.json(unit, { status: 201 })
  } catch (error: any) {
    console.error("Error creating unit:", error)
    return NextResponse.json(
      { error: "Failed to create unit", details: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
