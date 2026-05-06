import { TableService, AppError } from './table.service';
import { PrismaClient, TableStatus, SessionStatus, OrderStatus } from '@prisma/client';

// Prisma Mock
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    table: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tableSession: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    orderHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    TableStatus: { IDLE: 'IDLE', OCCUPIED: 'OCCUPIED' },
    SessionStatus: { ACTIVE: 'ACTIVE', COMPLETED: 'COMPLETED' },
    OrderStatus: { PENDING: 'PENDING', PREPARING: 'PREPARING', COMPLETED: 'COMPLETED' },
  };
});

// SSE Service Mock
jest.mock('../sse/sse.service', () => ({
  sseService: {
    broadcast: jest.fn(),
  },
}));

describe('TableService', () => {
  let service: TableService;
  let prisma: any;

  beforeEach(() => {
    service = new TableService();
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getTables', () => {
    it('매장의 테이블 목록을 번호순으로 반환해야 한다', async () => {
      const mockTables = [
        { id: '1', storeId: 'store1', tableNumber: 1, status: 'IDLE' },
        { id: '2', storeId: 'store1', tableNumber: 2, status: 'OCCUPIED' },
      ];
      prisma.table.findMany.mockResolvedValue(mockTables);

      const result = await service.getTables('store1');

      expect(prisma.table.findMany).toHaveBeenCalledWith({
        where: { storeId: 'store1' },
        orderBy: { tableNumber: 'asc' },
      });
      expect(result).toEqual(mockTables);
    });
  });

  describe('createTable', () => {
    it('새 테이블을 생성해야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue(null);
      prisma.table.create.mockResolvedValue({
        id: '1',
        storeId: 'store1',
        tableNumber: 1,
        status: 'IDLE',
      });

      const result = await service.createTable('store1', {
        tableNumber: 1,
        password: '1234',
      });

      expect(result.tableNumber).toBe(1);
      expect(result.status).toBe('IDLE');
    });

    it('중복 테이블 번호 시 에러를 던져야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createTable('store1', { tableNumber: 1, password: '1234' }),
      ).rejects.toThrow(AppError);

      await expect(
        service.createTable('store1', { tableNumber: 1, password: '1234' }),
      ).rejects.toMatchObject({
        code: 'DUPLICATE_TABLE_NUMBER',
        statusCode: 409,
      });
    });
  });

  describe('deleteTable', () => {
    it('IDLE 상태의 테이블을 삭제해야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue({
        id: '1',
        status: 'IDLE',
      });
      prisma.table.delete.mockResolvedValue({});

      const result = await service.deleteTable('1');

      expect(result).toEqual({ success: true });
    });

    it('OCCUPIED 상태의 테이블 삭제 시 에러를 던져야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue({
        id: '1',
        status: 'OCCUPIED',
      });

      await expect(service.deleteTable('1')).rejects.toMatchObject({
        code: 'ACTIVE_SESSION_EXISTS',
        statusCode: 400,
      });
    });

    it('존재하지 않는 테이블 삭제 시 에러를 던져야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue(null);

      await expect(service.deleteTable('non-existent')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('createSession', () => {
    it('새 세션을 생성하고 테이블 상태를 OCCUPIED로 변경해야 한다', async () => {
      const mockSession = {
        id: 'session1',
        tableId: 'table1',
        status: 'ACTIVE',
        totalAmount: 0,
        orderCount: 0,
      };
      prisma.tableSession.create.mockResolvedValue(mockSession);
      prisma.table.update.mockResolvedValue({});

      const result = await service.createSession('table1');

      expect(result).toEqual(mockSession);
      expect(prisma.table.update).toHaveBeenCalledWith({
        where: { id: 'table1' },
        data: {
          currentSessionId: 'session1',
          status: 'OCCUPIED',
        },
      });
    });
  });

  describe('completeTable', () => {
    it('활성 세션이 없으면 에러를 던져야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue({
        id: '1',
        status: 'IDLE',
        currentSessionId: null,
      });

      await expect(service.completeTable('1')).rejects.toMatchObject({
        code: 'NO_ACTIVE_SESSION',
        statusCode: 400,
      });
    });

    it('존재하지 않는 테이블에 대해 에러를 던져야 한다', async () => {
      prisma.table.findUnique.mockResolvedValue(null);

      await expect(service.completeTable('non-existent')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('updateSessionTotals', () => {
    it('세션의 총 금액과 주문 수를 갱신해야 한다', async () => {
      prisma.order.findMany.mockResolvedValue([
        { totalAmount: 15000 },
        { totalAmount: 8000 },
      ]);
      prisma.tableSession.update.mockResolvedValue({});

      await service.updateSessionTotals('session1');

      expect(prisma.tableSession.update).toHaveBeenCalledWith({
        where: { id: 'session1' },
        data: { totalAmount: 23000, orderCount: 2 },
      });
    });
  });

  describe('getOrderHistory', () => {
    it('필터 없이 전체 이력을 조회해야 한다', async () => {
      prisma.orderHistory.findMany.mockResolvedValue([]);

      await service.getOrderHistory({});

      expect(prisma.orderHistory.findMany).toHaveBeenCalledWith({
        where: {},
        include: { items: true },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('tableId 필터를 적용해야 한다', async () => {
      prisma.orderHistory.findMany.mockResolvedValue([]);

      await service.getOrderHistory({ tableId: 'table1' });

      expect(prisma.orderHistory.findMany).toHaveBeenCalledWith({
        where: { tableId: 'table1' },
        include: { items: true },
        orderBy: { completedAt: 'desc' },
      });
    });

    it('날짜 범위 필터를 적용해야 한다', async () => {
      prisma.orderHistory.findMany.mockResolvedValue([]);

      await service.getOrderHistory({
        dateFrom: '2026-05-01T00:00:00Z',
        dateTo: '2026-05-06T23:59:59Z',
      });

      expect(prisma.orderHistory.findMany).toHaveBeenCalledWith({
        where: {
          completedAt: {
            gte: new Date('2026-05-01T00:00:00Z'),
            lte: new Date('2026-05-06T23:59:59Z'),
          },
        },
        include: { items: true },
        orderBy: { completedAt: 'desc' },
      });
    });
  });
});
