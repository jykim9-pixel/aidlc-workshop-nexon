# 비즈니스 로직 요약 - Unit 2

## 구현된 서비스

### SSEService (`packages/backend/src/modules/sse/sse.service.ts`)
- 클라이언트 연결 관리 (addClient, removeClient)
- 이벤트 브로드캐스트 (broadcast) — 모든 연결 클라이언트에 전송
- Heartbeat (30초 간격) — 연결 유지 및 죽은 연결 감지
- 싱글톤 패턴 (sseService 인스턴스)

### TableService (`packages/backend/src/modules/table/table.service.ts`)
- 테이블 CRUD (번호 중복 검증 포함)
- 세션 라이프사이클 (자동 생성, 이용 완료)
- 이용 완료 트랜잭션 (주문→이력 이동, 세션 종료, 테이블 리셋)
- 세션 금액 갱신 (updateSessionTotals)
- 과거 주문 이력 조회 (필터: tableId, dateFrom, dateTo)

### OrderService (`packages/backend/src/modules/order/order.service.ts`)
- 주문 생성 (세션 자동 생성 연동, SSE 이벤트 발행)
- 주문 상태 변경 (전이 규칙 검증, SSE 이벤트 발행)
- 주문 삭제 (세션 금액 재계산, SSE 이벤트 발행)

## 테스트 커버리지
- SSE Service: 클라이언트 등록/해제, 브로드캐스트, heartbeat, 실패 처리
- Table Service: CRUD, 세션 관리, 이용 완료, 비즈니스 규칙 검증
