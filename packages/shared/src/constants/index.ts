export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null,
};

export const API_PATHS = {
  AUTH: {
    ADMIN_LOGIN: '/api/auth/admin/login',
    TABLE_LOGIN: '/api/auth/table/login',
    VERIFY: '/api/auth/verify',
  },
  CATEGORIES: '/api/categories',
  MENUS: '/api/menus',
  ORDERS: '/api/orders',
  TABLES: '/api/tables',
  EVENTS: '/api/events/orders',
} as const;

export const CART_MAX_TYPES = 20;
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const JWT_EXPIRY_HOURS = 16;
export const ORDER_SUCCESS_REDIRECT_SECONDS = 5;
