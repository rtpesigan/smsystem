import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await prisma.storageCategory.findMany({
      include: {
        units: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const category = await prisma.storageCategory.create({
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        units: true,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
