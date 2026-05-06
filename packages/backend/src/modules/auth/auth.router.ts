import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { validate } from '../../middleware/validation.middleware';

const router = Router();

const adminLoginSchema = z.object({
  storeId: z.string().uuid(),
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

const tableLoginSchema = z.object({
  storeId: z.string().uuid(),
  tableNumber: z.number().int().min(1),
  password: z.string().min(1).max(100),
});

// POST /api/auth/admin/login
router.post('/admin/login', validate(adminLoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId, username, password } = req.body;
    const result = await authService.adminLogin(storeId, username, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/table/login
router.post('/table/login', validate(tableLoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storeId, tableNumber, password } = req.body;
    const result = await authService.tableLogin(storeId, tableNumber, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/verify
router.get('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const result = authService.verifyToken(token);

  if (!result.valid) {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }

  res.json({ success: true, data: result.user });
});

export { router as authRouter };
