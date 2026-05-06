# 단위 테스트 지침서 (Unit Test Instructions)

## 테스트 프레임워크

- **Backend**: Vitest
- **Frontend**: Vitest + React Testing Library

---

## 백엔드 테스트 실행

```bash
# 전체 백엔드 테스트
cd packages/backend
npm run test

# 감시 모드 (개발 중)
npm run test:watch

# 특정 파일만
npx vitest run src/modules/auth/auth.service.test.ts
npx vitest run src/modules/order/order.service.test.ts
npx vitest run src/modules/menu/menu.service.test.ts
```

### 테스트 대상

| 모듈 | 테스트 파일 | 테스트 항목 |
|------|------------|-------------|
| Auth | `auth.service.test.ts` | 로그인 성공/실패, JWT 발급/검증, 시도 제한 |
| Menu | `menu.service.test.ts` | CRUD, 가격 검증, 카테고리 삭제 제한 |
| Order | `order.service.test.ts` | 주문 생성, 상태 전이, 주문번호 생성 |
| SSE | `sse.service.test.ts` | 클라이언트 관리, 브로드캐스트 |
| Table | `table.service.test.ts` | 세션 관리, 이용 완료 |

---

## 프론트엔드 테스트 실행

```bash
# customer-app 테스트
cd packages/customer-app
npm run test

# admin-app 테스트
cd packages/admin-app
npm run test
```

### 테스트 대상

| 앱 | 테스트 파일 | 테스트 항목 |
|----|------------|-------------|
| admin-app | `TableCard.test.tsx` | 테이블 카드 렌더링, 클릭 이벤트 |
| admin-app | `dashboardStore.test.ts` | SSE 연결, 주문 상태 관리 |

---

## 테스트 커버리지

```bash
# 커버리지 리포트 생성
cd packages/backend
npx vitest run --coverage

cd packages/customer-app
npx vitest run --coverage
```

---

## 테스트 작성 규칙

1. 서비스 레이어는 Prisma를 모킹하여 단위 테스트
2. 라우터는 supertest로 통합 테스트 (선택)
3. 프론트엔드 스토어는 순수 로직 테스트
4. 컴포넌트는 React Testing Library로 렌더링 테스트
