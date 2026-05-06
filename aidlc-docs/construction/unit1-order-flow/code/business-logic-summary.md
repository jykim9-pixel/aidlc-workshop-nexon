# Unit 1: Business Logic Summary

## 구현된 서비스

### AuthService (`packages/backend/src/modules/auth/auth.service.ts`)
- `adminLogin()` — 관리자 로그인 (bcrypt 검증, JWT 발급, 시도 제한)
- `tableLogin()` — 테이블 로그인 (비밀번호 검증, 활성 세션 조회)
- `verifyToken()` — JWT 토큰 검증
- `checkLoginAttempts()` — 15분 내 5회 실패 시 잠금
- `recordLoginAttempt()` — 로그인 시도 기록

### MenuService (`packages/backend/src/modules/menu/menu.service.ts`)
- `getCategories()` — 매장 카테고리 목록 (sortOrder 정렬)
- `createCategory()` — 카테고리 생성 (중복 검증)
- `updateCategory()` — 카테고리 수정
- `deleteCategory()` — 카테고리 삭제 (하위 메뉴 존재 시 차단)
- `getMenuItems()` — 메뉴 목록 (카테고리 필터, sortOrder 정렬)
- `createMenuItem()` — 메뉴 등록 (가격 검증, 카테고리 소속 확인)
- `updateMenuItem()` — 메뉴 수정
- `deleteMenuItem()` — 메뉴 삭제
- `reorderMenuItems()` — 메뉴 순서 일괄 변경 (트랜잭션)

### OrderService (`packages/backend/src/modules/order/order.service.ts`)
- `createOrder()` — 주문 생성 (세션 자동 생성, 가격 스냅샷, 주문번호 생성, SSE 발행)
- `getOrders()` — 주문 목록 (sessionId/tableId/status 필터)
- `getOrderById()` — 주문 상세 조회
- `updateOrderStatus()` — 상태 변경 (단방향 전이 검증, SSE 발행)
- `deleteOrder()` — 주문 삭제 (CASCADE, SSE 발행)
- `getOrderHistory()` — 과거 주문 이력 (날짜 필터)
- `generateOrderNumber()` — 주문번호 생성 (ST01-MMDD-HHmm-NNN)

## 핵심 비즈니스 규칙 구현
- 주문 상태 전이: PENDING → PREPARING → COMPLETED (역방향 불가)
- 장바구니 최대 20종류 서버 검증
- 첫 주문 시 세션 자동 생성
- 주문 시점 메뉴명/가격 스냅샷 저장
- 로그인 5회 실패 시 15분 잠금
