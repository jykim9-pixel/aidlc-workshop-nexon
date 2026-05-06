import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { sseService } from '../sse/sse.service';
import bcrypt from 'bcrypt';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

const createTableSchema = z.object({
  tableNumber: z.number().int().min(1),
  password: z.string().min(1).max(100),
});

// GET /api/tables
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await prisma.table.findMany({
      where: { storeId: req.user!.storeId },
      orderBy: { tableNumber: 'asc' },
    });
    res.json({ success: true, data: tables });
  } catch (error) { next(error); }
});

// POST /api/tables
router.post('/', requireAuth, requireAdmin, validate(createTableSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableNumber, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const table = await prisma.table.create({
      data: {
        storeId: req.user!.storeId,
        tableNumber,
        passwordHash,
      },
    });
    res.status(201).json({ success: true, data: table });
  } catch (error) { next(error); }
});

// PUT /api/tables/:id
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: Record<string, unknown> = {};
    if (req.body.tableNumber) data.tableNumber = req.body.tableNumber;
    if (req.body.password) data.passwordHash = await bcrypt.hash(req.body.password, 10);

    const table = await prisma.table.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: table });
  } catch (error) { next(error); }
});

// POST /api/tables/:id/complete
router.post('/:id/complete', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tableId = req.params.id;

    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });

    if (!activeSession) {
      throw new AppError(400, 'No active session for this table');
    }

    // Complete session in transaction
    await prisma.$transaction([
      prisma.tableSession.update({
        where: { id: activeSession.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      }),
    ]);

    sseService.broadcast('table:completed', { tableId });

    res.json({ success: true, data: { message: 'Table session completed' } });
  } catch (error) { next(error); }
});

// GET /api/tables/:id/summary
router.get('/:id/summary', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tableId = req.params.id;

    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });

    if (!activeSession) {
      res.json({ success: true, data: { totalAmount: 0, orderCount: 0, latestOrders: [] } });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { sessionId: activeSession.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalAmount,
        orderCount: orders.length,
        latestOrders: orders.slice(0, 3),
      },
    });
  } catch (error) { next(error); }
});

export { router as tableRouter };
