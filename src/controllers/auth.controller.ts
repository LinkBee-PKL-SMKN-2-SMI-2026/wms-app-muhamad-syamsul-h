import { type Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { type AuthRequest, type TokenPayload } from '../models/auth.model';
import { type RegisterRequest, type LoginRequest } from '../models/auth.dto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const register = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, email, password }: RegisterRequest = req.body;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email sudah terdaftar', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Mencatat aktivitas registrasi
  logger.info(`User registered successfully: ${user.email}`);

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

export const login = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  // Mencatat aktivitas login
  logger.info(`User logged in successfully: ${user.email}`);

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.user as TokenPayload;

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  // Optional: mencatat akses profil
  logger.info(`User profile fetched: ${user.email}`);

  res.json({
    success: true,
    message: 'Data user berhasil diambil',
    data: user,
  });
});
