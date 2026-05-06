# Functional Design Plan - Unit 1: 주문 플로우

## 계획 개요

Unit 1(주문 플로우)의 상세 비즈니스 로직을 설계합니다.
아래 질문에 답변 후, 승인하시면 설계를 진행합니다.

---

## 질문 (Questions)

### Question 1
테이블 세션 생성 시점을 어떻게 하시겠습니까?

A) 첫 주문 생성 시 자동으로 세션 생성 (요구사항 명시)
B) 테이블 로그인 시 세션 생성
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
주문 번호 생성 방식을 어떻게 하시겠습니까?

A) 순차 번호 (매장 내 일련번호: 1, 2, 3...)
B) 날짜 기반 (20260506-001, 20260506-002...)
C) UUID (고유 식별자)
D) 매장코드+날짜+순번 (ST01-0506-001)
X) Other (please describe after [Answer]: tag below)

[Answer]: D 날짜에 주문 시간도 같이 들어가면 좋을듯

### Question 3
장바구니에 담을 수 있는 최대 수량 제한이 필요한가요?

A) 제한 없음 (무제한)
B) 메뉴당 최대 수량 제한 (예: 99개)
C) 전체 장바구니 항목 수 제한 (예: 최대 20종류)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 4
주문 상태 변경 시 역방향 전이를 허용하시겠습니까? (예: 준비중 → 대기중)

A) 역방향 불가 — 대기중 → 준비중 → 완료 단방향만 허용
B) 역방향 허용 — 실수 시 이전 상태로 되돌리기 가능
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5
메뉴 가격의 유효 범위를 어떻게 설정하시겠습니까?

A) 최소 100원 ~ 최대 1,000,000원
B) 최소 0원(무료 가능) ~ 최대 제한 없음
C) 최소 1,000원 ~ 최대 500,000원
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 설계 생성 계획 (Design Steps)

승인 후 아래 순서로 설계를 진행합니다:

- [x] Step 1: 도메인 엔티티 정의 (Prisma 스키마 수준)
- [x] Step 2: 비즈니스 로직 모델 (서비스 레이어 상세)
- [x] Step 3: 비즈니스 규칙 및 유효성 검증
- [x] Step 4: 프론트엔드 컴포넌트 설계 (customer-app)

---

## 필수 산출물

| 산출물 | 파일 경로 |
|--------|-----------|
| 도메인 엔티티 | `aidlc-docs/construction/unit1-order-flow/functional-design/domain-entities.md` |
| 비즈니스 로직 | `aidlc-docs/construction/unit1-order-flow/functional-design/business-logic-model.md` |
| 비즈니스 규칙 | `aidlc-docs/construction/unit1-order-flow/functional-design/business-rules.md` |
| 프론트엔드 컴포넌트 | `aidlc-docs/construction/unit1-order-flow/functional-design/frontend-components.md` |
