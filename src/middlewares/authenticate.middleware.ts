import { type Response, type NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { type AuthRequest } from '../models/auth.model';
import { AppError } from '../utils/AppError';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Token tidak valid', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    return next(new AppError('Unauthorized', 401));
  }
};