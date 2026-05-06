import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { menuService } from './menu.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';

const categoriesRouter = Router();
const menusRouter = Router();

// --- Categories ---

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0).optional(),
});

// GET /api/categories
categoriesRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await menuService.getCategories(req.user!.storeId);
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
});

// POST /api/categories
categoriesRouter.post('/', requireAuth, requireAdmin, validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await menuService.createCategory(req.user!.storeId, req.body.name, req.body.sortOrder);
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
});

// PUT /api/categories/:id
categoriesRouter.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await menuService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
});

// DELETE /api/categories/:id
categoriesRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await menuService.deleteCategory(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// --- Menus ---

const createMenuSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
  categoryId: z.string().uuid(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// GET /api/menus
menusRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const items = await menuService.getMenuItems(req.user!.storeId, categoryId);
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

// POST /api/menus
menusRouter.post('/', requireAuth, requireAdmin, validate(createMenuSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await menuService.createMenuItem(req.user!.storeId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

// PUT /api/menus/:id
menusRouter.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

// DELETE /api/menus/:id
menusRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await menuService.deleteMenuItem(req.params.id);
    res.json({ success: true });
  } catch (error) { next(error); }
});

// PATCH /api/menus/reorder
menusRouter.patch('/reorder', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await menuService.reorderMenuItems(req.body.items);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export const menuRouter = { categories: categoriesRouter, menus: menusRouter };
