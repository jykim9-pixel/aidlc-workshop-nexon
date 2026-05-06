# Story Generation Plan - 테이블오더 서비스

## 계획 개요

이 문서는 테이블오더 서비스의 사용자 스토리 생성 계획입니다.
아래 질문에 답변 후, 승인하시면 스토리 생성을 진행합니다.

---

## 질문 (Questions)

### Question 1
사용자 스토리의 분류(breakdown) 방식을 어떻게 하시겠습니까?

A) User Journey 기반 — 사용자의 실제 이용 흐름 순서대로 스토리 구성 (예: 입장 → 메뉴 탐색 → 주문 → 확인)
B) Feature 기반 — 시스템 기능 단위로 스토리 구성 (예: 메뉴 관리, 주문 관리, 테이블 관리)
C) Persona 기반 — 사용자 유형별로 스토리 그룹화 (고객 스토리 / 관리자 스토리)
D) Epic 기반 — 대규모 에픽을 정의하고 하위 스토리로 분해
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
사용자 스토리의 세분화 수준(granularity)은 어느 정도가 적절하다고 생각하시나요?

A) 큰 단위 — 주요 기능당 1개 스토리 (예: "고객으로서 메뉴를 보고 주문할 수 있다")
B) 중간 단위 — 기능의 주요 동작별 1개 스토리 (예: "고객으로서 카테고리별 메뉴를 탐색할 수 있다")
C) 작은 단위 — 개별 인터랙션별 1개 스토리 (예: "고객으로서 메뉴 카드를 탭하면 상세 정보를 볼 수 있다")
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
수용 기준(Acceptance Criteria)의 형식은 어떤 것을 선호하시나요?

A) Given-When-Then 형식 (BDD 스타일: "Given [상황], When [행동], Then [결과]")
B) 체크리스트 형식 (간단한 조건 목록: "- [ ] 메뉴가 카테고리별로 표시된다")
C) 시나리오 형식 (사용자 시나리오 서술: "사용자가 X를 하면 Y가 발생한다")
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 4
고객 페르소나를 어떻게 정의하면 좋을까요? 주요 고객 유형을 선택해 주세요.

A) 단일 페르소나 — "식당 고객" 하나로 통일 (태블릿 사용자는 모두 동일한 니즈)
B) 연령대별 분류 — 디지털 친숙도가 다른 고객 유형 (젊은 층 / 중장년층)
C) 이용 패턴별 분류 — 혼밥 고객 / 그룹 고객 / 단골 고객
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5
관리자 페르소나는 어떻게 정의하면 좋을까요?

A) 단일 페르소나 — "매장 관리자(사장님)" 하나로 통일
B) 역할별 분류 — 사장님(전체 관리) / 직원(주문 처리만)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 생성 계획 (Generation Steps)

승인 후 아래 순서로 스토리를 생성합니다:

- [x] Step 1: 페르소나 정의 (personas.md 생성)
- [x] Step 2: 에픽/기능 영역 정의
- [x] Step 3: 고객용 사용자 스토리 생성 (수용 기준 포함)
- [x] Step 4: 관리자용 사용자 스토리 생성 (수용 기준 포함)
- [x] Step 5: 스토리 간 의존성 및 우선순위 매핑
- [x] Step 6: INVEST 기준 검증
- [x] Step 7: 최종 stories.md 파일 생성

---

## 필수 산출물

| 산출물 | 파일 경로 |
|--------|-----------|
| 페르소나 | `aidlc-docs/inception/user-stories/personas.md` |
| 사용자 스토리 | `aidlc-docs/inception/user-stories/stories.md` |
