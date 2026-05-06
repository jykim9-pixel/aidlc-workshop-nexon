# 비즈니스 로직 모델 - Unit 2: 관리 플로우

## 1. SSE 이벤트 관리

### 1.1 클라이언트 연결 관리

```
connectSSE(clientId, response):
  1. response에 SSE 헤더 설정
     - Content-Type: text/event-stream
     - Cache-Control: no-cache
     - Connection: keep-alive
  2. SSEClient 객체 생성 (clientId, response, connectedAt=now)
  3. 클라이언트 맵에 등록
  4. 연결 종료 이벤트 리스너 등록 (cleanup)
  5. 초기 연결 확인 이벤트 전송 (type: "connected")
  6. heartbeat 타이머 시작 (30초 간격)
```

### 1.2 클라이언트 연결 해제

```
disconnectSSE(clientId):
  1. 클라이언트 맵에서 제거
  2. heartbeat 타이머 정리
  3. response 스트림 종료
```

### 1.3 이벤트 브로드캐스트

```
broadcast(event: SSEEvent):
  1. 이벤트 ID 생성 (순서 보장)
  2. SSE 형식으로 데이터 직렬화
     - id: {event.id}
     - event: {event.type}
     - data: {JSON.stringify(event.data)}
  3. 모든 연결된 클라이언트에 전송
  4. 전송 실패한 클라이언트는 연결 해제 처리
```

### 1.4 Heartbeat 메커니즘

```
sendHeartbeat():
  매 30초마다:
  1. 모든 클라이언트에 comment 전송 (": heartbeat\n\n")
  2. lastHeartbeat 갱신
  3. 전송 실패 시 해당 클라이언트 연결 해제
```

### 1.5 프론트엔드 SSE 재연결 전략

```
reconnectSSE():
  설정:
    - RETRY_INTERVAL = 3000ms (3초)
    - MAX_RETRIES = 10

  상태:
    - retryCount = 0
    - isConnected = false

  연결 끊김 감지 시:
    1. isConnected = false
    2. UI에 "연결 끊김" 상태 표시

  재연결 루프:
    WHILE retryCount < MAX_RETRIES AND NOT isConnected:
      1. WAIT RETRY_INTERVAL
      2. retryCount++
      3. SSE 연결 시도
      4. IF 성공:
           - isConnected = true
           - retryCount = 0
           - UI에 "연결됨" 상태 표시
           - 현재 대시보드 데이터 새로고침 (놓친 이벤트 보정)
      5. IF 실패:
           - UI에 "재연결 시도 중 ({retryCount}/{MAX_RETRIES})" 표시

  MAX_RETRIES 초과 시:
    1. UI에 "연결 실패. 페이지를 새로고침해 주세요." 메시지 표시
    2. "새로고침" 버튼 제공
```

---

## 2. 테이블 세션 라이프사이클

### 2.1 세션 생성 (자동)

```
createSession(tableId):
  전제조건: 테이블에 활성 세션이 없음

  1. 새 TableSession 생성
     - status = ACTIVE
     - startedAt = now
     - totalAmount = 0
     - orderCount = 0
  2. Table.currentSessionId 업데이트
  3. Table.status = OCCUPIED
  4. 세션 반환

  트리거: 고객의 첫 주문 시 OrderService에서 호출
```

### 2.2 세션 조회

```
getActiveSession(tableId):
  1. Table.currentSessionId로 세션 조회
  2. IF 세션 없음 OR 세션 상태가 COMPLETED:
       - null 반환
  3. 활성 세션 반환
```

### 2.3 이용 완료 처리

```
completeTable(tableId):
  전제조건: 테이블에 활성 세션이 존재

  트랜잭션 시작:
    1. 활성 세션의 모든 주문 조회
    2. 각 주문을 OrderHistory로 변환 및 저장
       - 메뉴명, 단가는 스냅샷으로 저장 (원본 메뉴 변경에 영향 없음)
    3. 활성 주문 삭제 (현재 세션의 주문들)
    4. 세션 상태 변경
       - status = COMPLETED
       - completedAt = now
    5. 테이블 상태 리셋
       - Table.currentSessionId = null
       - Table.status = IDLE
  트랜잭션 종료

  6. SSE 이벤트 발행: table:completed
     - data: { tableId, tableNumber, sessionSummary }

  반환: { success: true, archivedOrders: 이력으로 이동된 주문 수 }
```

### 2.4 세션 금액 갱신

```
updateSessionTotals(sessionId):
  주문 생성/삭제 시 호출:
  1. 세션의 모든 활성 주문 조회
  2. totalAmount = SUM(각 주문의 totalAmount)
  3. orderCount = COUNT(주문)
  4. 세션 업데이트
```

---

## 3. 테이블 관리

### 3.1 테이블 생성

```
createTable(storeId, data):
  1. 테이블 번호 중복 검증 (같은 매장 내)
  2. 비밀번호 해싱
  3. Table 생성
     - status = IDLE
     - currentSessionId = null
  4. 생성된 테이블 반환
```

### 3.2 테이블 수정

```
updateTable(tableId, data):
  1. 테이블 존재 확인
  2. IF 번호 변경 시: 중복 검증
  3. IF 비밀번호 변경 시: 해싱
  4. 테이블 업데이트
  5. 수정된 테이블 반환
```

### 3.3 테이블 삭제

```
deleteTable(tableId):
  1. 테이블 존재 확인
  2. IF 활성 세션 존재: 에러 반환 (먼저 이용 완료 필요)
  3. 테이블 삭제
  4. 성공 반환
```

### 3.4 테이블 요약 조회

```
getTableSummary(tableId):
  1. 테이블 조회
  2. IF 활성 세션 존재:
       - 세션의 주문 목록 조회 (최근 5건)
       - totalAmount, orderCount 계산
  3. IF 활성 세션 없음:
       - totalAmount = 0, orderCount = 0, latestOrders = []
  4. TableSummary 반환
```

---

## 4. 주문 상태 변경 (관리자)

### 4.1 상태 변경

```
updateOrderStatus(orderId, newStatus):
  1. 주문 조회
  2. 상태 전이 유효성 검증 (business-rules 참조)
  3. 주문 상태 업데이트
  4. SSE 이벤트 발행: order:updated
     - data: { orderId, tableId, previousStatus, newStatus, updatedAt }
  5. 변경된 주문 반환
```

### 4.2 주문 삭제 (관리자 직권)

```
deleteOrder(orderId):
  1. 주문 조회
  2. 주문 삭제
  3. 세션 금액 재계산 (updateSessionTotals)
  4. SSE 이벤트 발행: order:deleted
     - data: { orderId, tableId, deletedAt }
  5. 성공 반환
```

---

## 5. 과거 주문 내역 조회

### 5.1 이력 조회

```
getOrderHistory(filters):
  filters:
    - tableId (optional): 특정 테이블 필터
    - dateFrom (optional): 시작 날짜
    - dateTo (optional): 종료 날짜

  1. OrderHistory 조회 (필터 적용)
  2. 최신순 정렬 (completedAt DESC)
  3. 항목(OrderHistoryItem) 포함하여 반환
```

---

## 6. 메뉴 관리 (관리자 UI)

### 6.1 카테고리 수정

```
updateCategory(categoryId, data):
  1. 카테고리 존재 확인
  2. IF 이름 변경 시: 중복 검증 (같은 매장 내)
  3. 카테고리 업데이트
  4. 수정된 카테고리 반환
```

### 6.2 카테고리 삭제

```
deleteCategory(categoryId):
  1. 카테고리 존재 확인
  2. 하위 메뉴 존재 여부 확인
  3. IF 하위 메뉴 존재: 에러 반환
     - "하위 메뉴가 존재합니다. 먼저 메뉴를 이동하거나 삭제해 주세요."
  4. 카테고리 삭제
  5. 성공 반환
```

---

## 7. SSE 이벤트 발행 연동 (Order Module과의 통합)

Unit 1의 OrderService에서 주문 생성/상태변경/삭제 시 SSEService를 호출하여 이벤트를 발행합니다.

### 이벤트 발행 시점

| 트리거 | 이벤트 타입 | 페이로드 |
|--------|------------|----------|
| 주문 생성 | `order:created` | `{ order, tableId, tableNumber }` |
| 상태 변경 | `order:updated` | `{ orderId, tableId, previousStatus, newStatus }` |
| 주문 삭제 | `order:deleted` | `{ orderId, tableId }` |
| 이용 완료 | `table:completed` | `{ tableId, tableNumber, sessionSummary }` |
