# Unit 1: API Layer Summary

## 구현된 엔드포인트

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/admin/login` | - | 관리자 로그인 |
| POST | `/api/auth/table/login` | - | 테이블 로그인 |
| GET | `/api/auth/verify` | JWT | 토큰 검증 |

### Categories (`/api/categories`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | Table/Admin | 카테고리 목록 |
| POST | `/api/categories` | Admin | 카테고리 생성 |
| PUT | `/api/categories/:id` | Admin | 카테고리 수정 |
| DELETE | `/api/categories/:id` | Admin | 카테고리 삭제 |

### Menus (`/api/menus`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/menus` | Table/Admin | 메뉴 목록 (?categoryId) |
| POST | `/api/menus` | Admin | 메뉴 등록 |
| PUT | `/api/menus/:id` | Admin | 메뉴 수정 |
| DELETE | `/api/menus/:id` | Admin | 메뉴 삭제 |
| PATCH | `/api/menus/reorder` | Admin | 순서 변경 |

### Orders (`/api/orders`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Table/Admin | 주문 생성 |
| GET | `/api/orders` | Table/Admin | 주문 목록 |
| GET | `/api/orders/history` | Admin | 과거 내역 |
| GET | `/api/orders/:id` | Table/Admin | 주문 상세 |
| PATCH | `/api/orders/:id/status` | Admin | 상태 변경 |
| DELETE | `/api/orders/:id` | Admin | 주문 삭제 |

## Middleware
- `requireAuth` — JWT 토큰 검증 (공통)
- `requireAdmin` — 관리자 역할 확인
- `requireTable` — 테이블 역할 확인
- `validate(schema)` — Zod 스키마 유효성 검증
- `errorHandler` — 전역 에러 핸들링

## 요청 검증 (Zod)
- `adminLoginSchema` — storeId(UUID), username(1-50), password(1-100)
- `tableLoginSchema` — storeId(UUID), tableNumber(int≥1), password(1-100)
- `createOrderSchema` — tableId(UUID), items(1-20개, menuItemId+quantity)
- `updateStatusSchema` — status(PENDING|PREPARING|COMPLETED)
- `createMenuSchema` — name(1-100), price(int≥0), categoryId(UUID)
- `createCategorySchema` — name(1-50), sortOrder(int≥0, optional)
