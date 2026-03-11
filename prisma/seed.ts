import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import Decimal from "decimal.js"

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.storageUnit.deleteMany()
  await prisma.storageCategory.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  })

  const staff = await prisma.user.create({
    data: {
      email: "staff@example.com",
      password: hashedPassword,
      name: "Staff Member",
      role: "STAFF",
    },
  })

  console.log("✅ Users created")

  // Create storage categories
  const categories = await Promise.all([
    prisma.storageCategory.create({
      data: {
        name: "Personal Storage",
        description: "Individual storage for personal items and belongings",
        icon: "📦",
      },
    }),
    prisma.storageCategory.create({
      data: {
        name: "Business Storage",
        description: "Commercial storage for businesses",
        icon: "🏢",
      },
    }),
    prisma.storageCategory.create({
      data: {
        name: "Document Storage",
        description: "Climate controlled document storage",
        icon: "📄",
      },
    }),
    prisma.storageCategory.create({
      data: {
        name: "Cold Storage",
        description: "Temperature controlled storage",
        icon: "❄️",
      },
    }),
  ])

  console.log("✅ Categories created")

  // Create storage units
  const units = []
  for (let i = 0; i < 50; i++) {
    const unit = await prisma.storageUnit.create({
      data: {
        unitNumber: `A${String(i + 1).padStart(3, "0")}`,
        categoryId: categories[0].id,
        size: i % 3 === 0 ? "SMALL" : i % 3 === 1 ? "MEDIUM" : "LARGE",
        floorLevel: Math.floor(i / 10) + 1,
        pricePerMonth: new Decimal(25 + i),
        status: i % 3 === 0 ? "AVAILABLE" : "OCCUPIED",
        description: `Storage unit ${i + 1}`,
        qrCode: `QR-A${String(i + 1).padStart(3, "0")}`,
      },
    })
    units.push(unit)
  }

  console.log("✅ Storage units created")

  // Create customers
  const customers = []
  const customerNames = [
    { first: "John", last: "Doe" },
    { first: "Jane", last: "Smith" },
    { first: "Mike", last: "Johnson" },
    { first: "Sarah", last: "Williams" },
    { first: "David", last: "Brown" },
    { first: "Emily", last: "Davis" },
    { first: "Robert", last: "Miller" },
    { first: "Lisa", last: "Wilson" },
    { first: "James", last: "Moore" },
    { first: "Maria", last: "Taylor" },
  ]

  for (const name of customerNames) {
    const customer = await prisma.customer.create({
      data: {
        firstName: name.first,
        lastName: name.last,
        email: `${name.first.toLowerCase()}@example.com`,
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 900) + 100} Main St`,
        city: "New York",
        state: "NY",
        zipCode: "10001",
        idType: "Driver License",
        idNumber: `DL${Math.random().toString().substring(2, 10)}`,
      },
    })
    customers.push(customer)
  }

  console.log("✅ Customers created")

  // Create rentals
  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length]
    const unit = units[i]
    const startDate = new Date(2025, 0, 1 + i * 5)
    const endDate = new Date(2026, 0, 1 + i * 5)

    await prisma.rental.create({
      data: {
        customerId: customer.id,
        storageUnitId: unit.id,
        startDate,
        endDate,
        monthlyRate: unit.pricePerMonth,
        status: i % 5 === 0 ? "EXPIRED" : "ACTIVE",
      },
    })

    // Update unit status to OCCUPIED if rented
    await prisma.storageUnit.update({
      where: { id: unit.id },
      data: { status: "OCCUPIED" },
    })
  }

  console.log("✅ Rentals created")

  // Create payments
  for (const rental of await prisma.rental.findMany({
    include: { customer: true, storageUnit: true },
  })) {
    await prisma.payment.create({
      data: {
        rentalId: rental.id,
        customerId: rental.customerId,
        storageUnitId: rental.storageUnitId,
        amount: rental.monthlyRate,
        paymentDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: "CREDIT_CARD",
        status: Math.random() > 0.7 ? "PENDING" : "COMPLETED",
      },
    })
  }

  console.log("✅ Payments created")

  // Create activity logs
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "DATABASE_SEED",
      entityType: "SYSTEM",
      description: "Database seeded with sample data",
    },
  })

  console.log("✅ Activity logs created")

  console.log("🎉 Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
