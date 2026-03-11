import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaLog = process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error"] : ["error"]

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: prismaLog as ("query" | "info" | "warn" | "error")[],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
