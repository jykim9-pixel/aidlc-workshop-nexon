import { describe, it, expect, vi } from 'vitest';

// Mock prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    table: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    tableSession: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../sse/sse.service', () => ({
  sseService: { broadcast: vi.fn() },
}));

import { tableService } from './table.service';
import { prisma } from '../../lib/prisma';

describe('TableService', () => {
  describe('getTables', () => {
    it('should return tables for a store', async () => {
      const mockTables = [{ id: '1', tableNumber: 1 }];
      vi.mocked(prisma.table.findMany).mockResolvedValue(mockTables as never);

      const result = await tableService.getTables('store-1');
      expect(result).toEqual(mockTables);
    });
  });

  describe('getActiveSession', () => {
    it('should return active session for a table', async () => {
      const mockSession = { id: 'session-1', tableId: 'table-1', status: 'ACTIVE' };
      vi.mocked(prisma.tableSession.findFirst).mockResolvedValue(mockSession as never);

      const result = await tableService.getActiveSession('table-1');
      expect(result).toEqual(mockSession);
    });

    it('should return null if no active session', async () => {
      vi.mocked(prisma.tableSession.findFirst).mockResolvedValue(null);

      const result = await tableService.getActiveSession('table-1');
      expect(result).toBeNull();
    });
  });

  describe('getOrderHistory', () => {
    it('should return order history for a table', async () => {
      const mockOrders = [{ id: 'order-1', totalAmount: 10000 }];
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as never);

      const result = await tableService.getOrderHistory('table-1');
      expect(result).toEqual(mockOrders);
    });

    it('should filter by date range', async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);

      const result = await tableService.getOrderHistory('table-1', '2026-01-01', '2026-12-31');
      expect(result).toEqual([]);
      expect(prisma.order.findMany).toHaveBeenCalled();
    });
  });
});
