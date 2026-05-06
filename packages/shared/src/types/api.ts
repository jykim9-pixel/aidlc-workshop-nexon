import { Order, MenuItem, Category, Table, TableSession } from './entities';

// Auth
export interface AdminLoginRequest {
  storeId: string;
  username: string;
  password: string;
}

export interface TableLoginRequest {
  storeId: string;
  tableNumber: number;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
}

export interface TableLoginResponse extends LoginResponse {
  tableId: string;
  sessionId: string | null;
}

// Menu
export interface CreateMenuItemRequest {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface CreateCategoryRequest {
  name: string;
  sortOrder?: number;
}

export interface ReorderMenuItemsRequest {
  items: { id: string; sortOrder: number }[];
}

// Order
export interface CreateOrderRequest {
  tableId: string;
  sessionId?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// Common
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// SSE Events
export interface SSEEvent {
  event: 'order:created' | 'order:updated' | 'order:deleted' | 'table:completed';
  data: {
    timestamp: string;
    payload: unknown;
  };
}
