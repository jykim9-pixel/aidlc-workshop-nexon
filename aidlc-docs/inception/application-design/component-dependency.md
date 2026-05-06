# 컴포넌트 의존성 관계 (Component Dependencies)

## 백엔드 의존성 매트릭스

```
+------------------+------+-------+------+-------+-----+-----+
|                  | Auth | Store | Table| Menu  |Order| SSE |
+------------------+------+-------+------+-------+-----+-----+
| Auth             |  -   |   R   |  R   |       |     |     |
| Store            |      |   -   |      |       |     |     |
| Table            |  D   |   R   |  -   |       |  R  |  W  |
| Menu             |  D   |   R   |      |   -   |     |     |
| Order            |  D   |       |  R   |   R   |  -  |  W  |
| SSE              |  D   |       |      |       |     |  -  |
+------------------+------+-------+------+-------+-----+-----+

D = Depends on (인증 필요)
R = Reads from (데이터 조회)
W = Writes to (이벤트 발행)
```

### 의존성 설명

| 관계 | 설명 |
|------|------|
| Auth → Store | 매장 식별자로 매장 존재 확인 |
| Auth → Table | 테이블 인증 시 테이블 정보 조회 |
| Table → Auth | 테이블 관리 API는 관리자 인증 필요 |
| Table → Order | 테이블 요약 시 주문 정보 조회 |
| Table → SSE | 이용 완료 시 SSE 이벤트 발행 |
| Menu → Auth | 메뉴 관리 API는 관리자 인증 필요 |
| Menu → Store | 매장별 메뉴 조회 |
| Order → Auth | 주문 API는 인증 필요 (테이블 또는 관리자) |
| Order → Table | 주문 생성 시 테이블/세션 확인 |
| Order → Menu | 주문 항목의 메뉴 정보 참조 |
| Order → SSE | 주문 생성/변경/삭제 시 SSE 이벤트 발행 |
| SSE → Auth | SSE 연결 시 관리자 인증 필요 |

---

## 프론트엔드 의존성

### Customer App

```
+----------+     +------+     +-------+
|   Auth   |---->| Menu |---->| Cart  |----> Order
+----------+     +------+     +-------+
     |                             |
     v                             v
  [LocalStorage]            [LocalStorage]
                            (persist)
```

| 컴포넌트 | 의존 대상 | 설명 |
|----------|-----------|------|
| Menu | Auth | 인증된 상태에서만 메뉴 조회 |
| Cart | Menu | 메뉴 정보를 장바구니에 추가 |
| Cart | LocalStorage | Zustand persist로 데이터 유지 |
| Order | Cart | 장바구니 데이터로 주문 생성 |
| Order | Auth | 세션 ID 포함하여 주문 전송 |

### Admin App

```
+----------+     +-----------+
|   Auth   |---->| Dashboard |<---- SSE
+----------+     +-----------+
     |                |
     v                v
+---------+    +-------------+
|  Menu   |    |   Table     |
|  Mgmt   |    | Management  |
+---------+    +-------------+
```

| 컴포넌트 | 의존 대상 | 설명 |
|----------|-----------|------|
| Dashboard | Auth | 인증된 관리자만 접근 |
| Dashboard | SSE | 실시간 주문 업데이트 수신 |
| Table Mgmt | Dashboard | 대시보드에서 테이블 관리 접근 |
| Menu Mgmt | Auth | 인증된 관리자만 접근 |

---

## 데이터 흐름

### 주문 생성 플로우

```
Customer App          Backend API              Admin App
     |                     |                       |
     |  POST /api/orders   |                       |
     |-------------------->|                       |
     |                     |  validate session     |
     |                     |  calculate total      |
     |                     |  save to DB           |
     |                     |                       |
     |  { order }          |  SSE: order:created   |
     |<--------------------|---------------------->|
     |                     |                       |
     |  show success       |          update dashboard
     |  clear cart         |          highlight new order
     |  redirect to menu   |                       |
```

### 이용 완료 플로우

```
Admin App             Backend API              Customer App
     |                     |                       |
     |  POST /tables/:id/  |                       |
     |  complete           |                       |
     |-------------------->|                       |
     |                     |  BEGIN TRANSACTION    |
     |                     |  move orders to       |
     |                     |    history            |
     |                     |  reset table          |
     |                     |  end session          |
     |                     |  COMMIT               |
     |                     |                       |
     |  { success }        |  SSE: table:completed |
     |<--------------------|---------------------->|
     |                     |                       |
     |  reset dashboard    |     (next customer    |
     |  card               |      starts fresh)    |
```

---

## 패키지 간 의존성

```
packages/shared (타입, 상수, 유틸)
     ^          ^          ^
     |          |          |
packages/   packages/   packages/
backend     customer-   admin-
            app         app
```

- `shared`는 다른 패키지에 의존하지 않음 (독립)
- `backend`, `customer-app`, `admin-app`은 모두 `shared`에 의존
- `backend`는 프론트엔드 패키지에 의존하지 않음
- `customer-app`과 `admin-app`은 서로 의존하지 않음
