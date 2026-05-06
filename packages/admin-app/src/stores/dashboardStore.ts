import { create } from 'zustand';
import { TableSummary, OrderSummary, TableStatus } from '@shared/types/table';
import { SSEEventType, DEFAULT_SSE_CONFIG } from '@shared/types/sse';
import type {
  OrderCreatedPayload,
  OrderUpdatedPayload,
  OrderDeletedPayload,
  TableCompletedPayload,
} from '@shared/types/sse';
import { tableApi } from '../api/tableApi';

interface DashboardState {
  // 상태
  tables: TableSummary[];
  selectedOrderId: string | null;
  isConnected: boolean;
  retryCount: number;
  eventSource: EventSource | null;

  // SSE 관리
  connectSSE: () => void;
  disconnectSSE: () => void;
  handleSSEEvent: (type: SSEEventType, data: unknown) => void;

  // 대시보드 데이터
  fetchTables: () => Promise<void>;
  selectOrder: (orderId: string | null) => void;

  // 주문 액션
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // 테이블 액션
  completeTable: (tableId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  tables: [],
  selectedOrderId: null,
  isConnected: false,
  retryCount: 0,
  eventSource: null,

  connectSSE: () => {
    const { eventSource } = get();
    if (eventSource) return; // 이미 연결됨

    const token = localStorage.getItem('admin_token');
    const url = `/api/events/orders`;

    const es = new EventSource(url);

    es.addEventListener(SSEEventType.CONNECTED, () => {
      set({ isConnected: true, retryCount: 0 });
      // 연결 성공 시 대시보드 데이터 새로고침
      get().fetchTables();
    });

    es.addEventListener(SSEEventType.ORDER_CREATED, (event) => {
      const data = JSON.parse(event.data) as OrderCreatedPayload;
      get().handleSSEEvent(SSEEventType.ORDER_CREATED, data);
    });

    es.addEventListener(SSEEventType.ORDER_UPDATED, (event) => {
      const data = JSON.parse(event.data) as OrderUpdatedPayload;
      get().handleSSEEvent(SSEEventType.ORDER_UPDATED, data);
    });

    es.addEventListener(SSEEventType.ORDER_DELETED, (event) => {
      const data = JSON.parse(event.data) as OrderDeletedPayload;
      get().handleSSEEvent(SSEEventType.ORDER_DELETED, data);
    });

    es.addEventListener(SSEEventType.TABLE_COMPLETED, (event) => {
      const data = JSON.parse(event.data) as TableCompletedPayload;
      get().handleSSEEvent(SSEEventType.TABLE_COMPLETED, data);
    });

    es.onerror = () => {
      set({ isConnected: false });
      es.close();
      set({ eventSource: null });

      // 재연결 로직
      const { retryCount } = get();
      if (retryCount < DEFAULT_SSE_CONFIG.maxRetries) {
        set({ retryCount: retryCount + 1 });
        setTimeout(() => {
          get().connectSSE();
        }, DEFAULT_SSE_CONFIG.retryInterval);
      }
    };

    set({ eventSource: es });
  },

  disconnectSSE: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isConnected: false, retryCount: 0 });
    }
  },

  handleSSEEvent: (type, data) => {
    const { tables } = get();

    switch (type) {
      case SSEEventType.ORDER_CREATED: {
        const payload = data as OrderCreatedPayload;
        set({
          tables: tables.map((table) => {
            if (table.tableId !== payload.tableId) return table;
            const newOrder: OrderSummary = {
              orderId: payload.orderId,
              status: 'PENDING',
              totalAmount: payload.totalAmount,
              itemCount: payload.items.length,
              orderedAt: payload.orderedAt,
              isNew: true,
            };
            return {
              ...table,
              totalAmount: table.totalAmount + payload.totalAmount,
              orderCount: table.orderCount + 1,
              latestOrders: [newOrder, ...table.latestOrders].slice(0, 5),
              hasNewOrder: true,
            };
          }),
        });
        break;
      }

      case SSEEventType.ORDER_UPDATED: {
        const payload = data as OrderUpdatedPayload;
        set({
          tables: tables.map((table) => {
            if (table.tableId !== payload.tableId) return table;
            const updatedOrders = table.latestOrders.map((order) => {
              if (order.orderId !== payload.orderId) return order;
              return {
                ...order,
                status: payload.newStatus,
                isNew: payload.newStatus === 'PENDING',
              };
            });
            return {
              ...table,
              latestOrders: updatedOrders,
              hasNewOrder: updatedOrders.some((o) => o.isNew),
            };
          }),
        });
        break;
      }

      case SSEEventType.ORDER_DELETED: {
        const payload = data as OrderDeletedPayload;
        set({
          tables: tables.map((table) => {
            if (table.tableId !== payload.tableId) return table;
            const filteredOrders = table.latestOrders.filter(
              (o) => o.orderId !== payload.orderId,
            );
            const deletedOrder = table.latestOrders.find(
              (o) => o.orderId === payload.orderId,
            );
            return {
              ...table,
              totalAmount: table.totalAmount - (deletedOrder?.totalAmount ?? 0),
              orderCount: Math.max(0, table.orderCount - 1),
              latestOrders: filteredOrders,
              hasNewOrder: filteredOrders.some((o) => o.isNew),
            };
          }),
        });
        break;
      }

      case SSEEventType.TABLE_COMPLETED: {
        const payload = data as TableCompletedPayload;
        set({
          tables: tables.map((table) => {
            if (table.tableId !== payload.tableId) return table;
            return {
              ...table,
              status: TableStatus.IDLE,
              sessionId: null,
              totalAmount: 0,
              orderCount: 0,
              latestOrders: [],
              hasNewOrder: false,
            };
          }),
        });
        break;
      }
    }
  },

  fetchTables: async () => {
    try {
      const tables = await tableApi.getTablesWithSummary();
      set({ tables });
    } catch (error) {
      console.error('[DashboardStore] Failed to fetch tables:', error);
    }
  },

  selectOrder: (orderId) => {
    set({ selectedOrderId: orderId });
  },

  updateOrderStatus: async (orderId, status) => {
    await tableApi.updateOrderStatus(orderId, status);
  },

  deleteOrder: async (orderId) => {
    await tableApi.deleteOrder(orderId);
  },

  completeTable: async (tableId) => {
    await tableApi.completeTable(tableId);
  },
}));
