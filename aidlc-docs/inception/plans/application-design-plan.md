# Application Design Plan - 테이블오더 서비스

## 계획 개요

이 문서는 테이블오더 서비스의 애플리케이션 설계 계획입니다.
아래 질문에 답변 후, 승인하시면 설계를 진행합니다.

---

## 질문 (Questions)

### Question 1
백엔드 API 설계 스타일을 어떻게 하시겠습니까?

A) RESTful API — 리소스 기반 URL 설계 (GET /api/menus, POST /api/orders 등)
B) GraphQL — 단일 엔드포인트, 클라이언트가 필요한 데이터만 요청
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
ORM(Object-Relational Mapping)으로 어떤 것을 사용하시겠습니까?

A) Prisma — 타입 안전, 스키마 기반 마이그레이션, 직관적 쿼리 API
B) TypeORM — 데코레이터 기반, Active Record/Data Mapper 패턴
C) Drizzle — 경량, SQL에 가까운 타입 안전 쿼리
D) Raw SQL (pg 라이브러리 직접 사용)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
프론트엔드 상태 관리 라이브러리를 어떤 것으로 하시겠습니까?

A) Zustand — 경량, 간단한 API, 보일러플레이트 최소
B) Redux Toolkit — 표준적, 강력한 미들웨어, DevTools
C) React Context + useReducer — 외부 라이브러리 없이 내장 기능만 사용
D) Jotai/Recoil — 원자적 상태 관리
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
CSS/스타일링 방식을 어떻게 하시겠습니까?

A) Tailwind CSS — 유틸리티 퍼스트, 빠른 개발
B) styled-components — CSS-in-JS, 컴포넌트 스코프
C) CSS Modules — 모듈화된 CSS, 네이밍 충돌 방지
D) MUI (Material UI) — 컴포넌트 라이브러리 + 테마 시스템
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 설계 생성 계획 (Design Steps)

승인 후 아래 순서로 설계를 진행합니다:

- [x] Step 1: 컴포넌트 식별 및 책임 정의 (components.md)
- [x] Step 2: 컴포넌트 메서드 시그니처 정의 (component-methods.md)
- [x] Step 3: 서비스 레이어 설계 (services.md)
- [x] Step 4: 컴포넌트 의존성 관계 정의 (component-dependency.md)
- [x] Step 5: 통합 설계 문서 생성 (application-design.md)

---

## 필수 산출물

| 산출물 | 파일 경로 |
|--------|-----------|
| 컴포넌트 정의 | `aidlc-docs/inception/application-design/components.md` |
| 컴포넌트 메서드 | `aidlc-docs/inception/application-design/component-methods.md` |
| 서비스 정의 | `aidlc-docs/inception/application-design/services.md` |
| 의존성 관계 | `aidlc-docs/inception/application-design/component-dependency.md` |
| 통합 설계 | `aidlc-docs/inception/application-design/application-design.md` |
