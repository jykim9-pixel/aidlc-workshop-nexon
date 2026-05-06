import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES } from '@table-order/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '16h';

export class AuthService {
  async adminLogin(storeId: string, username: string, password: string) {
    const identifier = `${storeId}:${username}`;

    // Check login attempts
    const lockStatus = await this.checkLoginAttempts(identifier);
    if (lockStatus.locked) {
      throw new AppError(429, `Too many login attempts. Try again in ${lockStatus.remainingMinutes} minutes.`);
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { storeId_username: { storeId, username } },
    });

    if (!admin) {
      await this.recordLoginAttempt(identifier, false);
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      await this.recordLoginAttempt(identifier, false);
      throw new AppError(401, 'Invalid credentials');
    }

    await this.recordLoginAttempt(identifier, true);

    // Generate JWT
    const token = jwt.sign(
      { adminId: admin.id, storeId, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const expiresAt = new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString();

    return { token, expiresAt };
  }

  async tableLogin(storeId: string, tableNumber: number, password: string) {
    // Find table
    const table = await prisma.table.findUnique({
      where: { storeId_tableNumber: { storeId, tableNumber } },
    });

    if (!table) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, table.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Find active session
    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId: table.id, status: 'ACTIVE' },
    });

    // Generate JWT
    const token = jwt.sign(
      { tableId: table.id, storeId, sessionId: activeSession?.id || null, role: 'table' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const expiresAt = new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString();

    return {
      token,
      expiresAt,
      tableId: table.id,
      sessionId: activeSession?.id || null,
    };
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, user: decoded };
    } catch {
      return { valid: false, user: null };
    }
  }

  async checkLoginAttempts(identifier: string) {
    const since = new Date(Date.now() - LOGIN_LOCKOUT_MINUTES * 60 * 1000);

    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        identifier,
        success: false,
        attemptAt: { gte: since },
      },
    });

    if (failedAttempts >= LOGIN_MAX_ATTEMPTS) {
      const oldestAttempt = await prisma.loginAttempt.findFirst({
        where: { identifier, success: false, attemptAt: { gte: since } },
        orderBy: { attemptAt: 'asc' },
      });

      const unlockAt = new Date(oldestAttempt!.attemptAt.getTime() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
      const remainingMinutes = Math.ceil((unlockAt.getTime() - Date.now()) / 60000);

      return { locked: true, remainingMinutes };
    }

    return { locked: false, remainingMinutes: 0 };
  }

  async recordLoginAttempt(identifier: string, success: boolean) {
    await prisma.loginAttempt.create({
      data: { identifier, success },
    });
  }
}

export const authService = new AuthService();
