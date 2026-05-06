# Unit 1: 프론트엔드 컴포넌트 설계 (customer-app)

## 페이지 구조

```
customer-app/
├── pages/
│   ├── SetupPage        # 초기 설정 (1회)
│   ├── MenuPage         # 메뉴 조회 (기본 화면)
│   ├── CartPage         # 장바구니
│   ├── OrderConfirmPage # 주문 확인
│   ├── OrderSuccessPage # 주문 성공 (5초 후 리다이렉트)
│   └── OrderHistoryPage # 주문 내역
├── components/
│   ├── layout/
│   │   ├── AppLayout    # 전체 레이아웃 (하단 네비게이션)
│   │   └── BottomNav    # 하단 탭 (메뉴/장바구니/주문내역)
│   ├── menu/
│   │   ├── CategoryNav  # 카테고리 탭 네비게이션
│   │   ├── MenuGrid     # 메뉴 카드 그리드
│   │   ├── MenuCard     # 개별 메뉴 카드
│   │   └── MenuDetail   # 메뉴 상세 모달
│   ├── cart/
│   │   ├── CartList     # 장바구니 항목 목록
│   │   ├── CartItem     # 개별 장바구니 항목
│   │   ├── CartSummary  # 총 금액 표시
│   │   └── CartEmpty    # 빈 장바구니 안내
│   ├── order/
│   │   ├── OrderList    # 주문 목록
│   │   ├── OrderCard    # 개별 주문 카드
│   │   └── OrderStatus  # 주문 상태 배지
│   └── common/
│       ├── Button       # 공통 버튼
│       ├── Modal        # 공통 모달
│       ├── Toast        # 토스트 알림
│       ├── Loading      # 로딩 스피너
│       └── ErrorMessage # 에러 메시지
├── stores/
│   ├── authStore        # 인증 상태
│   ├── cartStore        # 장바구니 (persist)
│   └── orderStore       # 주문 상태
├── hooks/
│   ├── useAuth          # 인증 로직
│   ├── useMenu          # 메뉴 조회
│   └── useOrder         # 주문 생성/조회
└── api/
    ├── authApi          # 인증 API 호출
    ├── menuApi          # 메뉴 API 호출
    └── orderApi         # 주문 API 호출
```

---

## 페이지별 상세 설계

### SetupPage (초기 설정)
**표시 조건**: localStorage에 인증 정보 없을 때
**컴포넌트**: 입력 폼 (매장 ID, 테이블 번호, 비밀번호)
**동작**:
- 입력 → 로그인 API 호출 → 성공 시 토큰 저장 → MenuPage로 이동
- 실패 시 에러 메시지 표시

### MenuPage (메뉴 조회 - 기본 화면)
**컴포넌트 구성**:
```
+----------------------------------+
| [CategoryNav - 상단 고정]         |
| 전체 | 메인 | 사이드 | 음료 | ... |
+----------------------------------+
| [MenuGrid]                       |
| +--------+ +--------+ +--------+ |
| |MenuCard| |MenuCard| |MenuCard| |
| | 이미지  | | 이미지  | | 이미지  | |
| | 메뉴명  | | 메뉴명  | | 메뉴명  | |
| | ₩가격  | | ₩가격  | | ₩가격  | |
| | [담기]  | | [담기]  | | [담기]  | |
| +--------+ +--------+ +--------+ |
+----------------------------------+
| [BottomNav]                      |
| 메뉴(활성) | 장바구니(N) | 주문내역 |
+----------------------------------+
```

**상태**: 선택된 카테고리 ID
**API**: GET /api/menus?categoryId=xxx
**인터랙션**:
- 카테고리 탭 → 해당 메뉴 필터링
- "담기" 버튼 → cartStore.addItem() → 토스트 "장바구니에 추가됨"
- 메뉴 카드 탭 → MenuDetail 모달 열기

### CartPage (장바구니)
**컴포넌트 구성**:
```
+----------------------------------+
| 장바구니                    [비우기]|
+----------------------------------+
| [CartList]                       |
| +------------------------------+ |
| | 메뉴명        [-] 2 [+]     | |
| | ₩단가         소계: ₩금액   | |
| |                        [삭제]| |
| +------------------------------+ |
| +------------------------------+ |
| | 메뉴명        [-] 1 [+]     | |
| | ₩단가         소계: ₩금액   | |
| |                        [삭제]| |
| +------------------------------+ |
+----------------------------------+
| [CartSummary]                    |
| 총 N개 항목     합계: ₩총금액    |
| [주문하기]                        |
+----------------------------------+
```

**상태**: cartStore (Zustand + persist)
**인터랙션**:
- +/- 버튼 → 수량 변경 → 총액 재계산
- 수량 0 → 항목 자동 삭제
- "비우기" → 확인 팝업 → 전체 삭제
- "주문하기" → OrderConfirmPage로 이동
- 20종류 초과 시 추가 불가 안내

### OrderConfirmPage (주문 확인)
**컴포넌트 구성**:
```
+----------------------------------+
| 주문 확인                         |
+----------------------------------+
| 테이블: N번                       |
+----------------------------------+
| 메뉴명 x수량          ₩금액      |
| 메뉴명 x수량          ₩금액      |
| 메뉴명 x수량          ₩금액      |
+----------------------------------+
| 총 주문 금액:         ₩총금액     |
+----------------------------------+
| [돌아가기]        [주문 확정]      |
+----------------------------------+
```

**인터랙션**:
- "주문 확정" → POST /api/orders → 성공 시 OrderSuccessPage
- 실패 시 에러 메시지 + 장바구니 유지

### OrderSuccessPage (주문 성공)
**표시 내용**: 주문 번호, "주문이 접수되었습니다"
**동작**: 5초 카운트다운 → MenuPage 자동 리다이렉트
**부수 효과**: cartStore.clearCart()

### OrderHistoryPage (주문 내역)
**컴포넌트 구성**:
```
+----------------------------------+
| 주문 내역                         |
+----------------------------------+
| [OrderCard]                      |
| 주문번호: ST01-0506-1117-001     |
| 시각: 11:17                      |
| 메뉴1 x2, 메뉴2 x1              |
| ₩금액          [상태: 준비중]     |
+----------------------------------+
| [OrderCard]                      |
| 주문번호: ST01-0506-1105-002     |
| 시각: 11:05                      |
| 메뉴3 x1                        |
| ₩금액          [상태: 완료]      |
+----------------------------------+
```

**API**: GET /api/orders?sessionId=xxx
**상태 색상**:
- 대기중: 노란색/주황색
- 준비중: 파란색
- 완료: 초록색

---

## Zustand 스토어 상세

### authStore
```typescript
interface AuthState {
  token: string | null;
  tableId: string | null;
  storeId: string | null;
  sessionId: string | null;
  tableNumber: number | null;
  isAuthenticated: boolean;

  login(storeId: string, tableNumber: number, password: string): Promise<void>;
  logout(): void;
  verifyToken(): Promise<boolean>;
}
// persist: localStorage (token, tableId, storeId, tableNumber)
```

### cartStore
```typescript
interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem(menuItem: { id: string; name: string; price: number; imageUrl?: string }): void;
  removeItem(menuItemId: string): void;
  updateQuantity(menuItemId: string, quantity: number): void;
  clearCart(): void;
  getTotalAmount(): number;
  getItemCount(): number;
  getTotalTypes(): number;
}
// persist: localStorage (items)
// 규칙: getTotalTypes() >= 20이면 addItem 차단
```

### orderStore
```typescript
interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  fetchOrders(sessionId: string): Promise<void>;
  createOrder(data: CreateOrderInput): Promise<Order>;
  clearError(): void;
}
```

---

## 라우팅

```typescript
const routes = [
  { path: '/setup', element: <SetupPage /> },
  { path: '/', element: <MenuPage /> },        // 기본 화면
  { path: '/cart', element: <CartPage /> },
  { path: '/order/confirm', element: <OrderConfirmPage /> },
  { path: '/order/success/:orderNumber', element: <OrderSuccessPage /> },
  { path: '/orders', element: <OrderHistoryPage /> },
];

// 인증 가드: token 없으면 /setup으로 리다이렉트
```

---

## 접근성 고려사항

- 모든 버튼: 최소 44x44px 터치 타겟
- 이미지: alt 텍스트 (메뉴명)
- 색상 대비: WCAG AA 기준 충족
- 포커스 관리: 모달 열림 시 포커스 트랩
- 상태 변경: aria-live로 스크린 리더 알림
