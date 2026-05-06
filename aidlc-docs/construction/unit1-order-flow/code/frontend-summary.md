# Unit 1: Frontend Summary (customer-app)

## 페이지 구성

| 페이지 | 경로 | 설명 |
|--------|------|------|
| SetupPage | `/setup` | 태블릿 초기 설정 (매장ID, 테이블번호, 비밀번호) |
| MenuPage | `/` | 메뉴 조회 (기본 화면, 카테고리 필터) |
| CartPage | `/cart` | 장바구니 (수량 조절, 삭제, 비우기) |
| OrderConfirmPage | `/order/confirm` | 주문 최종 확인 |
| OrderSuccessPage | `/order/success/:orderNumber` | 주문 성공 (5초 리다이렉트) |
| OrderHistoryPage | `/orders` | 주문 내역 조회 |

## 상태 관리 (Zustand)

### authStore
- token, tableId, storeId, sessionId, tableNumber
- `login()`, `logout()`, `verifyToken()`
- persist: localStorage

### cartStore
- items: CartItem[]
- `addItem()` — 20종류 제한, 중복 시 수량 증가
- `removeItem()`, `updateQuantity()`, `clearCart()`
- `getTotalAmount()`, `getItemCount()`, `getTotalTypes()`
- persist: localStorage

### orderStore
- orders, isLoading, error
- `fetchOrders()`, `createOrder()`, `clearError()`

## 컴포넌트 구조

```
src/
├── components/
│   └── layout/
│       ├── AppLayout.tsx    — 전체 레이아웃 (pb-16)
│       └── BottomNav.tsx    — 하단 탭 (메뉴/장바구니/주문내역)
├── pages/
│   ├── SetupPage.tsx        — 로그인 폼
│   ├── MenuPage.tsx         — 카테고리 탭 + 메뉴 그리드 + 담기 버튼
│   ├── CartPage.tsx         — 수량 조절 + 비우기 + 주문하기
│   ├── OrderConfirmPage.tsx — 최종 확인 + 주문 확정
│   ├── OrderSuccessPage.tsx — 성공 메시지 + 5초 카운트다운
│   └── OrderHistoryPage.tsx — 주문 목록 + 상태 배지
├── stores/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── orderStore.ts
└── api/
    └── client.ts            — axios 인스턴스 (인터셉터)
```

## 접근성
- 모든 버튼: min-h-touch (44px)
- 이미지: alt 텍스트
- 에러 메시지: role="alert"
- 토스트: aria-live="polite"
- data-testid 속성 추가 (자동화 테스트용)

## 기술 스택
- React 18 + TypeScript
- Vite (빌드)
- Tailwind CSS (스타일링)
- Zustand (상태 관리 + persist)
- Axios (HTTP 클라이언트)
- React Router v6 (라우팅)
