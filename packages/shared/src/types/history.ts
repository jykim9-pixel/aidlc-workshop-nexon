// Order History 관련 타입 정의

export interface OrderHistory {
  id: string;
  originalOrderId: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  items: OrderHistoryItem[];
  totalAmount: number;
  status: string;
  orderedAt: string;
  completedAt: string;
}

export interface OrderHistoryItem {
  id: string;
  orderHistoryId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// --- API 요청 타입 ---

export interface HistoryFilters {
  tableId?: string;
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
}
