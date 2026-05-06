# Unit 1: 비즈니스 로직 모델

## 1. AuthService - 인증 로직

### adminLogin(storeId, username, password)
```
1. 로그인 시도 횟수 확인 (checkLoginAttempts)
2. 잠금 상태면 → 에러 반환 (남은 시간 포함)
3. Store 존재 확인
4. Admin 조회 (storeId + username)
5. bcrypt.compare(password, admin.passwordHash)
6. 실패 → recordLoginAttempt(false) → 에러 반환
7. 성공 → recordLoginAttempt(true) → JWT 발급 (16시간 만료)
8. JWT payload: { adminId, storeId, role: 'admin' }
```

### tableLogin(storeId, tableNumber, password)
```
1. Store 존재 확인
2. Table 조회 (storeId + tableNumber)
3. bcrypt.compare(password, table.passwordHash)
4. 실패 → 에러 반환
5. 성공 → 활성 세션 조회 (getActiveSession)
6. JWT 발급 (16시간 만료)
7. JWT payload: { tableId, storeId, sessionId (nullable), role: 'table' }
```

### checkLoginAttempts(identifier)
```
1. 최근 15분 내 실패 횟수 조회
2. 5회 이상 → 잠금 상태 (locked: true, unlockAt 반환)
3. 5회 미만 → 정상 (locked: false)
```

---

## 2. MenuService - 메뉴 로직

### getMenuItems(storeId, categoryId?)
```
1. categoryId 있으면 해당 카테고리 메뉴만 조회
2. 없으면 전체 메뉴 조회
3. sortOrder ASC 정렬
4. 카테고리 정보 포함 (include: category)
```

### createMenuItem(storeId, data)
```
1. 필수 필드 검증 (name, price, categoryId)
2. 가격 검증: price >= 0
3. 카테고리 존재 확인 (같은 storeId)
4. sortOrder 미지정 시 해당 카테고리 마지막 + 1
5. DB 저장 후 반환
```

### reorderMenuItems(items: {id, sortOrder}[])
```
1. 모든 menuItemId 존재 확인
2. 트랜잭션으로 일괄 sortOrder 업데이트
3. 성공/실패 반환
```

---

## 3. OrderService - 주문 로직

### createOrder(tableId, sessionId, items)
```
1. 테이블 존재 확인
2. 세션 확인:
   - sessionId 있고 ACTIVE → 해당 세션 사용
   - sessionId 없거나 세션 없음 → 새 세션 생성 (TableSession.create)
3. 장바구니 항목 수 검증 (최대 20종류)
4. 각 항목의 menuItem 조회 (현재 가격 확인)
5. 총 금액 계산: SUM(menuItem.price * quantity)
6. 주문 번호 생성 (generateOrderNumber)
7. 트랜잭션:
   - Order 생성
   - OrderItem 일괄 생성 (menuName, unitPrice 스냅샷)
8. SSE 이벤트 발행: 'order:created'
9. 생성된 Order 반환
```

### generateOrderNumber(storeCode)
```
1. 현재 시각: MMDD-HHmm 형식
2. 오늘 해당 매장의 주문 수 조회 (순번)
3. 형식: {storeCode}-{MMDD}-{HHmm}-{순번3자리}
4. 예: ST01-0506-1117-001
```

### updateOrderStatus(orderId, newStatus)
```
1. Order 조회
2. 상태 전이 검증:
   - PENDING → PREPARING ✅
   - PREPARING → COMPLETED ✅
   - 그 외 → 에러 (역방향 불가)
3. status 업데이트
4. SSE 이벤트 발행: 'order:updated'
5. 업데이트된 Order 반환
```

### deleteOrder(orderId)
```
1. Order 조회 (존재 확인)
2. Order 삭제 (CASCADE로 OrderItem도 삭제)
3. SSE 이벤트 발행: 'order:deleted'
4. 성공 반환
```

### getOrders(filters: {sessionId?, tableId?, status?})
```
1. 필터 조건 구성
2. sessionId → 해당 세션 주문만
3. tableId → 해당 테이블의 활성 세션 주문
4. status → 상태 필터
5. createdAt DESC 정렬
6. items 포함 (include: items)
```

---

## 4. TableService - 테이블 로직 (Unit 1 범위)

### getActiveSession(tableId)
```
1. TableSession 조회 (tableId + status: ACTIVE)
2. 있으면 반환, 없으면 null
```

### createSession(tableId)
```
1. 기존 ACTIVE 세션 없는지 확인
2. 있으면 기존 세션 반환 (중복 생성 방지)
3. 없으면 새 TableSession 생성 (status: ACTIVE)
4. 생성된 세션 반환
```
