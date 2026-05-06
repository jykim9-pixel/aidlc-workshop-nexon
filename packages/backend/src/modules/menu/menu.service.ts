import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';

export class MenuService {
  async getCategories(storeId: string) {
    return prisma.category.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(storeId: string, name: string, sortOrder?: number) {
    const existing = await prisma.category.findUnique({
      where: { storeId_name: { storeId, name } },
    });
    if (existing) {
      throw new AppError(409, 'Category already exists');
    }

    const order = sortOrder ?? (await this.getNextCategorySortOrder(storeId));

    return prisma.category.create({
      data: { storeId, name, sortOrder: order },
    });
  }

  async updateCategory(categoryId: string, data: { name?: string; sortOrder?: number }) {
    return prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  async deleteCategory(categoryId: string) {
    const menuCount = await prisma.menuItem.count({ where: { categoryId } });
    if (menuCount > 0) {
      throw new AppError(400, 'Cannot delete category with existing menu items');
    }
    return prisma.category.delete({ where: { id: categoryId } });
  }

  async getMenuItems(storeId: string, categoryId?: string) {
    return prisma.menuItem.findMany({
      where: {
        storeId,
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createMenuItem(storeId: string, data: {
    name: string;
    price: number;
    categoryId: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    if (data.price < 0) {
      throw new AppError(400, 'Price must be 0 or greater');
    }

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, storeId },
    });
    if (!category) {
      throw new AppError(400, 'Category not found in this store');
    }

    const order = data.sortOrder ?? (await this.getNextMenuSortOrder(data.categoryId));

    return prisma.menuItem.create({
      data: { storeId, ...data, sortOrder: order },
      include: { category: true },
    });
  }

  async updateMenuItem(menuItemId: string, data: {
    name?: string;
    price?: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    if (data.price !== undefined && data.price < 0) {
      throw new AppError(400, 'Price must be 0 or greater');
    }

    return prisma.menuItem.update({
      where: { id: menuItemId },
      data,
      include: { category: true },
    });
  }

  async deleteMenuItem(menuItemId: string) {
    return prisma.menuItem.delete({ where: { id: menuItemId } });
  }

  async reorderMenuItems(items: { id: string; sortOrder: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    return { success: true };
  }

  private async getNextCategorySortOrder(storeId: string): Promise<number> {
    const last = await prisma.category.findFirst({
      where: { storeId },
      orderBy: { sortOrder: 'desc' },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  private async getNextMenuSortOrder(categoryId: string): Promise<number> {
    const last = await prisma.menuItem.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: 'desc' },
    });
    return (last?.sortOrder ?? -1) + 1;
  }
}

export const menuService = new MenuService();
