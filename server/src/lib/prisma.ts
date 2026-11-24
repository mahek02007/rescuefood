import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Always cache client on globalThis in all environments to prevent connection exhaustion in serverless runtimes
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'Database Connected Successfully' };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection error: ${error.message || 'Check your DATABASE_URL in environment variables'}`,
    };
  }
}
