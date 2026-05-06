# 도메인 엔티티 정의 - Unit 2: 관리 플로우

## 1. SSE 관련 엔티티

### SSEClient

SSE 연결을 관리하는 런타임 엔티티 (DB 비저장, 메모리 관리)

| 필드 | 타입 | 설명 |
|------|------|------|
| clientId | string | 고유 클라이언트 식별자 (UUID) |
| response | ServerResponse | HTTP Response 객체 (스트림 유지) |
| connectedAt | Date | 연결 시작 시각 |
| lastHeartbeat | Date | 마지막 heartbeat 전송 시각 |

### SSEEvent

SSE를 통해 전송되는 이벤트 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 이벤트 고유 ID (순서 보장용) |
| type | SSEEventType | 이벤트 타입 |
| data | object | 이벤트 페이로드 |
| timestamp | Date | 이벤트 발생 시각 |

### SSEEventType (Enum)

| 값 | 설명 |
|----|------|
| `order:created` | 신규 주문 생성 |
| `order:updated` | 주문 상태 변경 |
| `order:deleted` | 주문 삭제 |
| `table:completed` | 테이블 이용 완료 |

---

## 2. Table 관련 엔티티

### Table

매장의 물리적 테이블을 나타내는 엔티티

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string (UUID) | 테이블 고유 식별자 |
| storeId | string | 매장 ID |
| tableNumber | number | 테이블 번호 (매장 내 고유) |
| password | string (hashed) | 태블릿 로그인용 비밀번호 |
| status | TableStatus | 현재 상태 |
| currentSessionId | string \| null | 현재 활성 세션 ID |
| createdAt | Date | 생성 시각 |
| updatedAt | Date | 수정 시각 |

### TableStatus (Enum)

| 값 | 설명 |
|----|------|
| `IDLE` | 비어있음 (세션 없음) |
| `OCCUPIED` | 사용 중 (활성 세션 존재) |

### TableSession

테이블 이용 세션 (고객 방문 단위)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string (UUID) | 세션 고유 식별자 |
| tableId | string | 테이블 ID |
| status | SessionStatus | 세션 상태 |
| startedAt | Date | 세션 시작 시각 |
| completedAt | Date \| null | 세션 종료 시각 |
| totalAmount | number | 세션 총 주문 금액 |
| orderCount | number | 세션 총 주문 건수 |

### SessionStatus (Enum)

| 값 | 설명 |
|----|------|
| `ACTIVE` | 활성 (주문 가능) |
| `COMPLETED` | 완료 (이용 종료) |

---

## 3. Order History 관련 엔티티

### OrderHistory

이용 완료 후 보관되는 과거 주문 이력

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string (UUID) | 이력 고유 식별자 |
| originalOrderId | string | 원본 주문 ID |
| tableId | string | 테이블 ID |
| tableNumber | number | 테이블 번호 (조회 편의) |
| sessionId | string | 세션 ID |
| items | OrderHistoryItem[] | 주문 항목 목록 |
| totalAmount | number | 주문 총액 |
| status | OrderStatus | 최종 주문 상태 |
| orderedAt | Date | 원본 주문 시각 |
| completedAt | Date | 이용 완료 처리 시각 |

### OrderHistoryItem

과거 주문의 개별 항목

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string (UUID) | 항목 고유 식별자 |
| orderHistoryId | string | 주문 이력 ID |
| menuItemName | string | 메뉴명 (스냅샷) |
| quantity | number | 수량 |
| unitPrice | number | 단가 (스냅샷) |
| subtotal | number | 소계 |

---

## 4. 대시보드 뷰 엔티티 (프론트엔드용)

### TableSummary

대시보드에서 테이블 카드에 표시되는 요약 정보

| 필드 | 타입 | 설명 |
|------|------|------|
| tableId | string | 테이블 ID |
| tableNumber | number | 테이블 번호 |
| status | TableStatus | 테이블 상태 |
| sessionId | string \| null | 현재 세션 ID |
| totalAmount | number | 현재 세션 총 주문액 |
| orderCount | number | 현재 세션 주문 건수 |
| latestOrders | OrderSummary[] | 최근 주문 목록 (최대 5건) |
| hasNewOrder | boolean | 신규 주문 존재 여부 (강조 표시용) |

### OrderSummary

대시보드 테이블 카드 내 주문 요약

| 필드 | 타입 | 설명 |
|------|------|------|
| orderId | string | 주문 ID |
| status | OrderStatus | 주문 상태 |
| totalAmount | number | 주문 총액 |
| itemCount | number | 항목 수 |
| orderedAt | Date | 주문 시각 |
| isNew | boolean | 신규 주문 여부 ("대기중" 상태) |

---

## 5. 엔티티 관계도

```
Table (1) ──── (N) TableSession
  │                    │
  │                    └── (N) Order (활성 세션의 주문)
  │
  └── (N) OrderHistory (이용 완료 후 보관)
              │
              └── (N) OrderHistoryItem

SSEClient (런타임, 메모리)
  └── broadcast 대상
```

---

## 6. 보관 정책

| 항목 | 정책 |
|------|------|
| OrderHistory | 무기한 보관 (삭제하지 않음) |
| TableSession (COMPLETED) | 무기한 보관 |
| SSEClient | 연결 해제 시 즉시 제거 |
