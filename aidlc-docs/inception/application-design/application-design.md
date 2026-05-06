# 테이블오더 서비스 - 통합 애플리케이션 설계

## 기술 스택 요약

| 레이어 | 기술 |
|--------|------|
| Backend Runtime | Node.js + Express (TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL |
| Real-time | Server-Sent Events (SSE) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Frontend Framework | React (TypeScript) |
| State Management | Zustand |
| Styling | Tailwind CSS |
| API Style | RESTful |
| Project Structure | Monorepo (npm workspaces) |

---

## 시스템 아키텍처

```
+--------------------------------------------------+
|                   Client Layer                     |
|                                                   |
|  +-------------------+   +---------------------+ |
|  |  customer-app     |   |    admin-app        | |
|  |  (React + TS)     |   |    (React + TS)     | |
|  |                   |   |                     | |
|  |  - Menu View      |   |  - Dashboard (SSE)  | |
|  |  - Cart (Zustand) |   |  - Table Mgmt       | |
|  |  - Order          |   |  - Menu Mgmt        | |
|  |  - Order History  |   |  - Order Mgmt       | |
|  +--------+----------+   +---------+-----------+ |
|           |                         |             |
+-----------+-------------------------+-------------+
            |          REST API       |
            v                         v
+--------------------------------------------------+
|                   Server Layer                     |
|                                                   |
|  +----------------------------------------------+|
|  |           Express + TypeScript                ||
|  |                                              ||
|  |  +--------+ +-------+ +-------+ +-----+     ||
|  |  |  Auth  | | Menu  | | Order | | SSE |     ||
|  |  | Module | |Module | |Module | |Mod. |     ||
|  |  +--------+ +-------+ +-------+ +-----+     ||
|  |  +--------+ +-------+                       ||
|  |  | Table  | | Store |                       ||
|  |  | Module | |Module |                       ||
|  |  +--------+ +-------+                       ||
|  +----------------------------------------------+|
|                       |                           |
+-----------------------+---------------------------+
                        | Prisma ORM
                        v
+--------------------------------------------------+
|                   Data Layer                       |
|                                                   |
|  +----------------------------------------------+|
|  |              PostgreSQL                       ||
|  |                                              ||
|  |  Store | Admin | Table | TableSession        ||
|  |  Category | MenuItem | Order | OrderItem     ||
|  |  OrderHistory | LoginAttempt                  ||
|  +----------------------------------------------+|
+--------------------------------------------------+
```

---

## 모노레포 구조

```
table-order/
├── packages/
│   ├── shared/              # 공유 타입, 상수, 유틸
│   │   ├── src/
│   │   │   ├── types/       # API 타입, 엔티티 타입
│   │   │   ├── constants/   # 상태값, API 경로
│   │   │   └── utils/       # 포맷팅, 검증 헬퍼
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/             # Express API 서버
│   │   ├── src/
│   │   │   ├── modules/     # Auth, Menu, Order, Table, SSE
│   │   │   ├── middleware/  # JWT, Error, Validation
│   │   │   ├── prisma/      # Schema, migrations
│   │   │   └── app.ts       # Express 앱 설정
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── customer-app/        # 고객용 React 앱
│   │   ├── src/
│   │   │   ├── components/  # UI 컴포넌트
│   │   │   ├── pages/       # 페이지 컴포넌트
│   │   │   ├── stores/      # Zustand 스토어
│   │   │   ├── hooks/       # 커스텀 훅
│   │   │   └── api/         # API 클라이언트
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin-app/           # 관리자용 React 앱
│       ├── src/
│       │   ├── components/  # UI 컴포넌트
│       │   ├── pages/       # 페이지 컴포넌트
│       │   ├── stores/      # Zustand 스토어
│       │   ├── hooks/       # 커스텀 훅 (SSE 등)
│       │   └── api/         # API 클라이언트
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml       # PostgreSQL + 개발 환경
├── package.json             # Workspace root
├── tsconfig.base.json       # 공통 TS 설정
└── .env.example             # 환경 변수 템플릿
```

---

## API 엔드포인트 요약

### 인증
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/admin/login` | - | 관리자 로그인 |
| POST | `/api/auth/table/login` | - | 테이블 로그인 |
| GET | `/api/auth/verify` | JWT | 토큰 검증 |

### 메뉴
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Table/Admin | 카테고리 목록 |
| POST | `/api/categories` | Admin | 카테고리 생성 |
| PUT | `/api/categories/:id` | Admin | 카테고리 수정 |
| DELETE | `/api/categories/:id` | Admin | 카테고리 삭제 |
| GET | `/api/menus` | Table/Admin | 메뉴 목록 |
| POST | `/api/menus` | Admin | 메뉴 등록 |
| PUT | `/api/menus/:id` | Admin | 메뉴 수정 |
| DELETE | `/api/menus/:id` | Admin | 메뉴 삭제 |
| PATCH | `/api/menus/reorder` | Admin | 순서 변경 |

### 주문
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Table | 주문 생성 |
| GET | `/api/orders` | Table/Admin | 주문 목록 |
| GET | `/api/orders/:id` | Table/Admin | 주문 상세 |
| PATCH | `/api/orders/:id/status` | Admin | 상태 변경 |
| DELETE | `/api/orders/:id` | Admin | 주문 삭제 |
| GET | `/api/orders/history` | Admin | 과거 내역 |

### 테이블
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tables` | Admin | 테이블 목록 |
| POST | `/api/tables` | Admin | 테이블 생성 |
| PUT | `/api/tables/:id` | Admin | 테이블 수정 |
| POST | `/api/tables/:id/complete` | Admin | 이용 완료 |
| GET | `/api/tables/:id/summary` | Admin | 테이블 요약 |

### 실시간
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events/orders` | Admin | SSE 스트림 |

---

## 데이터 모델 개요

### 핵심 엔티티 관계

```
Store (1) ----< (N) Admin
Store (1) ----< (N) Table
Store (1) ----< (N) Category
Category (1) --< (N) MenuItem
Table (1) ----< (N) TableSession
TableSession (1) --< (N) Order
Order (1) ----< (N) OrderItem
OrderItem (N) >---- (1) MenuItem
```

### 주요 Enum

```typescript
enum OrderStatus {
  PENDING = 'PENDING',       // 대기중
  PREPARING = 'PREPARING',   // 준비중
  COMPLETED = 'COMPLETED'    // 완료
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',         // 활성 (이용 중)
  COMPLETED = 'COMPLETED'    // 완료 (이용 완료)
}
```

---

## 인증 전략

### 관리자 인증
- JWT 토큰 (16시간 만료)
- 로그인: storeId + username + password
- bcrypt 해싱 (salt rounds: 10)
- 로그인 시도 5회 실패 시 15분 잠금

### 테이블 인증
- JWT 토큰 (16시간 만료)
- 로그인: storeId + tableNumber + password
- 로컬 스토리지에 토큰 저장 → 자동 로그인

---

## 실시간 통신 (SSE)

### 연결 관리
- 관리자 앱 로그인 시 SSE 연결 자동 수립
- 연결 끊김 시 3초 후 자동 재연결
- 하트비트: 30초 간격 ping

### 이벤트 구조
```typescript
interface SSEEvent {
  event: 'order:created' | 'order:updated' | 'order:deleted' | 'table:completed';
  data: {
    timestamp: string;
    payload: Order | { tableId: string };
  };
}
```
