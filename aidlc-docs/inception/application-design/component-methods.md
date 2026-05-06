# 컴포넌트 메서드 시그니처 (Component Methods)

## 백엔드 API 엔드포인트

### Auth Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/auth/admin/login` | 관리자 로그인 | `{ storeId, username, password }` | `{ token, expiresAt }` |
| POST | `/api/auth/table/login` | 테이블 태블릿 로그인 | `{ storeId, tableNumber, password }` | `{ token, tableId, sessionId }` |
| POST | `/api/auth/logout` | 로그아웃 | - | `{ success }` |
| GET | `/api/auth/verify` | 토큰 검증 | Header: Authorization | `{ valid, user }` |

### Menu Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/categories` | 카테고리 목록 조회 | - | `Category[]` |
| POST | `/api/categories` | 카테고리 생성 | `{ name, sortOrder }` | `Category` |
| PUT | `/api/categories/:id` | 카테고리 수정 | `{ name, sortOrder }` | `Category` |
| DELETE | `/api/categories/:id` | 카테고리 삭제 | - | `{ success }` |
| GET | `/api/menus` | 메뉴 목록 조회 | Query: `?categoryId` | `MenuItem[]` |
| GET | `/api/menus/:id` | 메뉴 상세 조회 | - | `MenuItem` |
| POST | `/api/menus` | 메뉴 등록 | `{ name, price, description, categoryId, imageUrl, sortOrder }` | `MenuItem` |
| PUT | `/api/menus/:id` | 메뉴 수정 | `{ name, price, description, categoryId, imageUrl, sortOrder }` | `MenuItem` |
| DELETE | `/api/menus/:id` | 메뉴 삭제 | - | `{ success }` |
| PATCH | `/api/menus/reorder` | 메뉴 순서 변경 | `{ items: [{ id, sortOrder }] }` | `{ success }` |

### Order Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/orders` | 주문 생성 | `{ tableId, sessionId, items: [{ menuItemId, quantity, unitPrice }] }` | `Order` |
| GET | `/api/orders` | 주문 목록 조회 | Query: `?tableId&sessionId&status` | `Order[]` |
| GET | `/api/orders/:id` | 주문 상세 조회 | - | `Order` (with items) |
| PATCH | `/api/orders/:id/status` | 주문 상태 변경 | `{ status }` | `Order` |
| DELETE | `/api/orders/:id` | 주문 삭제 | - | `{ success }` |
| GET | `/api/orders/history` | 과거 주문 내역 | Query: `?tableId&dateFrom&dateTo` | `OrderHistory[]` |

### Table Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/tables` | 테이블 목록 조회 | - | `Table[]` |
| POST | `/api/tables` | 테이블 생성/설정 | `{ tableNumber, password }` | `Table` |
| PUT | `/api/tables/:id` | 테이블 수정 | `{ tableNumber, password }` | `Table` |
| DELETE | `/api/tables/:id` | 테이블 삭제 | - | `{ success }` |
| POST | `/api/tables/:id/complete` | 이용 완료 처리 | - | `{ success, archivedOrders }` |
| GET | `/api/tables/:id/summary` | 테이블 요약 (총 주문액) | - | `{ totalAmount, orderCount, latestOrders }` |

### SSE Module

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/events/orders` | 주문 이벤트 스트림 | Header: Authorization | SSE Stream |

**SSE 이벤트 타입:**
- `order:created` — 신규 주문 생성
- `order:updated` — 주문 상태 변경
- `order:deleted` — 주문 삭제
- `table:completed` — 테이블 이용 완료

---

## 프론트엔드 스토어 (Zustand)

### Customer App - Cart Store

```typescript
interface CartStore {
  items: CartItem[];
  addItem(menuItem: MenuItem): void;
  removeItem(menuItemId: string): void;
  updateQuantity(menuItemId: string, quantity: number): void;
  clearCart(): void;
  getTotalAmount(): number;
  getItemCount(): number;
}
```

### Customer App - Order Store

```typescript
interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  fetchOrders(sessionId: string): Promise<void>;
  createOrder(orderData: CreateOrderInput): Promise<Order>;
}
```

### Admin App - Dashboard Store

```typescript
interface DashboardStore {
  tables: TableSummary[];
  selectedTable: TableSummary | null;
  isConnected: boolean;
  connectSSE(): void;
  disconnectSSE(): void;
  selectTable(tableId: string): void;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;
  completeTable(tableId: string): Promise<void>;
}
```

### Admin App - Menu Store

```typescript
interface MenuStore {
  categories: Category[];
  menuItems: MenuItem[];
  isLoading: boolean;
  fetchCategories(): Promise<void>;
  fetchMenuItems(categoryId?: string): Promise<void>;
  createMenuItem(data: CreateMenuItemInput): Promise<MenuItem>;
  updateMenuItem(id: string, data: UpdateMenuItemInput): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  reorderMenuItems(items: { id: string; sortOrder: number }[]): Promise<void>;
}
```
