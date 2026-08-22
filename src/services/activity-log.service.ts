import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface LogActivityParams {
  userId: string;
  action: string;    // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity: string;    // Categories, Locations, Products, Stock_Movements, Users
  entityId?: string; // UUID dari data yang diubah
  detail?: any; // Data tambahan (opsional)
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    await prisma.activity_Logs.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        detail: params.detail ?? undefined,
        userId: params.userId,
      },
    });
  } catch (error) {
    // Log error ke Pino, tapi JANGAN throw error
    // Activity log tidak boleh menggagalkan operasi utama
    logger.error({ event: 'ACTIVITY_LOG_ERROR', error }, 'Gagal mencatat activity log');
  }
};