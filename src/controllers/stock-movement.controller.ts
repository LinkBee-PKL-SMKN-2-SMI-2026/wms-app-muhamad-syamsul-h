import type { Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { AppError } from '../utils/AppError';
import type { AuthRequest } from '../models/auth.model';
import type {
    CreateInboundDTO,
    CreateOutboundDTO,
    GetMovementHistoryDTO,
} from '../models/stock-movement.dto';
import { logActivity } from '../services/activity-log.service';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const createInbound = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity, notes } = req.body as CreateInboundDTO;
    const userPayload = req.user as unknown as Record<string, unknown>;
    const userId = (req.user?.userId || userPayload?.id) as string;

    if (!userId) {
      throw new AppError('User ID tidak ditemukan', 401);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      });

      const movement = await tx.stock_Movements.create({
        data: {
          type: 'INBOUND',
          quantity,
          notes,
          userId,
          productId,
        },
      });

      return { movement, updatedProduct };
    });

    logActivity({ 
      userId, 
      action: 'CREATE', 
      entity: 'Stock_Movements', 
      entityId: result.movement.id, 
      detail: { type: 'INBOUND', productId, quantity } 
    });

    res.status(201).json({
      status: 'success',
      message: 'Barang masuk berhasil dicatat',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createOutbound = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity, notes } = req.body as CreateOutboundDTO;
    
    const userPayload = req.user as unknown as Record<string, unknown>;
    const userId = (req.user?.userId || userPayload?.id) as string;

    if (!userId) {
      throw new AppError('User ID tidak ditemukan', 401);
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }

    if (product.stock < quantity) {
      throw new AppError('Stok tidak mencukupi', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.products.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      const movement = await tx.stock_Movements.create({
        data: {
          type: 'OUTBOUND',
          quantity,
          notes,
          userId,
          productId,
        },
      });

      return { movement, updatedProduct };
    });

    logActivity({ 
      userId, 
      action: 'CREATE', 
      entity: 'Stock_Movements', 
      entityId: result.movement.id, 
      detail: { type: 'OUTBOUND', productId, quantity } 
    });

    res.status(201).json({
      status: 'success',
      message: 'Barang keluar berhasil dicatat',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovementHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as GetMovementHistoryDTO;
    
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    if (query.productId) {
      whereCondition.productId = query.productId;
    }

    if (query.type) {
      whereCondition.type = query.type;
    }

    if (query.startDate || query.endDate) {
      whereCondition.createdAt = {
        ...(query.startDate && { gte: new Date(query.startDate) }),
        ...(query.endDate && { lte: new Date(query.endDate) }),
      };
    }

    const [movements, totalData] = await prisma.$transaction([
        prisma.stock_Movements.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            quantity: true,
            notes: true,
            createdAt: true,
            product: { 
              select: {
                name: true,
                sku: true,
              },
            },
            user: { 
              select: {
                name: true,
              },
            },
          },
        }),
        prisma.stock_Movements.count({ where: whereCondition }),
      ]);

    const totalPages = Math.ceil(totalData / limit);

    res.status(200).json({
      status: 'success',
      data: movements,
      pagination: {
        page,
        limit,
        totalData,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};