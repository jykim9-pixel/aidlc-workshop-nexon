# Unit of Work 정의 - 테이블오더 서비스

## 분해 전략
- **방식**: 기능 도메인 단위 (기능 슬라이스 순서로 구현)
- **팀 구성**: 2인 병렬 개발
- **원칙**: 각 Unit은 백엔드 API + 프론트엔드 UI를 수직으로 포함

---

## Unit 0: Foundation (공통 기반)

**담당**: 개발자 A + B (공동)
**목적**: 모든 Unit의 전제 조건이 되는 프로젝트 기반 구축

### 범위
- 모노레포 프로젝트 초기 설정 (npm workspaces)
- TypeScript 공통 설정 (tsconfig.base.json)
- Docker Compose (PostgreSQL)
- Prisma 스키마 정의 및 마이그레이션
- shared 패키지 (타입, 상수, 유틸)
- Express 앱 기본 구조 (미들웨어, 에러 핸들링)
- React 앱 기본 구조 (customer-app, admin-app)
- Tailwind CSS 설정

### 산출물
- `packages/shared/` — 타입, 상수, 유틸
- `packages/backend/` — Express 기본 구조 + Prisma 스키마
- `packages/customer-app/` — React 기본 구조
- `packages/admin-app/` — React 기본 구조
- `docker-compose.yml`
- 루트 설정 파일들

---

## Unit 1: 주문 플로우 (Customer Experience)

**담당**: 개발자 A
**목적**: 고객이 메뉴를 보고 주문하는 핵심 플로우 구현

### 범위

**백엔드:**
- Auth Module (테이블 로그인 + 관리자 로그인)
- Menu Module (카테고리/메뉴 CRUD + 조회)
- Order Module (주문 생성, 조회, 상태 변경, 삭제)
- JWT 미들웨어
- 요청 유효성 검증

**프론트엔드 (customer-app):**
- 자동 로그인 / 초기 설정 화면
- 메뉴 조회 (카테고리 네비게이션, 메뉴 카드)
- 장바구니 (Zustand + persist)
- 주문 생성 (확인 → 성공/실패)
- 주문 내역 조회

### API 엔드포인트
- `POST /api/auth/admin/login`
- `POST /api/auth/table/login`
- `GET /api/auth/verify`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/menus`
- `POST /api/menus`
- `PUT /api/menus/:id`
- `DELETE /api/menus/:id`
- `PATCH /api/menus/reorder`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `DELETE /api/orders/:id`

---

## Unit 2: 관리 플로우 (Admin Experience)

**담당**: 개발자 B
**목적**: 관리자가 실시간으로 주문을 모니터링하고 매장을 관리하는 플로우 구현

### 범위

**백엔드:**
- SSE Module (이벤트 스트리밍, 클라이언트 관리)
- Table Module (테이블 CRUD, 세션 관리, 이용 완료)
- Order History (과거 내역 조회)
- SSE 이벤트 발행 (Order Module과 연동)

**프론트엔드 (admin-app):**
- 관리자 로그인 화면
- 실시간 주문 대시보드 (SSE 연결, 테이블별 카드 그리드)
- 주문 상태 변경 UI
- 주문 상세 모달
- 테이블 관리 (초기 설정, 주문 삭제, 이용 완료)
- 과거 주문 내역 조회
- 메뉴 관리 UI (등록/수정/삭제/순서 조정)

### API 엔드포인트
- `GET /api/events/orders` (SSE)
- `GET /api/tables`
- `POST /api/tables`
- `PUT /api/tables/:id`
- `POST /api/tables/:id/complete`
- `GET /api/tables/:id/summary`
- `GET /api/orders/history`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

---

## 구현 순서 (기능 슬라이스)

```
Phase 1 (Week 1): Unit 0 — Foundation
  [A+B] 프로젝트 설정, DB 스키마, 공통 구조

Phase 2 (Week 2-3): Unit 1 + Unit 2 병렬 개발
  [A] Auth + Menu + Order API → customer-app
  [B] SSE + Table API → admin-app

Phase 3 (Week 4): 통합 및 검증
  [A+B] SSE 연동, 전체 플로우 테스트, 버그 수정
```

---

## 코드 조직 전략 (Greenfield)

```
table-order/
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── types/          # 엔티티, API 타입
│   │       ├── constants/      # OrderStatus, API paths
│   │       └── utils/          # formatCurrency, formatDate
│   │
│   ├── backend/
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # [Unit 1] controller, service, middleware
│   │       │   ├── menu/       # [Unit 1] controller, service
│   │       │   ├── order/      # [Unit 1] controller, service
│   │       │   ├── table/      # [Unit 2] controller, service
│   │       │   └── sse/        # [Unit 2] controller, service
│   │       ├── middleware/     # [Unit 0] JWT, error, validation
│   │       ├── prisma/         # [Unit 0] schema, migrations
│   │       └── app.ts          # [Unit 0] Express setup
│   │
│   ├── customer-app/           # [Unit 1]
│   │   └── src/
│   │       ├── pages/          # MenuPage, CartPage, OrderPage, HistoryPage
│   │       ├── components/     # MenuCard, CartItem, OrderConfirm
│   │       ├── stores/         # cartStore, orderStore, authStore
│   │       ├── hooks/          # useAuth, useMenu, useOrder
│   │       └── api/            # menuApi, orderApi, authApi
│   │
│   └── admin-app/              # [Unit 2]
│       └── src/
│           ├── pages/          # DashboardPage, MenuMgmtPage, LoginPage
│           ├── components/     # TableCard, OrderDetail, MenuForm
│           ├── stores/         # dashboardStore, menuStore, authStore
│           ├── hooks/          # useSSE, useAuth, useTables
│           └── api/            # orderApi, tableApi, menuApi, sseApi
│
├── docker-compose.yml          # [Unit 0]
├── package.json                # [Unit 0]
└── tsconfig.base.json          # [Unit 0]
```
