# 비즈니스 규칙 및 유효성 검증 - Unit 2: 관리 플로우

## 1. SSE 연결 규칙

### BR-SSE-01: 인증 필수
- SSE 연결 시 유효한 관리자 JWT 토큰 필요
- 토큰 없거나 만료 시 401 Unauthorized 반환

### BR-SSE-02: 재연결 전략
- 클라이언트 측 자동 재연결: 3초 간격, 최대 10회
- 10회 초과 시 수동 새로고침 안내 UI 표시
- 재연결 성공 시 대시보드 데이터 전체 새로고침 (놓친 이벤트 보정)

### BR-SSE-03: Heartbeat
- 서버에서 30초 간격으로 heartbeat 전송
- heartbeat 전송 실패 시 해당 클라이언트 연결 해제

### BR-SSE-04: 연결 정리
- HTTP 연결 종료 감지 시 즉시 클라이언트 맵에서 제거
- 서버 종료 시 모든 클라이언트 연결 정리

---

## 2. 테이블 관리 규칙

### BR-TBL-01: 테이블 번호 고유성
- 같은 매장(storeId) 내에서 테이블 번호 중복 불가
- 위반 시: "이미 존재하는 테이블 번호입니다." (409 Conflict)

### BR-TBL-02: 테이블 삭제 제약
- 활성 세션이 있는 테이블은 삭제 불가
- 위반 시: "활성 세션이 있는 테이블은 삭제할 수 없습니다. 먼저 이용 완료 처리해 주세요." (400 Bad Request)

### BR-TBL-03: 테이블 비밀번호
- 최소 4자리 숫자
- 저장 시 bcrypt 해싱

### BR-TBL-04: 대시보드 정렬
- 테이블 카드는 항상 테이블 번호 오름차순으로 고정 배치
- SSE 이벤트 수신 시에도 카드 위치 변경 없음

---

## 3. 세션 라이프사이클 규칙

### BR-SES-01: 세션 자동 생성
- 테이블에 활성 세션이 없는 상태에서 첫 주문 시 자동 생성
- 관리자가 수동으로 세션을 생성하지 않음

### BR-SES-02: 단일 활성 세션
- 하나의 테이블에 동시에 하나의 활성 세션만 존재 가능
- 이전 세션이 COMPLETED 상태여야 새 세션 생성 가능

### BR-SES-03: 이용 완료 원자성
- 이용 완료 처리는 트랜잭션으로 원자적 실행
- 부분 실패 시 전체 롤백
- 포함 작업: 주문 이력 이동 + 활성 주문 삭제 + 세션 종료 + 테이블 리셋

### BR-SES-04: 이용 완료 전제조건
- 활성 세션이 존재해야 이용 완료 가능
- 활성 세션 없는 테이블에 이용 완료 시도 시: "활성 세션이 없습니다." (400 Bad Request)

### BR-SES-05: 이용 완료 후 상태
- Table.status → IDLE
- Table.currentSessionId → null
- TableSession.status → COMPLETED
- TableSession.completedAt → 현재 시각

---

## 4. 주문 상태 전이 규칙

### BR-ORD-01: 유효한 상태 전이

```
PENDING (대기중) → PREPARING (준비중) → COMPLETED (완료)
```

| 현재 상태 | 허용 전이 | 불가 전이 |
|-----------|-----------|-----------|
| PENDING | PREPARING | COMPLETED (건너뛰기 불가) |
| PREPARING | COMPLETED | PENDING (역방향 불가) |
| COMPLETED | (없음) | 모든 전이 불가 (최종 상태) |

- 위반 시: "유효하지 않은 상태 전이입니다: {현재} → {요청}" (400 Bad Request)

### BR-ORD-02: 주문 삭제 (관리자 직권)
- 모든 상태의 주문 삭제 가능 (관리자 권한)
- 삭제 시 세션 총 금액 재계산
- SSE 이벤트 발행 필수

### BR-ORD-03: 신규 주문 강조
- 주문 상태가 PENDING인 주문은 "신규" 강조 표시
- PREPARING으로 변경 시 강조 해제
- 프론트엔드에서 `isNew = (status === 'PENDING')` 으로 판단

---

## 5. 주문 이력 규칙

### BR-HIS-01: 보관 기간
- 무기한 보관 (자동 삭제 없음)
- 향후 필요 시 수동 정리 또는 정책 변경 가능

### BR-HIS-02: 스냅샷 저장
- 이력 저장 시 메뉴명과 단가는 당시 값을 스냅샷으로 저장
- 원본 메뉴가 수정/삭제되어도 이력 데이터에 영향 없음

### BR-HIS-03: 이력 조회 필터
- tableId: 특정 테이블의 이력만 조회
- dateFrom/dateTo: 날짜 범위 필터
- 기본 정렬: completedAt 내림차순 (최신순)

---

## 6. 메뉴 관리 규칙 (관리자)

### BR-MNU-01: 카테고리 삭제 제약
- 하위 메뉴가 존재하는 카테고리는 삭제 불가
- 위반 시: "하위 메뉴가 존재합니다. 먼저 메뉴를 이동하거나 삭제해 주세요." (400 Bad Request)

### BR-MNU-02: 카테고리 이름 고유성
- 같은 매장 내 카테고리 이름 중복 불가
- 위반 시: "이미 존재하는 카테고리 이름입니다." (409 Conflict)

### BR-MNU-03: 메뉴 필수 필드
- name: 필수, 1~50자
- price: 필수, 0 이상 정수
- categoryId: 필수, 유효한 카테고리 ID

### BR-MNU-04: 메뉴 순서 변경
- sortOrder는 0 이상 정수
- 일괄 변경 시 모든 항목의 sortOrder가 제공되어야 함
- 부분 변경 불가 (전체 목록의 순서를 한 번에 전송)

---

## 7. 유효성 검증 요약

### API 입력 검증

| 엔드포인트 | 검증 항목 |
|-----------|-----------|
| POST /api/tables | tableNumber: 양의 정수, password: 4자리 이상 |
| PUT /api/tables/:id | tableNumber: 양의 정수 (선택), password: 4자리 이상 (선택) |
| POST /api/tables/:id/complete | 활성 세션 존재 여부 |
| PATCH /api/orders/:id/status | status: 유효한 OrderStatus 값, 전이 규칙 준수 |
| DELETE /api/orders/:id | 주문 존재 여부 |
| PUT /api/categories/:id | name: 1~30자 (선택), sortOrder: 0 이상 정수 (선택) |
| DELETE /api/categories/:id | 하위 메뉴 존재 여부 |
| GET /api/orders/history | dateFrom/dateTo: ISO 8601 형식 (선택) |

### 에러 응답 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "사용자에게 표시할 메시지",
    "details": [
      { "field": "tableNumber", "message": "양의 정수여야 합니다." }
    ]
  }
}
```

### 에러 코드 목록

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| VALIDATION_ERROR | 400 | 입력값 유효성 검증 실패 |
| INVALID_STATE_TRANSITION | 400 | 주문 상태 전이 규칙 위반 |
| ACTIVE_SESSION_EXISTS | 400 | 활성 세션 존재로 작업 불가 |
| NO_ACTIVE_SESSION | 400 | 활성 세션 없음 |
| DUPLICATE_TABLE_NUMBER | 409 | 테이블 번호 중복 |
| DUPLICATE_CATEGORY_NAME | 409 | 카테고리 이름 중복 |
| CATEGORY_HAS_ITEMS | 400 | 하위 메뉴 존재로 삭제 불가 |
| NOT_FOUND | 404 | 리소스 없음 |
| UNAUTHORIZED | 401 | 인증 실패 |
