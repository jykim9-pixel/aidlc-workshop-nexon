# 프론트엔드 컴포넌트 설계 - Unit 2: Admin App

## 1. 페이지 구조

```
admin-app/
├── LoginPage          — 관리자 로그인
├── DashboardPage      — 실시간 주문 대시보드 (메인)
├── MenuManagementPage — 메뉴/카테고리 관리
└── OrderHistoryPage   — 과거 주문 내역 조회
```

---

## 2. 컴포넌트 계층

### 2.1 DashboardPage

```
DashboardPage
├── ConnectionStatus        — SSE 연결 상태 표시
├── TableGrid               — 테이블 카드 그리드 (번호순 고정)
│   └── TableCard[]         — 개별 테이블 카드
│       ├── TableHeader     — 테이블 번호, 상태 뱃지
│       ├── OrderList       — 주문 목록 (최근 5건)
│       │   └── OrderItem[] — 개별 주문 행 (강조 표시 포함)
│       └── TableFooter     — 총 금액, 액션 버튼
├── OrderDetailModal        — 주문 상세 모달
└── CompleteConfirmModal    — 이용 완료 확인 모달
```

### 2.2 MenuManagementPage

```
MenuManagementPage
├── CategorySidebar         — 카테고리 목록 + 관리
│   ├── CategoryItem[]      — 개별 카테고리 (선택/수정/삭제)
│   └── AddCategoryForm     — 카테고리 추가 폼
├── MenuList                — 메뉴 목록 (선택된 카테고리)
│   └── MenuItemRow[]       — 개별 메뉴 행 (드래그 순서 조정)
├── MenuFormModal           — 메뉴 등록/수정 모달
└── DeleteConfirmModal      — 삭제 확인 모달
```

### 2.3 OrderHistoryPage

```
OrderHistoryPage
├── HistoryFilter           — 필터 (테이블, 날짜 범위)
├── HistoryList             — 이력 목록
│   └── HistoryItem[]       — 개별 이력 행
└── HistoryDetailModal      — 이력 상세 모달
```

---

## 3. 컴포넌트 상세 설계

### 3.1 ConnectionStatus

**목적**: SSE 연결 상태를 시각적으로 표시

| Props | 타입 | 설명 |
|-------|------|------|
| - | - | Store에서 직접 구독 |

| 내부 상태 (Store) | 타입 | 설명 |
|-------------------|------|------|
| isConnected | boolean | 연결 여부 |
| retryCount | number | 현재 재시도 횟수 |
| maxRetries | number | 최대 재시도 횟수 (10) |

| UI 상태 | 표시 |
|---------|------|
| 연결됨 | 초록색 점 + "실시간 연결됨" |
| 재연결 중 | 노란색 점 + "재연결 중 (3/10)" |
| 연결 실패 | 빨간색 점 + "연결 실패" + 새로고침 버튼 |

---

### 3.2 TableCard

**목적**: 개별 테이블의 현재 상태와 주문 요약 표시

| Props | 타입 | 설명 |
|-------|------|------|
| table | TableSummary | 테이블 요약 데이터 |
| onSelectOrder | (orderId) => void | 주문 상세 보기 |
| onStatusChange | (orderId, status) => void | 주문 상태 변경 |
| onComplete | (tableId) => void | 이용 완료 |

| UI 요소 | 설명 |
|---------|------|
| 테이블 번호 | 좌상단, 큰 글씨 |
| 상태 뱃지 | IDLE: 회색 "비어있음", OCCUPIED: 초록색 "사용중" |
| 주문 목록 | 최근 5건, PENDING 주문은 노란색 배경 강조 |
| 총 금액 | 하단, 현재 세션 누적 금액 |
| 이용 완료 버튼 | OCCUPIED 상태에서만 표시 |

**신규 주문 강조 규칙**:
- `order.status === 'PENDING'` 인 주문은 노란색 배경 + 펄스 애니메이션
- 관리자가 해당 주문을 "준비중"으로 변경하면 강조 해제
- 카드 전체에 신규 주문이 있으면 카드 테두리도 강조

---

### 3.3 OrderDetailModal

**목적**: 주문의 상세 항목과 상태 변경 UI 제공

| Props | 타입 | 설명 |
|-------|------|------|
| orderId | string | 주문 ID |
| isOpen | boolean | 모달 표시 여부 |
| onClose | () => void | 모달 닫기 |
| onStatusChange | (orderId, status) => void | 상태 변경 |
| onDelete | (orderId) => void | 주문 삭제 |

| UI 요소 | 설명 |
|---------|------|
| 주문 번호 | 상단 |
| 주문 시각 | 상단 |
| 현재 상태 | 뱃지 (색상 구분) |
| 항목 목록 | 메뉴명, 수량, 단가, 소계 |
| 총 금액 | 하단 합계 |
| 상태 변경 버튼 | 다음 유효 상태로만 변경 가능 |
| 삭제 버튼 | 확인 팝업 후 삭제 |

---

### 3.4 MenuFormModal

**목적**: 메뉴 등록/수정 폼

| Props | 타입 | 설명 |
|-------|------|------|
| mode | 'create' \| 'edit' | 모드 |
| menuItem | MenuItem \| null | 수정 시 기존 데이터 |
| categories | Category[] | 카테고리 목록 |
| isOpen | boolean | 모달 표시 여부 |
| onClose | () => void | 모달 닫기 |
| onSubmit | (data) => void | 저장 |

| 폼 필드 | 타입 | 검증 |
|---------|------|------|
| name | text | 필수, 1~50자 |
| price | number | 필수, 0 이상 정수 |
| description | textarea | 선택, 최대 200자 |
| categoryId | select | 필수 |
| imageUrl | text | 선택, URL 형식 |

**폼 검증 규칙**:
- 실시간 검증 (onChange)
- 제출 시 전체 검증
- 에러 메시지는 필드 하단에 표시

---

### 3.5 CompleteConfirmModal

**목적**: 이용 완료 전 확인

| Props | 타입 | 설명 |
|-------|------|------|
| tableNumber | number | 테이블 번호 |
| summary | { totalAmount, orderCount } | 세션 요약 |
| isOpen | boolean | 모달 표시 여부 |
| onConfirm | () => void | 확인 |
| onCancel | () => void | 취소 |

| UI 요소 | 설명 |
|---------|------|
| 경고 메시지 | "테이블 {N}번의 이용을 완료하시겠습니까?" |
| 요약 정보 | 총 주문 건수, 총 금액 |
| 안내 | "완료 후 주문 내역은 과거 이력으로 이동됩니다." |
| 확인/취소 버튼 | 확인은 빨간색 (위험 동작) |

---

## 4. 상태 관리 (Zustand Stores)

### 4.1 DashboardStore

```typescript
interface DashboardStore {
  // 상태
  tables: TableSummary[];
  selectedOrderId: string | null;
  isConnected: boolean;
  retryCount: number;

  // SSE 관리
  connectSSE(): void;
  disconnectSSE(): void;
  handleSSEEvent(event: SSEEvent): void;

  // 대시보드 데이터
  fetchTables(): Promise<void>;
  selectOrder(orderId: string | null): void;

  // 주문 액션
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  deleteOrder(orderId: string): Promise<void>;

  // 테이블 액션
  completeTable(tableId: string): Promise<void>;
}
```

**SSE 이벤트 핸들링**:

| 이벤트 | 처리 |
|--------|------|
| `order:created` | 해당 테이블의 latestOrders에 추가, hasNewOrder=true |
| `order:updated` | 해당 주문의 status 갱신, PENDING→PREPARING 시 isNew=false |
| `order:deleted` | 해당 주문 제거, totalAmount 재계산 |
| `table:completed` | 해당 테이블 IDLE로 리셋, 주문 목록 비우기 |

### 4.2 MenuStore

```typescript
interface MenuStore {
  // 상태
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategoryId: string | null;
  isLoading: boolean;

  // 카테고리
  fetchCategories(): Promise<void>;
  createCategory(data: { name: string; sortOrder: number }): Promise<void>;
  updateCategory(id: string, data: { name?: string; sortOrder?: number }): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  // 메뉴
  fetchMenuItems(categoryId?: string): Promise<void>;
  createMenuItem(data: CreateMenuItemInput): Promise<void>;
  updateMenuItem(id: string, data: UpdateMenuItemInput): Promise<void>;
  deleteMenuItem(id: string): Promise<void>;
  reorderMenuItems(items: { id: string; sortOrder: number }[]): Promise<void>;
}
```

### 4.3 HistoryStore

```typescript
interface HistoryStore {
  // 상태
  histories: OrderHistory[];
  filters: HistoryFilters;
  isLoading: boolean;

  // 액션
  fetchHistory(filters?: HistoryFilters): Promise<void>;
  setFilters(filters: Partial<HistoryFilters>): void;
  clearFilters(): void;
}

interface HistoryFilters {
  tableId?: string;
  dateFrom?: string;  // ISO 8601
  dateTo?: string;    // ISO 8601
}
```

---

## 5. Hooks

### 5.1 useSSE

```typescript
function useSSE(): {
  isConnected: boolean;
  retryCount: number;
  connect: () => void;
  disconnect: () => void;
}
```

- DashboardPage 마운트 시 자동 연결
- 언마운트 시 자동 해제
- 재연결 로직 캡슐화

### 5.2 useAuth

```typescript
function useAuth(): {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
```

### 5.3 useTables

```typescript
function useTables(): {
  tables: TableSummary[];
  isLoading: boolean;
  completeTable: (tableId: string) => Promise<void>;
  refreshTables: () => Promise<void>;
}
```

---

## 6. API 통합 포인트

| 컴포넌트/Store | API 엔드포인트 | 용도 |
|---------------|---------------|------|
| DashboardStore.connectSSE | GET /api/events/orders | SSE 연결 |
| DashboardStore.fetchTables | GET /api/tables | 테이블 목록 + 요약 |
| DashboardStore.updateOrderStatus | PATCH /api/orders/:id/status | 주문 상태 변경 |
| DashboardStore.deleteOrder | DELETE /api/orders/:id | 주문 삭제 |
| DashboardStore.completeTable | POST /api/tables/:id/complete | 이용 완료 |
| MenuStore.fetchCategories | GET /api/categories | 카테고리 목록 |
| MenuStore.createCategory | POST /api/categories | 카테고리 생성 |
| MenuStore.updateCategory | PUT /api/categories/:id | 카테고리 수정 |
| MenuStore.deleteCategory | DELETE /api/categories/:id | 카테고리 삭제 |
| MenuStore.fetchMenuItems | GET /api/menus | 메뉴 목록 |
| MenuStore.createMenuItem | POST /api/menus | 메뉴 등록 |
| MenuStore.updateMenuItem | PUT /api/menus/:id | 메뉴 수정 |
| MenuStore.deleteMenuItem | DELETE /api/menus/:id | 메뉴 삭제 |
| MenuStore.reorderMenuItems | PATCH /api/menus/reorder | 순서 변경 |
| HistoryStore.fetchHistory | GET /api/orders/history | 과거 이력 조회 |

---

## 7. 사용자 인터랙션 플로우

### 7.1 주문 상태 변경 플로우

```
1. 관리자가 TableCard의 주문 항목 클릭
2. OrderDetailModal 열림
3. "준비중으로 변경" 버튼 클릭
4. API 호출 (PATCH /api/orders/:id/status)
5. 성공 시: 모달 내 상태 갱신 + SSE로 다른 클라이언트에도 반영
6. 실패 시: 에러 토스트 표시
```

### 7.2 이용 완료 플로우

```
1. 관리자가 TableCard의 "이용 완료" 버튼 클릭
2. CompleteConfirmModal 열림 (요약 정보 표시)
3. "확인" 클릭
4. API 호출 (POST /api/tables/:id/complete)
5. 성공 시: 테이블 카드 IDLE로 리셋 + SSE 이벤트 발행
6. 실패 시: 에러 토스트 표시
```

### 7.3 메뉴 등록 플로우

```
1. 관리자가 MenuManagementPage에서 "메뉴 추가" 클릭
2. MenuFormModal 열림 (create 모드)
3. 폼 작성 (실시간 검증)
4. "저장" 클릭
5. 클라이언트 검증 통과 시 API 호출 (POST /api/menus)
6. 성공 시: 모달 닫기 + 목록 새로고침
7. 실패 시: 서버 에러 메시지 표시
```
