import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { isValidOrderStatusTransition, CART_MAX_TYPES } from '@table-order/shared';
import { sseService } from '../sse/sse.service';

export class OrderService {
  async createOrder(tableId: string, sessionId: string | undefined, items: { menuItemId: string; quantity: number }[]) {
    if (!items || items.length === 0) {
      throw new AppError(400, 'Order must have at least one item');
    }
    if (items.length > CART_MAX_TYPES) {
      throw new AppError(400, `Maximum ${CART_MAX_TYPES} different items per order`);
    }

    // Get or create session
    let session = sessionId
      ? await prisma.tableSession.findFirst({ where: { id: sessionId, status: 'ACTIVE' } })
      : null;

    if (!session) {
      session = await prisma.tableSession.create({
        data: { tableId, status: 'ACTIVE' },
      });
    }

    // Fetch menu items for price snapshot
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new AppError(400, 'One or more menu items not found');
    }

    const menuMap = new Map(menuItems.map((m) => [m.id, m]));

    // Calculate total
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const menu = menuMap.get(item.menuItemId)!;
      const subtotal = menu.price * item.quantity;
      totalAmount += subtotal;
      return {
        menuItemId: item.menuItemId,
        menuName: menu.name,
        quantity: item.quantity,
        unitPrice: menu.price,
      };
    });

    // Generate order number
    const orderNumber = await this.generateOrderNumber(tableId);

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        sessionId: session.id,
        totalAmount,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Broadcast SSE event
    sseService.broadcast('order:created', order);

    return order;
  }

  async getOrders(filters: { sessionId?: string; tableId?: string; status?: string }) {
    const where: Record<string, unknown> = {};

    if (filters.sessionId) {
      where.sessionId = filters.sessionId;
    } else if (filters.tableId) {
      const activeSession = await prisma.tableSession.findFirst({
        where: { tableId: filters.tableId, status: 'ACTIVE' },
      });
      if (activeSession) {
        where.sessionId = activeSession.id;
      } else {
        return [];
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new AppError(404, 'Order not found');
    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, 'Order not found');

    if (!isValidOrderStatusTransition(order.status, newStatus)) {
      throw new AppError(400, `Invalid status transition: ${order.status} → ${newStatus}`);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as 'PENDING' | 'PREPARING' | 'COMPLETED' },
      include: { items: true },
    });

    sseService.broadcast('order:updated', updated);
    return updated;
  }

  async deleteOrder(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(404, 'Order not found');

    await prisma.order.delete({ where: { id: orderId } });
    sseService.broadcast('order:deleted', { orderId, sessionId: order.sessionId });
    return { success: true };
  }

  async getOrderHistory(tableId: string, dateFrom?: string, dateTo?: string) {
    const where: Record<string, unknown> = {
      session: {
        tableId,
        status: 'COMPLETED',
      },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    return prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateOrderNumber(tableId: string): Promise<string> {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { store: true },
    });

    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const hhmm = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    // Count today's orders for this store
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const count = await prisma.order.count({
      where: {
        session: { table: { storeId: table!.storeId } },
        createdAt: { gte: startOfDay },
      },
    });

    const seq = String(count + 1).padStart(3, '0');
    return `${table!.store.code}-${mmdd}-${hhmm}-${seq}`;
  }
}

export const orderService = new OrderService();
