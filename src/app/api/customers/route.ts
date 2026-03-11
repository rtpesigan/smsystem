import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Received customer data:", body) // Debug log
    
    // Handle both new business fields and legacy fields
    const firstName = body.businessName || body.firstName || ""
    const lastName = body.contactPerson || body.lastName || ""
    
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: body.email || null,
        phone: body.phone || "",
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
      },
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer", details: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
