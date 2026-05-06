# Code Generation Plan - Unit 2: 관리 플로우 (Admin Experience)

## Unit 컨텍스트

### 담당 범위
- **백엔드**: SSE Module, Table Module, Order History, SSE 이벤트 발행
- **프론트엔드**: admin-app (대시보드, 메뉴 관리, 주문 이력)

### 구현 스토리
- US-A04: 테이블별 주문 대시보드 조회 (P0)
- US-A05: 실시간 신규 주문 수신 (P0)
- US-A06: 주문 상세 보기 (P0)
- US-A07: 주문 상태 변경 (P0)
- US-A08: 테이블별 필터링 (P2)
- US-A09: 테이블 초기 설정 (P0)
- US-A10: 주문 삭제 - 직권 수정 (P1)
- US-A11: 테이블 이용 완료 처리 (P1)
- US-A12: 과거 주문 내역 조회 (P1)
- US-A13: 메뉴 목록 조회 (P2)
- US-A14: 메뉴 등록 (P0)
- US-A15: 메뉴 수정 (P2)
- US-A16: 메뉴 삭제 (P2)
- US-A17: 메뉴 노출 순서 조정 (P2)

### 의존성
- Unit 0 (Foundation): 프로젝트 구조, Prisma 스키마, shared 타입, Express/React 기본 구조
- Unit 1 (주문 플로우): Auth Module (JWT 미들웨어), Order Module (주문 생성 시 SSE 연동)

### 코드 위치
- 백엔드: `packages/backend/src/modules/table/`, `packages/backend/src/modules/sse/`
- 프론트엔드: `packages/admin-app/src/`
- 공유 타입: `packages/shared/src/types/`

---

## 코드 생성 계획 (Generation Steps)

### 백엔드 - 비즈니스 로직

- [x] Step 1: SSE Service 구현
  - `packages/backend/src/modules/sse/sse.service.ts`
  - 클라이언트 연결 관리 (addClient, removeClient)
  - 이벤트 브로드캐스트 (broadcast)
  - Heartbeat 메커니즘 (30초 간격)
  - 연결 정리 로직
  - **스토리**: US-A05

- [x] Step 2: Table Service 구현
  - `packages/backend/src/modules/table/table.service.ts`
  - 테이블 CRUD (생성, 조회, 수정, 삭제)
  - 세션 관리 (getActiveSession, createSession)
  - 이용 완료 처리 (completeTable - 트랜잭션)
  - 테이블 요약 조회 (getTableSummary)
  - **스토리**: US-A09, US-A11

- [x] Step 3: Order History 로직 추가
  - `packages/backend/src/modules/table/table.service.ts` (completeTable 내)
  - 주문 이력 변환 및 저장 (스냅샷)
  - 이력 조회 (필터: tableId, dateFrom, dateTo)
  - **스토리**: US-A12

### 백엔드 - 비즈니스 로직 테스트

- [x] Step 4: SSE Service 단위 테스트
  - `packages/backend/src/modules/sse/sse.service.test.ts`
  - 클라이언트 등록/해제 테스트
  - 브로드캐스트 테스트 (다수 클라이언트)
  - 전송 실패 시 클라이언트 제거 테스트

- [x] Step 5: Table Service 단위 테스트
  - `packages/backend/src/modules/table/table.service.test.ts`
  - 테이블 CRUD 테스트
  - 세션 라이프사이클 테스트
  - 이용 완료 트랜잭션 테스트
  - 비즈니스 규칙 검증 (번호 중복, 활성 세션 삭제 불가 등)

### 백엔드 - 비즈니스 로직 요약

- [x] Step 6: 비즈니스 로직 요약 문서
  - `aidlc-docs/construction/unit2-admin-flow/code/business-logic-summary.md`

### 백엔드 - API 레이어

- [x] Step 7: SSE Controller 구현
  - `packages/backend/src/modules/sse/sse.controller.ts`
  - `GET /api/events/orders` — SSE 스트림 엔드포인트
  - JWT 인증 미들웨어 적용
  - SSE 헤더 설정
  - **스토리**: US-A05

- [x] Step 8: Table Controller 구현
  - `packages/backend/src/modules/table/table.controller.ts`
  - `GET /api/tables` — 테이블 목록 조회
  - `POST /api/tables` — 테이블 생성
  - `PUT /api/tables/:id` — 테이블 수정
  - `DELETE /api/tables/:id` — 테이블 삭제 (활성 세션 체크)
  - `POST /api/tables/:id/complete` — 이용 완료
  - `GET /api/tables/:id/summary` — 테이블 요약
  - **스토리**: US-A09, US-A11

- [x] Step 9: Order History 엔드포인트 추가
  - `packages/backend/src/modules/table/table.controller.ts` 또는 별도 라우터
  - `GET /api/orders/history` — 과거 주문 내역 조회
  - **스토리**: US-A12

- [x] Step 10: Category 관리 엔드포인트 추가
  - `packages/backend/src/modules/menu/menu.controller.ts` (기존 파일 수정)
  - `PUT /api/categories/:id` — 카테고리 수정
  - `DELETE /api/categories/:id` — 카테고리 삭제 (하위 메뉴 체크)
  - **스토리**: US-A13~A17 (메뉴 관리 API는 Unit 1에서 생성, Unit 2는 카테고리 수정/삭제 추가)

- [x] Step 11: SSE 이벤트 발행 연동
  - `packages/backend/src/modules/order/order.service.ts` (기존 파일 수정)
  - 주문 생성 시 `order:created` 이벤트 발행
  - 주문 상태 변경 시 `order:updated` 이벤트 발행
  - 주문 삭제 시 `order:deleted` 이벤트 발행
  - `packages/backend/src/modules/table/table.service.ts`
  - 이용 완료 시 `table:completed` 이벤트 발행
  - **스토리**: US-A05, US-A07, US-A10

### 백엔드 - API 레이어 테스트

- [x] Step 12: SSE Controller 테스트
  - `packages/backend/src/modules/sse/sse.controller.test.ts`
  - SSE 연결 설정 테스트
  - 인증 실패 테스트

- [x] Step 13: Table Controller 테스트
  - `packages/backend/src/modules/table/table.controller.test.ts`
  - 각 엔드포인트 요청/응답 테스트
  - 유효성 검증 에러 테스트
  - 비즈니스 규칙 위반 에러 테스트

### 백엔드 - API 레이어 요약

- [x] Step 14: API 레이어 요약 문서
  - `aidlc-docs/construction/unit2-admin-flow/code/api-layer-summary.md`

### 백엔드 - 데이터 레이어

- [x] Step 15: Prisma 스키마 업데이트
  - `packages/backend/prisma/schema.prisma` (기존 파일 수정)
  - Table 모델 추가/확인
  - TableSession 모델 추가
  - OrderHistory, OrderHistoryItem 모델 추가
  - 관계 정의

- [x] Step 16: 공유 타입 정의
  - `packages/shared/src/types/table.ts`
  - `packages/shared/src/types/sse.ts`
  - `packages/shared/src/types/history.ts`
  - TableStatus, SessionStatus, SSEEventType enum
  - API 요청/응답 타입

### 프론트엔드 - 컴포넌트

- [x] Step 17: Admin App 스토어 구현
  - `packages/admin-app/src/stores/dashboardStore.ts` — SSE 연결, 테이블 상태 관리
  - `packages/admin-app/src/stores/menuStore.ts` — 메뉴/카테고리 CRUD
  - `packages/admin-app/src/stores/historyStore.ts` — 과거 이력 조회
  - **스토리**: US-A04, US-A05

- [x] Step 18: Admin App Hooks 구현
  - `packages/admin-app/src/hooks/useSSE.ts` — SSE 연결/재연결 로직
  - `packages/admin-app/src/hooks/useTables.ts` — 테이블 데이터 관리
  - **스토리**: US-A05

- [x] Step 19: Admin App API 클라이언트
  - `packages/admin-app/src/api/tableApi.ts` — 테이블 API 호출
  - `packages/admin-app/src/api/sseApi.ts` — SSE 연결 설정
  - `packages/admin-app/src/api/menuApi.ts` — 메뉴 관리 API 호출
  - `packages/admin-app/src/api/historyApi.ts` — 이력 조회 API 호출

- [x] Step 20: DashboardPage 구현
  - `packages/admin-app/src/pages/DashboardPage.tsx`
  - `packages/admin-app/src/components/ConnectionStatus.tsx`
  - `packages/admin-app/src/components/TableGrid.tsx`
  - `packages/admin-app/src/components/TableCard.tsx`
  - `packages/admin-app/src/components/OrderDetailModal.tsx`
  - `packages/admin-app/src/components/CompleteConfirmModal.tsx`
  - **스토리**: US-A04, US-A05, US-A06, US-A07, US-A10, US-A11

- [x] Step 21: MenuManagementPage 구현
  - `packages/admin-app/src/pages/MenuManagementPage.tsx`
  - `packages/admin-app/src/components/CategorySidebar.tsx`
  - `packages/admin-app/src/components/MenuList.tsx`
  - `packages/admin-app/src/components/MenuFormModal.tsx`
  - `packages/admin-app/src/components/DeleteConfirmModal.tsx`
  - **스토리**: US-A13, US-A14, US-A15, US-A16, US-A17

- [x] Step 22: OrderHistoryPage 구현
  - `packages/admin-app/src/pages/OrderHistoryPage.tsx`
  - `packages/admin-app/src/components/HistoryFilter.tsx`
  - `packages/admin-app/src/components/HistoryList.tsx`
  - `packages/admin-app/src/components/HistoryDetailModal.tsx`
  - **스토리**: US-A12

- [x] Step 23: Admin App 라우팅 및 레이아웃
  - `packages/admin-app/src/App.tsx` (수정)
  - `packages/admin-app/src/pages/LoginPage.tsx`
  - `packages/admin-app/src/components/Layout.tsx` — 네비게이션 포함
  - 라우트 설정 (Login, Dashboard, MenuManagement, OrderHistory)

### 프론트엔드 - 테스트

- [x] Step 24: Store 단위 테스트
  - `packages/admin-app/src/stores/dashboardStore.test.ts`
  - `packages/admin-app/src/stores/menuStore.test.ts`
  - SSE 이벤트 핸들링 테스트
  - 상태 변경 로직 테스트

- [x] Step 25: 컴포넌트 단위 테스트
  - `packages/admin-app/src/components/TableCard.test.tsx`
  - `packages/admin-app/src/components/OrderDetailModal.test.tsx`
  - 렌더링 테스트, 사용자 인터랙션 테스트

### 프론트엔드 - 요약

- [x] Step 26: 프론트엔드 요약 문서
  - `aidlc-docs/construction/unit2-admin-flow/code/frontend-summary.md`

---

## 스토리 추적

| 스토리 ID | 구현 Step | 상태 |
|-----------|-----------|------|
| US-A04 | Step 17, 20 | [x] |
| US-A05 | Step 1, 7, 11, 17, 18, 20 | [x] |
| US-A06 | Step 20 | [x] |
| US-A07 | Step 11, 20 | [x] |
| US-A08 | Step 20 | [x] |
| US-A09 | Step 2, 8 | [x] |
| US-A10 | Step 11, 20 | [x] |
| US-A11 | Step 2, 8, 20 | [x] |
| US-A12 | Step 3, 9, 22 | [x] |
| US-A13 | Step 10, 21 | [x] |
| US-A14 | Step 21 | [x] |
| US-A15 | Step 21 | [x] |
| US-A16 | Step 21 | [x] |
| US-A17 | Step 21 | [x] |

---

## 생성 순서 원칙

1. **데이터 레이어 먼저** (Step 15-16): 스키마와 타입이 모든 코드의 기반
2. **비즈니스 로직** (Step 1-6): 서비스 레이어 구현 및 테스트
3. **API 레이어** (Step 7-14): 컨트롤러 구현 및 테스트
4. **프론트엔드** (Step 17-26): 백엔드 API 기반으로 UI 구현
