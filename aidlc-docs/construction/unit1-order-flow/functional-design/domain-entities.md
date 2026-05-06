# Unit 1: 도메인 엔티티 정의

## Prisma Schema

```prisma
// 매장
model Store {
  id        String   @id @default(uuid())
  name      String
  code      String   @unique  // 매장 코드 (예: ST01)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  admins     Admin[]
  tables     Table[]
  categories Category[]
  menuItems  MenuItem[]
}

// 관리자
model Admin {
  id           String   @id @default(uuid())
  storeId      String
  username     String
  passwordHash String
  createdAt    DateTime @default(now())

  store Store @relation(fields: [storeId], references: [id])

  @@unique([storeId, username])
}

// 로그인 시도 기록
model LoginAttempt {
  id         String   @id @default(uuid())
  identifier String   // storeId:username 또는 storeId:tableNumber
  success    Boolean
  attemptAt  DateTime @default(now())

  @@index([identifier, attemptAt])
}

// 테이블
model Table {
  id           String   @id @default(uuid())
  storeId      String
  tableNumber  Int
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  store    Store          @relation(fields: [storeId], references: [id])
  sessions TableSession[]

  @@unique([storeId, tableNumber])
}

// 테이블 세션
model TableSession {
  id          String        @id @default(uuid())
  tableId     String
  status      SessionStatus @default(ACTIVE)
  startedAt   DateTime      @default(now())
  completedAt DateTime?

  table  Table   @relation(fields: [tableId], references: [id])
  orders Order[]

  @@index([tableId, status])
}

// 카테고리
model Category {
  id        String   @id @default(uuid())
  storeId   String
  name      String
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  store     Store      @relation(fields: [storeId], references: [id])
  menuItems MenuItem[]

  @@unique([storeId, name])
}

// 메뉴 항목
model MenuItem {
  id          String   @id @default(uuid())
  storeId     String
  categoryId  String
  name        String
  price       Int      // 원 단위 (정수)
  description String?
  imageUrl    String?
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  store      Store       @relation(fields: [storeId], references: [id])
  category   Category    @relation(fields: [categoryId], references: [id])
  orderItems OrderItem[]
}

// 주문
model Order {
  id          String      @id @default(uuid())
  orderNumber String      @unique  // ST01-0506-1117-001
  sessionId   String
  status      OrderStatus @default(PENDING)
  totalAmount Int         // 원 단위
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  session TableSession @relation(fields: [sessionId], references: [id])
  items   OrderItem[]

  @@index([sessionId, createdAt])
}

// 주문 항목
model OrderItem {
  id         String @id @default(uuid())
  orderId    String
  menuItemId String
  menuName   String // 주문 시점의 메뉴명 (스냅샷)
  quantity   Int
  unitPrice  Int    // 주문 시점의 단가 (스냅샷)

  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id])
}

// Enums
enum OrderStatus {
  PENDING    // 대기중
  PREPARING  // 준비중
  COMPLETED  // 완료
}

enum SessionStatus {
  ACTIVE     // 이용 중
  COMPLETED  // 이용 완료
}
```

---

## 엔티티 관계 다이어그램

```
Store (1) ----< (N) Admin
Store (1) ----< (N) Table
Store (1) ----< (N) Category
Store (1) ----< (N) MenuItem

Category (1) --< (N) MenuItem

Table (1) ----< (N) TableSession
TableSession (1) --< (N) Order
Order (1) ----< (N) OrderItem
OrderItem (N) >---- (1) MenuItem
```

---

## 주요 설계 결정

| 결정 | 내용 | 이유 |
|------|------|------|
| 가격은 Int (원 단위) | 소수점 없음 | 한국 원화는 소수점 불필요, 부동소수점 오류 방지 |
| OrderItem에 menuName/unitPrice 스냅샷 | 주문 시점 가격 보존 | 메뉴 가격 변경 시 기존 주문에 영향 없음 |
| orderNumber는 별도 필드 | UUID와 별개로 사람이 읽을 수 있는 번호 | 고객/관리자가 주문 식별에 사용 |
| onDelete: Cascade (OrderItem) | 주문 삭제 시 항목도 삭제 | 데이터 정합성 유지 |
