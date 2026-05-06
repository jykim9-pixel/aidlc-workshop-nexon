# 서비스 레이어 설계 (Services)

## 백엔드 서비스 레이어

서비스 레이어는 라우터(컨트롤러)와 데이터 접근(Prisma) 사이에서 비즈니스 로직을 담당합니다.

```
Router (요청 파싱/응답) → Service (비즈니스 로직) → Prisma (DB 접근)
```

---

### 1. AuthService

**책임**: 인증 및 권한 관리 비즈니스 로직

| 메서드 | 설명 |
|--------|------|
| `adminLogin(storeId, username, password)` | 관리자 인증, JWT 발급, 로그인 시도 기록 |
| `tableLogin(storeId, tableNumber, password)` | 테이블 인증, 세션 확인/생성 |
| `verifyToken(token)` | JWT 토큰 검증 및 사용자 정보 반환 |
| `checkLoginAttempts(identifier)` | 로그인 시도 횟수 확인, 잠금 여부 판단 |
| `recordLoginAttempt(identifier, success)` | 로그인 시도 기록 |

---

### 2. MenuService

**책임**: 메뉴 및 카테고리 비즈니스 로직

| 메서드 | 설명 |
|--------|------|
| `getCategories(storeId)` | 매장의 카테고리 목록 조회 (정렬 순서) |
| `createCategory(storeId, data)` | 카테고리 생성, 중복 검증 |
| `updateCategory(categoryId, data)` | 카테고리 수정 |
| `deleteCategory(categoryId)` | 카테고리 삭제 (하위 메뉴 존재 시 에러) |
| `getMenuItems(storeId, categoryId?)` | 메뉴 목록 조회 (카테고리 필터, 정렬) |
| `createMenuItem(storeId, data)` | 메뉴 등록, 필수 필드/가격 검증 |
| `updateMenuItem(menuItemId, data)` | 메뉴 수정 |
| `deleteMenuItem(menuItemId)` | 메뉴 삭제 |
| `reorderMenuItems(items)` | 메뉴 순서 일괄 변경 |

---

### 3. OrderService

**책임**: 주문 처리 핵심 비즈니스 로직

| 메서드 | 설명 |
|--------|------|
| `createOrder(tableId, sessionId, items)` | 주문 생성, 금액 계산, 세션 검증, SSE 이벤트 발행 |
| `getOrders(filters)` | 주문 목록 조회 (테이블/세션/상태 필터) |
| `getOrderById(orderId)` | 주문 상세 조회 (항목 포함) |
| `updateOrderStatus(orderId, status)` | 주문 상태 변경, 유효 전이 검증, SSE 이벤트 발행 |
| `deleteOrder(orderId)` | 주문 삭제, SSE 이벤트 발행 |
| `getOrderHistory(tableId, dateRange)` | 과거 주문 이력 조회 |
| `calculateOrderTotal(items)` | 주문 총액 계산 |

**비즈니스 규칙 (상세는 Functional Design에서 정의):**
- 주문 상태 전이: 대기중 → 준비중 → 완료 (역방향 불가)
- 주문 생성 시 세션이 활성 상태여야 함
- 주문 삭제 시 테이블 총 주문액 재계산

---

### 4. TableService

**책임**: 테이블 및 세션 관리 비즈니스 로직

| 메서드 | 설명 |
|--------|------|
| `getTables(storeId)` | 매장의 테이블 목록 조회 |
| `createTable(storeId, data)` | 테이블 생성, 번호 중복 검증 |
| `updateTable(tableId, data)` | 테이블 정보 수정 |
| `deleteTable(tableId)` | 테이블 삭제 |
| `getTableSummary(tableId)` | 테이블 요약 (총 주문액, 최신 주문) |
| `completeTable(tableId)` | 이용 완료: 주문 이력 이동, 세션 종료, 리셋 |
| `getActiveSession(tableId)` | 현재 활성 세션 조회 |
| `createSession(tableId)` | 새 세션 생성 (첫 주문 시) |

**비즈니스 규칙 (상세는 Functional Design에서 정의):**
- 이용 완료 시 트랜잭션으로 원자적 처리
- 세션은 첫 주문 시 자동 생성
- 이용 완료 후 새 고객의 첫 주문 시 새 세션 시작

---

### 5. SSEService

**책임**: 실시간 이벤트 스트리밍 관리

| 메서드 | 설명 |
|--------|------|
| `addClient(clientId, response)` | SSE 클라이언트 연결 등록 |
| `removeClient(clientId)` | SSE 클라이언트 연결 해제 |
| `broadcast(event, data)` | 모든 연결된 클라이언트에 이벤트 전송 |
| `getConnectedClients()` | 현재 연결된 클라이언트 수 조회 |

---

## 서비스 간 상호작용

```
OrderService.createOrder()
  → TableService.getActiveSession()  // 세션 확인
  → TableService.createSession()     // 세션 없으면 생성
  → OrderService.calculateOrderTotal() // 금액 계산
  → Prisma (DB 저장)
  → SSEService.broadcast('order:created', order) // 실시간 알림

TableService.completeTable()
  → OrderService.getOrders(sessionId) // 현재 주문 조회
  → Prisma (트랜잭션: 이력 이동 + 세션 종료)
  → SSEService.broadcast('table:completed', tableId) // 실시간 알림
```
