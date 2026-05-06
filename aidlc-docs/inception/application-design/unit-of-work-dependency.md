# Unit of Work 의존성 매트릭스

## Unit 간 의존성

```
+------------+--------+--------+--------+
|            | Unit 0 | Unit 1 | Unit 2 |
+------------+--------+--------+--------+
| Unit 0     |   -    |        |        |
| Unit 1     |   D    |   -    |        |
| Unit 2     |   D    |   P    |   -    |
+------------+--------+--------+--------+

D = Depends on (선행 필수)
P = Partial dependency (일부 연동 필요)
```

### 의존성 상세

| 관계 | 설명 | 영향 |
|------|------|------|
| Unit 1 → Unit 0 | 프로젝트 구조, DB 스키마, shared 타입 필요 | Unit 0 완료 후 시작 |
| Unit 2 → Unit 0 | 프로젝트 구조, DB 스키마, shared 타입 필요 | Unit 0 완료 후 시작 |
| Unit 2 → Unit 1 | SSE가 Order 이벤트를 발행해야 함 | 부분 의존 (인터페이스 합의 후 독립 개발 가능) |

---

## 통합 포인트 (Integration Points)

### 1. SSE 이벤트 연동 (Unit 1 ↔ Unit 2)

**합의 필요 사항:**
- SSE 이벤트 타입 및 페이로드 구조 (shared/types에 정의)
- OrderService에서 SSE 이벤트 발행 호출 방식

**해결 방법:**
- shared 패키지에 SSE 이벤트 인터페이스를 먼저 정의
- Unit 1의 OrderService가 SSEService.broadcast()를 호출
- Unit 2의 SSEService가 실제 브로드캐스트 구현
- 개발 중에는 각자 mock으로 독립 개발 가능

```typescript
// shared/types/sse-events.ts (Unit 0에서 정의)
interface SSEEvent {
  event: 'order:created' | 'order:updated' | 'order:deleted' | 'table:completed';
  data: { timestamp: string; payload: any };
}
```

### 2. Auth 공유 (Unit 1 → Unit 2)

**합의 필요 사항:**
- JWT 토큰 구조 및 검증 로직
- 관리자/테이블 인증 구분

**해결 방법:**
- Unit 1에서 Auth Module + JWT 미들웨어 구현
- Unit 2에서 동일 미들웨어 사용 (import)
- 인증 관련 코드는 Unit 1이 소유, Unit 2가 참조

---

## 병렬 개발 가능성

```
Timeline:
         Week 1          Week 2          Week 3          Week 4
Unit 0:  [████████████]
Unit 1:                  [████████████████████████████]
Unit 2:                  [████████████████████████████]
통합:                                                   [████████]

병렬도: Unit 1과 Unit 2는 90% 독립적으로 개발 가능
통합 리스크: 낮음 (SSE 이벤트 인터페이스만 합의)
```

---

## 리스크 및 완화 전략

| 리스크 | 영향 | 완화 전략 |
|--------|------|-----------|
| SSE 연동 지연 | Unit 2 대시보드 실시간 기능 미완성 | 폴링 fallback 구현, 인터페이스 먼저 합의 |
| Auth 변경 | Unit 2 인증 깨짐 | JWT 구조를 shared에 타입으로 고정 |
| DB 스키마 변경 | 양쪽 마이그레이션 충돌 | Unit 0에서 전체 스키마 확정 후 시작 |
| 프론트엔드 API 불일치 | 연동 시 에러 | shared에 API 응답 타입 정의, 양쪽 참조 |
