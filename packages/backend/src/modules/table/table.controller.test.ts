import request from 'supertest';
import express from 'express';
import { tableController } from './table.controller';
import { tableService, AppError } from './table.service';

jest.mock('./table.service', () => ({
  tableService: {
    getTables: jest.fn(),
    createTable: jest.fn(),
    updateTable: jest.fn(),
    deleteTable: jest.fn(),
    completeTable: jest.fn(),
    getTableSummary: jest.fn(),
    getOrderHistory: jest.fn(),
  },
  AppError: class AppError extends Error {
    constructor(public code: string, message: string, public statusCode: number) {
      super(message);
      this.name = 'AppError';
    }
  },
}));

describe('Table Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Mock user middleware
    app.use((req: any, _res, next) => {
      req.user = { storeId: 'store1' };
      next();
    });
    app.use('/api/tables', tableController);
    jest.clearAllMocks();
  });

  describe('GET /api/tables', () => {
    it('테이블 목록을 반환해야 한다', async () => {
      const mockTables = [
        { id: '1', tableNumber: 1, status: 'IDLE' },
        { id: '2', tableNumber: 2, status: 'OCCUPIED' },
      ];
      (tableService.getTables as jest.Mock).mockResolvedValue(mockTables);

      const response = await request(app).get('/api/tables');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTables);
    });
  });

  describe('POST /api/tables', () => {
    it('유효한 입력으로 테이블을 생성해야 한다', async () => {
      const mockTable = { id: '1', tableNumber: 1, status: 'IDLE' };
      (tableService.createTable as jest.Mock).mockResolvedValue(mockTable);

      const response = await request(app)
        .post('/api/tables')
        .send({ tableNumber: 1, password: '1234' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTable);
    });

    it('tableNumber가 없으면 400을 반환해야 한다', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({ password: '1234' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('password가 4자리 미만이면 400을 반환해야 한다', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({ tableNumber: 1, password: '12' });

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].field).toBe('password');
    });

    it('중복 테이블 번호 시 409를 반환해야 한다', async () => {
      (tableService.createTable as jest.Mock).mockRejectedValue(
        new AppError('DUPLICATE_TABLE_NUMBER', '이미 존재하는 테이블 번호입니다.', 409),
      );

      const response = await request(app)
        .post('/api/tables')
        .send({ tableNumber: 1, password: '1234' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_TABLE_NUMBER');
    });
  });

  describe('DELETE /api/tables/:id', () => {
    it('IDLE 테이블을 삭제해야 한다', async () => {
      (tableService.deleteTable as jest.Mock).mockResolvedValue({ success: true });

      const response = await request(app).delete('/api/tables/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('활성 세션이 있으면 400을 반환해야 한다', async () => {
      (tableService.deleteTable as jest.Mock).mockRejectedValue(
        new AppError('ACTIVE_SESSION_EXISTS', '활성 세션이 있는 테이블은 삭제할 수 없습니다.', 400),
      );

      const response = await request(app).delete('/api/tables/1');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ACTIVE_SESSION_EXISTS');
    });
  });

  describe('POST /api/tables/:id/complete', () => {
    it('이용 완료를 처리해야 한다', async () => {
      (tableService.completeTable as jest.Mock).mockResolvedValue({
        success: true,
        archivedOrders: 3,
      });

      const response = await request(app).post('/api/tables/1/complete');

      expect(response.status).toBe(200);
      expect(response.body.archivedOrders).toBe(3);
    });

    it('활성 세션이 없으면 400을 반환해야 한다', async () => {
      (tableService.completeTable as jest.Mock).mockRejectedValue(
        new AppError('NO_ACTIVE_SESSION', '활성 세션이 없습니다.', 400),
      );

      const response = await request(app).post('/api/tables/1/complete');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_ACTIVE_SESSION');
    });
  });

  describe('GET /api/tables/:id/summary', () => {
    it('테이블 요약을 반환해야 한다', async () => {
      const mockSummary = {
        tableId: '1',
        tableNumber: 1,
        status: 'OCCUPIED',
        totalAmount: 25000,
        orderCount: 3,
        latestOrders: [],
        hasNewOrder: false,
      };
      (tableService.getTableSummary as jest.Mock).mockResolvedValue(mockSummary);

      const response = await request(app).get('/api/tables/1/summary');

      expect(response.status).toBe(200);
      expect(response.body.totalAmount).toBe(25000);
    });
  });

  describe('GET /api/tables/history', () => {
    it('과거 주문 내역을 반환해야 한다', async () => {
      (tableService.getOrderHistory as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/tables/history');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('필터를 적용해야 한다', async () => {
      (tableService.getOrderHistory as jest.Mock).mockResolvedValue([]);

      await request(app).get('/api/tables/history?tableId=t1&dateFrom=2026-05-01');

      expect(tableService.getOrderHistory).toHaveBeenCalledWith({
        tableId: 't1',
        dateFrom: '2026-05-01',
        dateTo: undefined,
      });
    });
  });
});
