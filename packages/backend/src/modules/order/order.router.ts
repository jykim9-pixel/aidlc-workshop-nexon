import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from './order.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

const createOrderSchema = z.object({
  tableId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1).max(20),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'COMPLETED']),
});

// POST /api/orders
router.post('/', requireAuth, validate(createOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, sessionId, items } = req.body;
    const order = await orderService.createOrder(tableId, sessionId, items);
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
});

// GET /api/orders
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, tableId, status } = req.query;
    const orders = await orderService.getOrders({
      sessionId: sessionId as string,
      tableId: tableId as string,
      status: status as string,
    });
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
});

// GET /api/orders/history
router.get('/history', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, dateFrom, dateTo } = req.query;
    const orders = await orderService.getOrderHistory(
      tableId as string,
      dateFrom as string,
      dateTo as string
    );
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', requireAuth, requireAdmin, validate(updateStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

// DELETE /api/orders/:id
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export { router as orderRouter };
