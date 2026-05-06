import { useDashboardStore } from './dashboardStore';
import { SSEEventType } from '@shared/types/sse';
import { TableStatus } from '@shared/types/table';

// Store 초기화 헬퍼
function resetStore() {
  useDashboardStore.setState({
    tables: [],
    selectedOrderId: null,
    isConnected: false,
    retryCount: 0,
    eventSource: null,
  });
}

describe('DashboardStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('handleSSEEvent - ORDER_CREATED', () => {
    it('해당 테이블에 새 주문을 추가해야 한다', () => {
      useDashboardStore.setState({
        tables: [
          {
            tableId: 't1',
            tableNumber: 1,
            status: TableStatus.OCCUPIED,
            sessionId: 's1',
            totalAmount: 10000,
            orderCount: 1,
            latestOrders: [],
            hasNewOrder: false,
          },
        ],
      });

      useDashboardStore.getState().handleSSEEvent(SSEEventType.ORDER_CREATED, {
        orderId: 'o1',
        tableId: 't1',
        tableNumber: 1,
        items: [{ menuItemName: '김치찌개', quantity: 1, unitPrice: 8000, subtotal: 8000 }],
        totalAmount: 8000,
        orderedAt: '2026-05-06T12:00:00Z',
      });

      const state = useDashboardStore.getState();
      expect(state.tables[0].totalAmount).toBe(18000);
      expect(state.tables[0].orderCount).toBe(2);
      expect(state.tables[0].latestOrders).toHaveLength(1);
      expect(state.tables[0].hasNewOrder).toBe(true);
    });
  });

  describe('handleSSEEvent - ORDER_UPDATED', () => {
    it('주문 상태를 갱신하고 PREPARING이면 isNew를 false로 설정해야 한다', () => {
      useDashboardStore.setState({
        tables: [
          {
            tableId: 't1',
            tableNumber: 1,
            status: TableStatus.OCCUPIED,
            sessionId: 's1',
            totalAmount: 8000,
            orderCount: 1,
            latestOrders: [
              {
                orderId: 'o1',
                status: 'PENDING',
                totalAmount: 8000,
                itemCount: 1,
                orderedAt: '2026-05-06T12:00:00Z',
                isNew: true,
              },
            ],
            hasNewOrder: true,
          },
        ],
      });

      useDashboardStore.getState().handleSSEEvent(SSEEventType.ORDER_UPDATED, {
        orderId: 'o1',
        tableId: 't1',
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        updatedAt: '2026-05-06T12:01:00Z',
      });

      const state = useDashboardStore.getState();
      expect(state.tables[0].latestOrders[0].status).toBe('PREPARING');
      expect(state.tables[0].latestOrders[0].isNew).toBe(false);
      expect(state.tables[0].hasNewOrder).toBe(false);
    });
  });

  describe('handleSSEEvent - ORDER_DELETED', () => {
    it('주문을 제거하고 금액을 재계산해야 한다', () => {
      useDashboardStore.setState({
        tables: [
          {
            tableId: 't1',
            tableNumber: 1,
            status: TableStatus.OCCUPIED,
            sessionId: 's1',
            totalAmount: 18000,
            orderCount: 2,
            latestOrders: [
              { orderId: 'o1', status: 'PENDING', totalAmount: 8000, itemCount: 1, orderedAt: '', isNew: true },
              { orderId: 'o2', status: 'PREPARING', totalAmount: 10000, itemCount: 2, orderedAt: '', isNew: false },
            ],
            hasNewOrder: true,
          },
        ],
      });

      useDashboardStore.getState().handleSSEEvent(SSEEventType.ORDER_DELETED, {
        orderId: 'o1',
        tableId: 't1',
        deletedAt: '2026-05-06T12:02:00Z',
      });

      const state = useDashboardStore.getState();
      expect(state.tables[0].totalAmount).toBe(10000);
      expect(state.tables[0].orderCount).toBe(1);
      expect(state.tables[0].latestOrders).toHaveLength(1);
      expect(state.tables[0].hasNewOrder).toBe(false);
    });
  });

  describe('handleSSEEvent - TABLE_COMPLETED', () => {
    it('테이블을 IDLE로 리셋해야 한다', () => {
      useDashboardStore.setState({
        tables: [
          {
            tableId: 't1',
            tableNumber: 1,
            status: TableStatus.OCCUPIED,
            sessionId: 's1',
            totalAmount: 25000,
            orderCount: 3,
            latestOrders: [
              { orderId: 'o1', status: 'COMPLETED', totalAmount: 8000, itemCount: 1, orderedAt: '', isNew: false },
            ],
            hasNewOrder: false,
          },
        ],
      });

      useDashboardStore.getState().handleSSEEvent(SSEEventType.TABLE_COMPLETED, {
        tableId: 't1',
        tableNumber: 1,
        sessionSummary: { totalAmount: 25000, orderCount: 3, completedAt: '2026-05-06T13:00:00Z' },
      });

      const state = useDashboardStore.getState();
      expect(state.tables[0].status).toBe(TableStatus.IDLE);
      expect(state.tables[0].totalAmount).toBe(0);
      expect(state.tables[0].orderCount).toBe(0);
      expect(state.tables[0].latestOrders).toHaveLength(0);
    });
  });

  describe('selectOrder', () => {
    it('선택된 주문 ID를 설정해야 한다', () => {
      useDashboardStore.getState().selectOrder('order-123');
      expect(useDashboardStore.getState().selectedOrderId).toBe('order-123');
    });

    it('null로 설정하면 선택을 해제해야 한다', () => {
      useDashboardStore.getState().selectOrder('order-123');
      useDashboardStore.getState().selectOrder(null);
      expect(useDashboardStore.getState().selectedOrderId).toBeNull();
    });
  });
});
