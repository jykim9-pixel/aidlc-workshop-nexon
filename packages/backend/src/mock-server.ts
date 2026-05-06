import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

const JWT_SECRET = 'mock-secret';
const STORE_ID = 'store-001';

// Mock data
const categories = [
  { id: 'cat-1', storeId: STORE_ID, name: '메인', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-2', storeId: STORE_ID, name: '사이드', sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-3', storeId: STORE_ID, name: '음료', sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const menuItems = [
  { id: 'menu-1', storeId: STORE_ID, categoryId: 'cat-1', name: '김치찌개', price: 9000, description: '돼지고기 김치찌개', imageUrl: null, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-2', storeId: STORE_ID, categoryId: 'cat-1', name: '된장찌개', price: 8000, description: '두부 된장찌개', imageUrl: null, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-3', storeId: STORE_ID, categoryId: 'cat-1', name: '비빔밥', price: 10000, description: '야채 비빔밥', imageUrl: null, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-4', storeId: STORE_ID, categoryId: 'cat-1', name: '불고기', price: 15000, description: '소불고기 정식', imageUrl: null, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-5', storeId: STORE_ID, categoryId: 'cat-2', name: '계란말이', price: 5000, description: '치즈 계란말이', imageUrl: null, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[1] },
  { id: 'menu-6', storeId: STORE_ID, categoryId: 'cat-2', name: '김치전', price: 7000, description: '바삭한 김치전', imageUrl: null, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[1] },
  { id: 'menu-7', storeId: STORE_ID, categoryId: 'cat-3', name: '콜라', price: 2000, description: '코카콜라 355ml', imageUrl: null, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[2] },
  { id: 'menu-8', storeId: STORE_ID, categoryId: 'cat-3', name: '사이다', price: 2000, description: '칠성사이다 355ml', imageUrl: null, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[2] },
];

const orders: Array<{ id: string; orderNumber: string; sessionId: string; status: string; totalAmount: number; createdAt: string; updatedAt: string; items: Array<{ id: string; orderId: string; menuItemId: string; menuName: string; quantity: number; unitPrice: number }> }> = [];
let orderCounter = 0;

// --- Auth ---
app.post('/api/auth/table/login', (req, res) => {
  const { storeId, tableNumber, password } = req.body;
  if (password === '1234') {
    const token = jwt.sign({ tableId: `table-${tableNumber}`, storeId, sessionId: 'session-1', role: 'table' }, JWT_SECRET, { expiresIn: '16h' } as jwt.SignOptions);
    res.json({ success: true, data: { token, expiresAt: new Date(Date.now() + 16*60*60*1000).toISOString(), tableId: `table-${tableNumber}`, sessionId: 'session-1' } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ adminId: 'admin-1', storeId: STORE_ID, role: 'admin' }, JWT_SECRET, { expiresIn: '16h' } as jwt.SignOptions);
    res.json({ success: true, data: { token, expiresAt: new Date(Date.now() + 16*60*60*1000).toISOString() } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    res.json({ success: true, data: decoded });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// --- Categories ---
app.get('/api/categories', (_req, res) => {
  res.json({ success: true, data: categories });
});

// --- Menus ---
app.get('/api/menus', (req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  const filtered = categoryId ? menuItems.filter(m => m.categoryId === categoryId) : menuItems;
  res.json({ success: true, data: filtered });
});

// --- Orders ---
app.post('/api/orders', (req, res) => {
  orderCounter++;
  const { items } = req.body;
  const now = new Date();
  const orderNumber = `ST01-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}-${String(orderCounter).padStart(3,'0')}`;

  const orderItems = items.map((item: { menuItemId: string; quantity: number }, i: number) => {
    const menu = menuItems.find(m => m.id === item.menuItemId);
    return { id: `oi-${orderCounter}-${i}`, orderId: `order-${orderCounter}`, menuItemId: item.menuItemId, menuName: menu?.name || 'Unknown', quantity: item.quantity, unitPrice: menu?.price || 0 };
  });

  const totalAmount = orderItems.reduce((sum: number, oi: { unitPrice: number; quantity: number }) => sum + oi.unitPrice * oi.quantity, 0);

  const order = { id: `order-${orderCounter}`, orderNumber, sessionId: 'session-1', status: 'PENDING', totalAmount, createdAt: now.toISOString(), updatedAt: now.toISOString(), items: orderItems };
  orders.push(order);

  res.status(201).json({ success: true, data: order });
});

app.get('/api/orders', (req, res) => {
  const sessionId = req.query.sessionId as string;
  const filtered = sessionId ? orders.filter(o => o.sessionId === sessionId) : orders;
  res.json({ success: true, data: filtered });
});

// --- Health ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Test accounts:');
  console.log('  Table: storeId=store-001, tableNumber=1, password=1234');
  console.log('  Admin: username=admin, password=admin123');
});
