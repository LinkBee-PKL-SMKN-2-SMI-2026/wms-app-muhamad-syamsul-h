import { type Response, type NextFunction } from 'express';
import { type AuthRequest, type TokenPayload } from '../models/auth.model';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppError } from '../utils/AppError';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { userId } = req.user as TokenPayload;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !roles.includes(user.role)) {
      return next(new AppError('Forbidden: Akses ditolak', 403));
    }

    next();
  };
};
