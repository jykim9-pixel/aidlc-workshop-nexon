# 통합 테스트 지침서 (Integration Test Instructions)

## 개요

통합 테스트는 Unit 1(주문 플로우)과 Unit 2(관리 플로우)가 올바르게 연동되는지 검증합니다.

---

## 사전 조건

- PostgreSQL 실행 중 (`docker-compose up -d`)
- DB 마이그레이션 완료 (`npx prisma migrate dev`)
- 시드 데이터 삽입 완료 (`npx tsx prisma/seed.ts`)
- 백엔드 서버 실행 중 (`npm run dev:backend`)

---

## 통합 테스트 시나리오

### 시나리오 1: 전체 주문 플로우

```
1. 관리자 로그인
   POST /api/auth/admin/login
   Body: { storeId: "<store-uuid>", username: "admin", password: "admin123" }
   → 200, token 반환

2. 테이블 로그인
   POST /api/auth/table/login
   Body: { storeId: "<store-uuid>", tableNumber: 1, password: "1234" }
   → 200, token + tableId 반환

3. 메뉴 조회
   GET /api/menus
   Header: Authorization: Bearer <table-token>
   → 200, 메뉴 목록 반환

4. 주문 생성
   POST /api/orders
   Header: Authorization: Bearer <table-token>
   Body: { tableId: "<table-uuid>", items: [{ menuItemId: "<menu-uuid>", quantity: 2 }] }
   → 201, 주문 생성 (세션 자동 생성)

5. SSE로 관리자에게 주문 전달 확인
   GET /api/events/orders
   Header: Authorization: Bearer <admin-token>
   → SSE 스트림에서 order:created 이벤트 수신

6. 주문 상태 변경
   PATCH /api/orders/<order-id>/status
   Header: Authorization: Bearer <admin-token>
   Body: { status: "PREPARING" }
   → 200, 상태 변경

7. 주문 내역 조회 (고객)
   GET /api/orders?sessionId=<session-id>
   Header: Authorization: Bearer <table-token>
   → 200, 상태가 PREPARING인 주문 확인
```

### 시나리오 2: 테이블 이용 완료 플로우

```
1. 관리자 로그인 (위와 동일)

2. 테이블 이용 완료
   POST /api/tables/<table-id>/complete
   Header: Authorization: Bearer <admin-token>
   → 200, 세션 종료

3. 테이블 요약 확인
   GET /api/tables/<table-id>/summary
   → totalAmount: 0, orderCount: 0

4. 과거 내역 조회
   GET /api/orders/history?tableId=<table-id>
   → 이전 세션의 주문 목록 반환

5. 새 고객 주문 (새 세션 자동 생성)
   POST /api/orders
   → 새 세션 ID로 주문 생성
```

### 시나리오 3: 비즈니스 규칙 검증

```
1. 역방향 상태 전이 차단
   PATCH /api/orders/<order-id>/status { status: "PENDING" }
   (현재 PREPARING인 주문)
   → 400, "Invalid status transition"

2. 장바구니 20종류 초과 차단
   POST /api/orders (21개 항목)
   → 400, "Maximum 20 different items per order"

3. 로그인 시도 제한
   POST /api/auth/admin/login (잘못된 비밀번호 5회)
   → 429, "Too many login attempts"

4. 카테고리 삭제 제한
   DELETE /api/categories/<id> (하위 메뉴 존재)
   → 400, "Cannot delete category with existing menu items"
```

---

## 수동 테스트 방법

### cURL 사용

```bash
# 1. 관리자 로그인
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"<uuid>","username":"admin","password":"admin123"}'

# 2. 메뉴 조회
curl http://localhost:3000/api/menus \
  -H "Authorization: Bearer <token>"

# 3. 주문 생성
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"tableId":"<uuid>","items":[{"menuItemId":"<uuid>","quantity":2}]}'
```

### Postman/Insomnia 사용
- 위 시나리오를 Postman Collection으로 구성 가능
- 환경 변수: `baseUrl`, `adminToken`, `tableToken`, `storeId`, `tableId`

---

## SSE 테스트

```bash
# SSE 스트림 연결 (별도 터미널)
curl -N http://localhost:3000/api/events/orders \
  -H "Authorization: Bearer <admin-token>"

# 다른 터미널에서 주문 생성 → SSE 스트림에 이벤트 출력 확인
```

---

## 성공 기준

| 항목 | 기준 |
|------|------|
| 주문 생성 → SSE 전달 | 2초 이내 |
| 상태 전이 검증 | 역방향 차단 확인 |
| 세션 관리 | 이용 완료 후 새 세션 독립 |
| 인증 | JWT 만료/무효 시 401 |
| 유효성 검증 | 잘못된 입력 시 400 |
