import { PrismaClient, TableStatus, SessionStatus, OrderStatus } from '@prisma/client';
import { SSEEventType } from '@shared/types';
import { sseService } from '../sse/sse.service';

const prisma = new PrismaClient();

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
   * 테이블 생성
   */
  async createTable(storeId: string, data: { tableNumber: number; password: string }) {
    // 테이블 번호 중복 검증
    const existing = await prisma.table.findUnique({
      where: { storeId_tableNumber: { storeId, tableNumber: data.tableNumber } },
    });

    if (existing) {
      throw new AppError('DUPLICATE_TABLE_NUMBER', '이미 존재하는 테이블 번호입니다.', 409);
    }

    // 비밀번호는 실제로는 bcrypt 해싱 필요 (Unit 1 Auth Module에서 처리)
    return prisma.table.create({
      data: {
        storeId,
        tableNumber: data.tableNumber,
        password: data.password, // TODO: bcrypt hash
        status: TableStatus.IDLE,
      },
    });
  }

  /**
   * 테이블 수정
   */
  async updateTable(tableId: string, data: { tableNumber?: number; password?: string }) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError('NOT_FOUND', '테이블을 찾을 수 없습니다.', 404);
    }

    // 번호 변경 시 중복 검증
    if (data.tableNumber && data.tableNumber !== table.tableNumber) {
      const existing = await prisma.table.findUnique({
        where: {
          storeId_tableNumber: { storeId: table.storeId, tableNumber: data.tableNumber },
        },
      });
      if (existing) {
        throw new AppError('DUPLICATE_TABLE_NUMBER', '이미 존재하는 테이블 번호입니다.', 409);
      }
    }

    return prisma.table.update({
      where: { id: tableId },
      data: {
        ...(data.tableNumber && { tableNumber: data.tableNumber }),
        ...(data.password && { password: data.password }), // TODO: bcrypt hash
      },
    });
  }

  /**
   * 테이블 삭제
   */
  async deleteTable(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError('NOT_FOUND', '테이블을 찾을 수 없습니다.', 404);
    }

    if (table.status === TableStatus.OCCUPIED) {
      throw new AppError(
        'ACTIVE_SESSION_EXISTS',
        '활성 세션이 있는 테이블은 삭제할 수 없습니다. 먼저 이용 완료 처리해 주세요.',
        400,
      );
    }

    await prisma.table.delete({ where: { id: tableId } });
    return { success: true };
  }

  /**
   * 테이블 요약 조회 (대시보드용)
   */
  async getTableSummary(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError('NOT_FOUND', '테이블을 찾을 수 없습니다.', 404);
    }

    if (table.currentSessionId) {
      const orders = await prisma.order.findMany({
        where: { sessionId: table.currentSessionId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true },
      });

      const session = await prisma.tableSession.findUnique({
        where: { id: table.currentSessionId },
      });

      return {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: table.status,
        sessionId: table.currentSessionId,
        totalAmount: session?.totalAmount ?? 0,
        orderCount: session?.orderCount ?? 0,
        latestOrders: orders.map((order) => ({
          orderId: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
          orderedAt: order.createdAt.toISOString(),
          isNew: order.status === OrderStatus.PENDING,
        })),
        hasNewOrder: orders.some((o) => o.status === OrderStatus.PENDING),
      };
    }

    return {
      tableId: table.id,
      tableNumber: table.tableNumber,
      status: table.status,
      sessionId: null,
      totalAmount: 0,
      orderCount: 0,
      latestOrders: [],
      hasNewOrder: false,
    };
  }

  /**
   * 현재 활성 세션 조회
   */
  async getActiveSession(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table || !table.currentSessionId) return null;

    const session = await prisma.tableSession.findUnique({
      where: { id: table.currentSessionId },
    });

    if (!session || session.status === SessionStatus.COMPLETED) return null;
    return session;
  }

  /**
   * 새 세션 생성 (첫 주문 시 자동 호출)
   */
  async createSession(tableId: string) {
    const session = await prisma.tableSession.create({
      data: {
        tableId,
        status: SessionStatus.ACTIVE,
        totalAmount: 0,
        orderCount: 0,
      },
    });

    await prisma.table.update({
      where: { id: tableId },
      data: {
        currentSessionId: session.id,
        status: TableStatus.OCCUPIED,
      },
    });

    return session;
  }

  /**
   * 이용 완료 처리 (트랜잭션)
   */
  async completeTable(tableId: string) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new AppError('NOT_FOUND', '테이블을 찾을 수 없습니다.', 404);
    }

    if (!table.currentSessionId || table.status === TableStatus.IDLE) {
      throw new AppError('NO_ACTIVE_SESSION', '활성 세션이 없습니다.', 400);
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. 활성 세션의 모든 주문 조회
      const orders = await tx.order.findMany({
        where: { sessionId: table.currentSessionId! },
        include: { items: { include: { menuItem: true } } },
      });

      // 2. 주문을 OrderHistory로 변환 및 저장
      for (const order of orders) {
        await tx.orderHistory.create({
          data: {
            originalOrderId: order.id,
            tableId: table.id,
            tableNumber: table.tableNumber,
            sessionId: order.sessionId,
            totalAmount: order.totalAmount,
            status: order.status,
            orderedAt: order.createdAt,
            completedAt: now,
            items: {
              create: order.items.map((item) => ({
                menuItemName: item.menuItem.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              })),
            },
          },
        });
      }

      // 3. 활성 주문 삭제
      await tx.order.deleteMany({
        where: { sessionId: table.currentSessionId! },
      });

      // 4. 세션 상태 변경
      await tx.tableSession.update({
        where: { id: table.currentSessionId! },
        data: {
          status: SessionStatus.COMPLETED,
          completedAt: now,
        },
      });

      // 5. 테이블 상태 리셋
      await tx.table.update({
        where: { id: tableId },
        data: {
          currentSessionId: null,
          status: TableStatus.IDLE,
        },
      });

      return { archivedOrders: orders.length };
    });

    // 6. SSE 이벤트 발행
    sseService.broadcast(SSEEventType.TABLE_COMPLETED, {
      tableId: table.id,
      tableNumber: table.tableNumber,
      sessionSummary: {
        totalAmount: 0, // 리셋됨
        orderCount: result.archivedOrders,
        completedAt: now.toISOString(),
      },
    });

    return { success: true, archivedOrders: result.archivedOrders };
  }

  /**
   * 세션 금액 갱신 (주문 생성/삭제 시 호출)
   */
  async updateSessionTotals(sessionId: string) {
    const orders = await prisma.order.findMany({
      where: { sessionId },
    });

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    await prisma.tableSession.update({
      where: { id: sessionId },
      data: { totalAmount, orderCount },
    });
  }

  /**
   * 과거 주문 내역 조회
   */
  async getOrderHistory(filters: { tableId?: string; dateFrom?: string; dateTo?: string }) {
    const where: Record<string, unknown> = {};

    if (filters.tableId) {
      where.tableId = filters.tableId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.completedAt = {};
      if (filters.dateFrom) {
        (where.completedAt as Record<string, unknown>).gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        (where.completedAt as Record<string, unknown>).lte = new Date(filters.dateTo);
      }
    }

    return prisma.orderHistory.findMany({
      where,
      include: { items: true },
      orderBy: { completedAt: 'desc' },
    });
  }
}

// --- 에러 클래스 ---

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const tableService = new TableService();
