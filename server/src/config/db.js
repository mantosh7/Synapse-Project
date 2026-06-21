import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected via Prisma ✓')
  } catch (err) {
    console.error('DB connection failed:', err)
    process.exit(1)
  }
}

export { prisma, connectDB }