# Build and Test Summary

## 프로젝트 실행 Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수
cp .env.example .env

# 3. DB 시작
docker-compose up -d

# 4. DB 마이그레이션 + 시드
cd packages/backend
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..

# 5. 서버 시작 (각각 별도 터미널)
npm run dev:backend     # http://localhost:3000
npm run dev:customer    # http://localhost:5173
npm run dev:admin       # http://localhost:5174
```

## 테스트 계정

| 역할 | 접속 정보 |
|------|-----------|
| 관리자 | username: `admin`, password: `admin123` |
| 테이블 1~5 | tableNumber: `1`~`5`, password: `1234` |
| 매장 코드 | `ST01` (맛있는 식당) |

## 테스트 실행

```bash
# 백엔드 단위 테스트
npm run test -w packages/backend

# 프론트엔드 테스트
npm run test -w packages/customer-app
npm run test -w packages/admin-app
```

## 문서 목록

| 문서 | 내용 |
|------|------|
| `build-instructions.md` | 상세 빌드 단계 |
| `unit-test-instructions.md` | 단위 테스트 실행 방법 |
| `integration-test-instructions.md` | 통합 테스트 시나리오 |
