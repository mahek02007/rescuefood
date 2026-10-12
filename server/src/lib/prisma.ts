import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'PostgreSQL Database Connected Successfully' };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection error: ${error.message || 'Check your DATABASE_URL in server/.env'}`,
    };
  }
}
