# 빌드 지침서 (Build Instructions)

## 사전 요구사항

| 도구 | 버전 | 설치 방법 |
|------|------|-----------|
| Node.js | 20.x LTS 이상 | https://nodejs.org 또는 `winget install OpenJS.NodeJS.LTS` |
| Docker | 최신 | https://www.docker.com/products/docker-desktop |
| Git | 최신 | 이미 설치됨 |

---

## 1단계: 의존성 설치

```bash
# 프로젝트 루트에서 실행 (모노레포 전체 설치)
npm install
```

---

## 2단계: 환경 변수 설정

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

`.env` 파일 내용 (기본값 그대로 사용 가능):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/table_order"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="16h"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

---

## 3단계: PostgreSQL 시작

```bash
# Docker Compose로 PostgreSQL 시작
docker-compose up -d

# 상태 확인
docker-compose ps
```

예상 출력:
```
NAME              STATUS    PORTS
table-order-db    Up        0.0.0.0:5432->5432/tcp
```

---

## 4단계: 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 실행
cd packages/backend
npx prisma migrate dev --name init

# 시드 데이터 삽입
npx tsx prisma/seed.ts
```

예상 출력:
```
Seed data created successfully!
Store: 맛있는 식당 (ST01)
Admin: admin / admin123
Tables: 1-5 / password: 1234
```

---

## 5단계: 백엔드 서버 시작

```bash
# 프로젝트 루트에서
npm run dev:backend
```

예상 출력:
```
Server running on http://localhost:3000
Environment: development
```

**확인**: `http://localhost:3000/api/health` 접속 → `{"status":"ok"}`

---

## 6단계: 고객용 앱 시작

```bash
# 새 터미널에서
npm run dev:customer
```

예상 출력:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

---

## 7단계: 관리자용 앱 시작

```bash
# 새 터미널에서
npm run dev:admin
```

예상 출력:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5174/
```

---

## 빌드 (프로덕션)

```bash
# 전체 빌드
npm run build

# 개별 빌드
npm run build -w packages/shared
npm run build -w packages/backend
npm run build -w packages/customer-app
npm run build -w packages/admin-app
```

---

## 종료

```bash
# Docker 종료
docker-compose down

# 데이터 포함 완전 삭제
docker-compose down -v
```
