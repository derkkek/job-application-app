import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma errors
export function handlePrismaError(error: any) {
  if (error.code === 'P2002') {
    return { message: 'A record with this unique field already exists' }
  }
  if (error.code === 'P2025') {
    return { message: 'Record not found' }
  }
  if (error.code === 'P2003') {
    return { message: 'Foreign key constraint failed' }
  }
  return { message: error.message || 'Database operation failed' }
}

// Database connection test
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    return { success: true, message: 'Database connected successfully' }
  } catch (error) {
    return { success: false, message: 'Database connection failed', error }
  } finally {
    await prisma.$disconnect()
  }
}
