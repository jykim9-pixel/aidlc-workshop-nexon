# 요구사항 확인 질문

아래 질문에 답변해 주세요. 각 질문의 `[Answer]:` 태그 뒤에 선택한 옵션의 알파벳을 입력해 주세요.
선택지 중 맞는 것이 없으면 마지막 옵션(Other)을 선택하고 설명을 추가해 주세요.

---

## Question 1
백엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) Node.js + Express (JavaScript/TypeScript)
B) Node.js + NestJS (TypeScript)
C) Python + FastAPI
D) Java + Spring Boot
E) Go (Gin/Echo)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2
프론트엔드 기술 스택으로 어떤 것을 사용하시겠습니까?

A) React (JavaScript/TypeScript)
B) Vue.js
C) Next.js (React 기반 풀스택)
D) Svelte/SvelteKit
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3
데이터베이스로 어떤 것을 사용하시겠습니까?

A) PostgreSQL
B) MySQL/MariaDB
C) MongoDB (NoSQL)
D) SQLite (경량 개발용)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4
프로젝트 구조를 어떻게 구성하시겠습니까?

A) 모노레포 (프론트엔드 + 백엔드를 하나의 저장소에서 관리)
B) 분리된 저장소 (프론트엔드와 백엔드를 별도 프로젝트로 관리)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5
고객용 UI와 관리자용 UI를 어떻게 구성하시겠습니까?

A) 하나의 프론트엔드 앱에서 라우팅으로 분리
B) 별도의 프론트엔드 앱으로 분리 (고객용 / 관리자용)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6
매장(Store)은 단일 매장만 지원하면 되나요, 아니면 다중 매장(멀티테넌트)을 지원해야 하나요?

A) 단일 매장만 지원 (MVP 단계에서는 하나의 매장만)
B) 다중 매장 지원 (하나의 시스템에서 여러 매장 관리)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7
배포 환경은 어떻게 계획하고 계신가요?

A) 로컬 개발 환경만 (Docker Compose 등)
B) 클라우드 배포 (AWS)
C) 클라우드 배포 (기타: GCP, Azure 등)
D) 아직 미정 (개발 우선, 배포는 나중에 결정)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8
메뉴 이미지 관리는 어떻게 하시겠습니까?

A) 외부 이미지 URL만 저장 (이미지 호스팅은 별도 서비스 사용)
B) 서버에 직접 이미지 업로드 및 저장
C) 클라우드 스토리지 사용 (S3 등)
D) MVP에서는 이미지 URL만 저장, 추후 업로드 기능 추가
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 9
테이블 수는 매장당 대략 어느 정도를 예상하시나요? (성능 설계 참고용)

A) 소규모 (1~10개 테이블)
B) 중규모 (11~30개 테이블)
C) 대규모 (31개 이상 테이블)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 10: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용하시겠습니까?

A) Yes — 모든 보안 규칙을 필수 제약으로 적용 (프로덕션 수준 애플리케이션에 권장)
B) No — 보안 규칙 건너뛰기 (PoC, 프로토타입, 실험적 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 11: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스팅(PBT) 규칙을 적용하시겠습니까?

A) Yes — 모든 PBT 규칙을 필수 제약으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트에 권장)
B) Partial — 순수 함수와 직렬화 라운드트립에만 PBT 규칙 적용
C) No — PBT 규칙 건너뛰기 (단순 CRUD, UI 전용 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: 
