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

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string; tables?: string[] }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const rows: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const tables = Array.isArray(rows) ? rows.map((r: any) => r.table_name) : [];
    return {
      connected: true,
      message: tables.length > 0 
        ? `Database connected with ${tables.length} tables in public schema.` 
        : 'Database connected, but no tables exist in public schema. Run prisma db push.',
      tables,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection error: ${error.message || 'Check your DATABASE_URL in environment variables'}`,
    };
  }
}
