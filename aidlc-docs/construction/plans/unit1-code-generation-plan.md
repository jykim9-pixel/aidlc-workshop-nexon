# Code Generation Plan - Unit 1: 주문 플로우

## Unit Context

- **담당**: 개발자 A (본인)
- **패키지**: shared, backend (Auth/Menu/Order modules), customer-app
- **스토리**: US-C01~C16, US-A01~A03 (19개)
- **의존성**: Unit 0 (Foundation) 포함하여 구현

---

## Code Generation Steps

### Phase A: Foundation (Unit 0 포함)

- [x] Step 1: 모노레포 프로젝트 초기 설정
  - 루트 package.json (npm workspaces)
  - tsconfig.base.json
  - .gitignore, .env.example
  - docker-compose.yml (PostgreSQL)

- [x] Step 2: shared 패키지 설정
  - packages/shared/package.json, tsconfig.json
  - packages/shared/src/types/ (엔티티 타입, API 타입, Enum)
  - packages/shared/src/constants/ (OrderStatus, SessionStatus, API paths)
  - packages/shared/src/utils/ (formatCurrency, formatDate)

- [x] Step 3: backend 패키지 기본 구조
  - packages/backend/package.json, tsconfig.json
  - packages/backend/src/app.ts (Express 설정, CORS, JSON 파싱)
  - packages/backend/src/server.ts (서버 시작)
  - packages/backend/src/middleware/ (error handler, validation)
  - packages/backend/prisma/schema.prisma (전체 스키마)

- [ ] Step 4: customer-app 패키지 기본 구조
  - packages/customer-app/package.json, tsconfig.json
  - Vite + React + TypeScript + Tailwind 설정
  - packages/customer-app/src/main.tsx, App.tsx
  - packages/customer-app/src/api/client.ts (axios 인스턴스)

### Phase B: Backend - Auth Module

- [x] Step 5: Auth 서비스 구현
  - packages/backend/src/modules/auth/auth.service.ts
  - adminLogin, tableLogin, verifyToken, checkLoginAttempts
  - JWT 발급/검증 로직

- [x] Step 6: Auth 라우터 구현
  - packages/backend/src/modules/auth/auth.router.ts
  - POST /api/auth/admin/login
  - POST /api/auth/table/login
  - GET /api/auth/verify

- [x] Step 7: JWT 미들웨어
  - packages/backend/src/middleware/auth.middleware.ts
  - requireAuth (공통), requireAdmin, requireTable

- [ ] Step 8: Auth 단위 테스트
  - packages/backend/src/modules/auth/auth.service.test.ts

### Phase C: Backend - Menu Module

- [x] Step 9: Menu 서비스 구현
  - packages/backend/src/modules/menu/menu.service.ts
  - getCategories, createCategory, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems

- [x] Step 10: Menu 라우터 구현
  - packages/backend/src/modules/menu/menu.router.ts
  - GET/POST /api/categories, PUT/DELETE /api/categories/:id
  - GET/POST /api/menus, PUT/DELETE /api/menus/:id, PATCH /api/menus/reorder

- [ ] Step 11: Menu 단위 테스트
  - packages/backend/src/modules/menu/menu.service.test.ts

### Phase D: Backend - Order Module

- [x] Step 12: Order 서비스 구현
  - packages/backend/src/modules/order/order.service.ts
  - createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder
  - generateOrderNumber (ST01-MMDD-HHmm-NNN)

- [x] Step 13: Order 라우터 구현
  - packages/backend/src/modules/order/order.router.ts
  - POST /api/orders, GET /api/orders, GET /api/orders/:id
  - PATCH /api/orders/:id/status, DELETE /api/orders/:id

- [x] Step 14: SSE 기본 구조 (Unit 2 연동용)
  - packages/backend/src/modules/sse/sse.service.ts
  - addClient, removeClient, broadcast 기본 구현

- [ ] Step 15: Order 단위 테스트
  - packages/backend/src/modules/order/order.service.test.ts

### Phase E: Frontend - customer-app

- [ ] Step 16: 라우팅 및 레이아웃
  - React Router 설정
  - AppLayout, BottomNav 컴포넌트
  - 인증 가드 (ProtectedRoute)

- [ ] Step 17: Auth 기능 (SetupPage)
  - stores/authStore.ts (Zustand + persist)
  - pages/SetupPage.tsx
  - api/authApi.ts

- [ ] Step 18: Menu 기능 (MenuPage)
  - stores/menuStore.ts (또는 React Query)
  - pages/MenuPage.tsx
  - components/menu/ (CategoryNav, MenuGrid, MenuCard, MenuDetail)
  - api/menuApi.ts

- [ ] Step 19: Cart 기능 (CartPage)
  - stores/cartStore.ts (Zustand + persist, 20종류 제한)
  - pages/CartPage.tsx
  - components/cart/ (CartList, CartItem, CartSummary, CartEmpty)

- [ ] Step 20: Order 기능 (OrderConfirmPage, OrderSuccessPage)
  - stores/orderStore.ts
  - pages/OrderConfirmPage.tsx
  - pages/OrderSuccessPage.tsx (5초 리다이렉트)
  - api/orderApi.ts

- [ ] Step 21: Order History (OrderHistoryPage)
  - pages/OrderHistoryPage.tsx
  - components/order/ (OrderList, OrderCard, OrderStatus)

- [ ] Step 22: 공통 컴포넌트
  - components/common/ (Button, Modal, Toast, Loading, ErrorMessage)

### Phase F: Documentation & Deployment

- [x] Step 23: DB 마이그레이션 및 시드 데이터
  - prisma migrate dev
  - packages/backend/prisma/seed.ts (테스트용 매장/메뉴/테이블 데이터)

- [ ] Step 24: 코드 생성 요약 문서
  - aidlc-docs/construction/unit1-order-flow/code/code-summary.md

---

## Story Traceability

| Step | Stories |
|------|---------|
| Step 5-8 | US-A01, US-A02, US-A03, US-C01 |
| Step 9-11 | US-C02, US-C03, US-C04 |
| Step 12-15 | US-C11, US-C12, US-C13 |
| Step 16 | (공통 구조) |
| Step 17 | US-C01 |
| Step 18 | US-C02, US-C03, US-C04 |
| Step 19 | US-C05, US-C06, US-C07, US-C08, US-C09, US-C10 |
| Step 20 | US-C11, US-C12, US-C13 |
| Step 21 | US-C14, US-C15, US-C16 |
