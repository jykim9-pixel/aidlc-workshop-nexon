import { OrderStatus, SessionStatus } from '../constants';

export interface Store {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  storeId: string;
  username: string;
  createdAt: string;
}

export interface Table {
  id: string;
  storeId: string;
  tableNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Order {
  id: string;
  orderNumber: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
}
