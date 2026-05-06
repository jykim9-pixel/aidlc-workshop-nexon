import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { sseService } from '../sse/sse.service';

export class TableService {
  /**
   * 매장의 테이블 목록 조회
   */
  async getTables(storeId: string) {
    return prisma.table.findMany({
      where: { storeId },
      orderBy: { tableNumber: 'asc' },
    });
  }

  /**
   * 테이블 요약 조회 (대시보드용)
   */
  async getTableSummary(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError(404, '테이블을 찾을 수 없습니다.');
    }

    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });

    if (!activeSession) {
      return {
        tableId: table.id,
        tableNumber: table.tableNumber,
        sessionId: null,
        totalAmount: 0,
        orderCount: 0,
        latestOrders: [],
      };
    }

    const orders = await prisma.order.findMany({
      where: { sessionId: activeSession.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    });

    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      tableId: table.id,
      tableNumber: table.tableNumber,
      sessionId: activeSession.id,
      totalAmount,
      orderCount: orders.length,
      latestOrders: orders.map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        orderedAt: order.createdAt.toISOString(),
        isNew: order.status === 'PENDING',
      })),
    };
  }

  /**
   * 현재 활성 세션 조회
   */
  async getActiveSession(tableId: string) {
    return prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });
  }

  /**
   * 새 세션 생성 (첫 주문 시 자동 호출)
   */
  async createSession(tableId: string) {
    // 기존 활성 세션 확인
    const existing = await this.getActiveSession(tableId);
    if (existing) return existing;

    return prisma.tableSession.create({
      data: { tableId, status: 'ACTIVE' },
    });
  }

  /**
   * 이용 완료 처리 (트랜잭션)
   */
  async completeTable(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError(404, '테이블을 찾을 수 없습니다.');
    }

    const activeSession = await prisma.tableSession.findFirst({
      where: { tableId, status: 'ACTIVE' },
    });

    if (!activeSession) {
      throw new AppError(400, '활성 세션이 없습니다.');
    }

    const now = new Date();

    // 트랜잭션: 세션 완료 처리
    await prisma.$transaction([
      prisma.tableSession.update({
        where: { id: activeSession.id },
        data: { status: 'COMPLETED', completedAt: now },
      }),
    ]);

    // SSE 이벤트 발행
    sseService.broadcast('table:completed', {
      tableId: table.id,
      tableNumber: table.tableNumber,
      completedAt: now.toISOString(),
    });

    return { success: true };
  }

  /**
   * 과거 주문 내역 조회
   */
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
}

export const tableService = new TableService();
