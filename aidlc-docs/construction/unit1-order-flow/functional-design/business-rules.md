# Unit 1: 비즈니스 규칙 및 유효성 검증

## 인증 규칙

| 규칙 ID | 규칙 | 조건 | 결과 |
|---------|------|------|------|
| AUTH-01 | 로그인 시도 제한 | 15분 내 5회 연속 실패 | 15분 잠금 |
| AUTH-02 | JWT 만료 | 발급 후 16시간 경과 | 토큰 무효, 재로그인 필요 |
| AUTH-03 | 비밀번호 해싱 | 저장 시 | bcrypt, salt rounds: 10 |
| AUTH-04 | 테이블 인증 | storeId + tableNumber + password | 일치 시 JWT 발급 |

---

## 메뉴 규칙

| 규칙 ID | 규칙 | 조건 | 결과 |
|---------|------|------|------|
| MENU-01 | 필수 필드 | name, price, categoryId 미입력 | 400 에러 |
| MENU-02 | 가격 범위 | price < 0 | 400 에러 (0원 이상 허용) |
| MENU-03 | 카테고리 소속 | categoryId가 같은 storeId에 없음 | 400 에러 |
| MENU-04 | 카테고리 이름 중복 | 같은 storeId 내 동일 이름 | 409 에러 |
| MENU-05 | 정렬 순서 | sortOrder 미지정 | 해당 카테고리 마지막 + 1 |

---

## 장바구니 규칙 (클라이언트 측)

| 규칙 ID | 규칙 | 조건 | 결과 |
|---------|------|------|------|
| CART-01 | 최대 항목 수 | 20종류 초과 시 | 추가 불가, 안내 메시지 |
| CART-02 | 최소 수량 | 수량 < 1 | 해당 항목 자동 삭제 |
| CART-03 | 중복 메뉴 추가 | 이미 장바구니에 있는 메뉴 | 수량 +1 |
| CART-04 | 데이터 유지 | 페이지 새로고침 | localStorage에서 복원 |
| CART-05 | 장바구니 비우기 | 주문 성공 시 | 자동 비우기 |
| CART-06 | 총 금액 계산 | 항목 변경 시 | SUM(unitPrice * quantity) 즉시 재계산 |

---

## 주문 규칙

| 규칙 ID | 규칙 | 조건 | 결과 |
|---------|------|------|------|
| ORD-01 | 빈 주문 불가 | items 배열이 비어있음 | 400 에러 |
| ORD-02 | 세션 자동 생성 | 활성 세션 없이 주문 | 새 세션 생성 후 주문 |
| ORD-03 | 가격 스냅샷 | 주문 생성 시 | 현재 메뉴 가격을 OrderItem에 저장 |
| ORD-04 | 주문 번호 형식 | 생성 시 | {매장코드}-{MMDD}-{HHmm}-{순번3자리} |
| ORD-05 | 상태 전이 | 변경 시 | PENDING→PREPARING→COMPLETED만 허용 |
| ORD-06 | 역방향 불가 | PREPARING→PENDING 등 | 400 에러 |
| ORD-07 | 주문 삭제 | 삭제 시 | OrderItem CASCADE 삭제 |
| ORD-08 | 장바구니 항목 수 | 서버 검증 | 최대 20종류 초과 시 400 에러 |

---

## 세션 규칙

| 규칙 ID | 규칙 | 조건 | 결과 |
|---------|------|------|------|
| SES-01 | 세션 생성 시점 | 첫 주문 생성 시 | 자동 생성 (ACTIVE) |
| SES-02 | 중복 방지 | 이미 ACTIVE 세션 존재 | 기존 세션 사용 |
| SES-03 | 세션 범위 | 주문 조회 시 | 현재 ACTIVE 세션의 주문만 표시 |
| SES-04 | 이전 세션 격리 | COMPLETED 세션 | 고객 화면에 표시하지 않음 |

---

## 유효성 검증 스키마 (Zod 또는 express-validator)

### POST /api/orders 요청 검증
```typescript
{
  tableId: string (UUID),
  sessionId?: string (UUID, optional),
  items: [
    {
      menuItemId: string (UUID),
      quantity: number (정수, >= 1)
    }
  ] // 최소 1개, 최대 20개
}
```

### POST /api/menus 요청 검증
```typescript
{
  name: string (1~100자),
  price: number (정수, >= 0),
  categoryId: string (UUID),
  description?: string (최대 500자),
  imageUrl?: string (URL 형식),
  sortOrder?: number (정수, >= 0)
}
```

### POST /api/auth/admin/login 요청 검증
```typescript
{
  storeId: string (UUID),
  username: string (1~50자),
  password: string (1~100자)
}
```

### POST /api/auth/table/login 요청 검증
```typescript
{
  storeId: string (UUID),
  tableNumber: number (정수, >= 1),
  password: string (1~100자)
}
```
