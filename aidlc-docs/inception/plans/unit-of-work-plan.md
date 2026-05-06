# Unit of Work Plan - 테이블오더 서비스

## 계획 개요

이 문서는 테이블오더 서비스를 개발 단위(Unit of Work)로 분해하는 계획입니다.

---

## 질문 (Questions)

### Question 1
개발 단위(Unit)의 구현 순서를 어떻게 하시겠습니까?

A) 백엔드 우선 — shared → backend → customer-app → admin-app 순서로 구현
B) 기능 슬라이스 — 핵심 플로우(메뉴 조회→주문 생성→주문 모니터링)를 수직으로 한번에 구현
C) 프론트엔드 우선 — 목업 API로 프론트엔드 먼저 구현 후 백엔드 연결
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 2
각 Unit의 크기(범위)를 어떻게 나누시겠습니까?

A) 패키지 단위 — 각 패키지(shared, backend, customer-app, admin-app)를 하나의 Unit으로
B) 기능 도메인 단위 — 도메인별로 Unit 분리 (인증, 메뉴, 주문, 테이블 관리)
C) 레이어 단위 — 데이터 모델 → API → 프론트엔드 순서로 레이어별 Unit
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 생성 계획 (Generation Steps)

승인 후 아래 순서로 Unit 산출물을 생성합니다:

- [x] Step 1: Unit of Work 정의 (unit-of-work.md)
- [x] Step 2: Unit 간 의존성 매트릭스 (unit-of-work-dependency.md)
- [x] Step 3: 스토리-Unit 매핑 (unit-of-work-story-map.md)
- [x] Step 4: 검증 (모든 스토리가 Unit에 할당되었는지 확인)

---

## 필수 산출물

| 산출물 | 파일 경로 |
|--------|-----------|
| Unit 정의 | `aidlc-docs/inception/application-design/unit-of-work.md` |
| 의존성 매트릭스 | `aidlc-docs/inception/application-design/unit-of-work-dependency.md` |
| 스토리 매핑 | `aidlc-docs/inception/application-design/unit-of-work-story-map.md` |
