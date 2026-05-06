# Functional Design Plan - Unit 2: 관리 플로우

## 계획 개요

Unit 2(관리 플로우)의 상세 비즈니스 로직을 설계합니다.
아래 질문에 답변 후, 승인하시면 설계를 진행합니다.

---

## 질문 (Questions)

### Question 1
SSE 연결이 끊어졌을 때 재연결 전략을 어떻게 하시겠습니까?

A) 자동 재연결 (3초 간격, 최대 10회 시도 후 수동 새로고침 안내)
B) 자동 재연결 (즉시, 무제한 시도)
C) 수동 재연결 (사용자가 "다시 연결" 버튼 클릭)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
테이블 이용 완료 시 과거 이력 보관 기간을 어떻게 하시겠습니까?

A) 무기한 보관 (삭제하지 않음)
B) 30일 보관 후 자동 삭제
C) 90일 보관 후 자동 삭제
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
관리자 대시보드에서 테이블 카드의 정렬 방식을 어떻게 하시겠습니까?

A) 테이블 번호 순 (고정 위치)
B) 최신 주문 순 (활성 테이블이 상단)
C) 사용자 설정 가능 (번호순/최신순 토글)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
신규 주문 강조 표시의 지속 시간을 어떻게 하시겠습니까?

A) 관리자가 해당 주문을 확인(클릭)할 때까지 유지
B) 일정 시간(예: 30초) 후 자동 해제
C) 주문 상태를 "준비중"으로 변경할 때까지 유지
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 5
메뉴 관리에서 카테고리 삭제 시 하위 메뉴 처리를 어떻게 하시겠습니까?

A) 하위 메뉴가 있으면 삭제 불가 (먼저 메뉴를 이동/삭제해야 함)
B) 하위 메뉴도 함께 삭제 (확인 팝업 표시)
C) 하위 메뉴를 "미분류" 카테고리로 자동 이동
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 설계 생성 계획 (Design Steps)

승인 후 아래 순서로 설계를 진행합니다:

- [x] Step 1: 도메인 엔티티 정의 (SSE, Table Session, Order History)
- [x] Step 2: 비즈니스 로직 모델 (SSE 이벤트 관리, 세션 라이프사이클)
- [x] Step 3: 비즈니스 규칙 및 유효성 검증
- [x] Step 4: 프론트엔드 컴포넌트 설계 (admin-app)

---

## 필수 산출물

| 산출물 | 파일 경로 |
|--------|-----------|
| 도메인 엔티티 | `aidlc-docs/construction/unit2-admin-flow/functional-design/domain-entities.md` |
| 비즈니스 로직 | `aidlc-docs/construction/unit2-admin-flow/functional-design/business-logic-model.md` |
| 비즈니스 규칙 | `aidlc-docs/construction/unit2-admin-flow/functional-design/business-rules.md` |
| 프론트엔드 컴포넌트 | `aidlc-docs/construction/unit2-admin-flow/functional-design/frontend-components.md` |
