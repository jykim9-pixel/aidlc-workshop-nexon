// SSE 관련 타입 정의

export enum SSEEventType {
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_DELETED = 'order:deleted',
  TABLE_COMPLETED = 'table:completed',
  CONNECTED = 'connected',
  HEARTBEAT = 'heartbeat',
}

export interface SSEEvent<T = unknown> {
  id: string;
  type: SSEEventType;
  data: T;
  timestamp: string;
}

// --- 이벤트 페이로드 타입 ---

export interface OrderCreatedPayload {
  orderId: string;
  tableId: string;
  tableNumber: number;
  items: Array<{
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  orderedAt: string;
}

export interface OrderUpdatedPayload {
  orderId: string;
  tableId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
}

export interface OrderDeletedPayload {
  orderId: string;
  tableId: string;
  deletedAt: string;
}

export interface TableCompletedPayload {
  tableId: string;
  tableNumber: number;
  sessionSummary: {
    totalAmount: number;
    orderCount: number;
    completedAt: string;
  };
}

// --- SSE 클라이언트 설정 ---

export interface SSEClientConfig {
  retryInterval: number; // ms (기본 3000)
  maxRetries: number; // 최대 재시도 횟수 (기본 10)
  heartbeatInterval: number; // ms (기본 30000)
}

export const DEFAULT_SSE_CONFIG: SSEClientConfig = {
  retryInterval: 3000,
  maxRetries: 10,
  heartbeatInterval: 30000,
};
