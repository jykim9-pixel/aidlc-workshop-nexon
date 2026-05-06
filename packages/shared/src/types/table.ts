// Table 관련 타입 정의

export enum TableStatus {
  IDLE = 'IDLE',
  OCCUPIED = 'OCCUPIED',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

// --- 엔티티 타입 ---

export interface Table {
  id: string;
  storeId: string;
  tableNumber: number;
  status: TableStatus;
  currentSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  totalAmount: number;
  orderCount: number;
}

// --- API 요청 타입 ---

export interface CreateTableInput {
  tableNumber: number;
  password: string;
}

export interface UpdateTableInput {
  tableNumber?: number;
  password?: string;
}

// --- API 응답 타입 ---

export interface TableSummary {
  tableId: string;
  tableNumber: number;
  status: TableStatus;
  sessionId: string | null;
  totalAmount: number;
  orderCount: number;
  latestOrders: OrderSummary[];
  hasNewOrder: boolean;
}

export interface OrderSummary {
  orderId: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  orderedAt: string;
  isNew: boolean;
}

export interface CompleteTableResponse {
  success: boolean;
  archivedOrders: number;
}
