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
  { id: 'menu-1', storeId: STORE_ID, categoryId: 'cat-1', name: '김치찌개', price: 9000, description: '돼지고기 김치찌개', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Korean_stew-Kimchi_jjigae-05.jpg/500px-Korean_stew-Kimchi_jjigae-05.jpg', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-2', storeId: STORE_ID, categoryId: 'cat-1', name: '된장찌개', price: 8000, description: '두부 된장찌개', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Doenjang-jjigae_3.jpg/500px-Doenjang-jjigae_3.jpg', sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-3', storeId: STORE_ID, categoryId: 'cat-1', name: '비빔밥', price: 10000, description: '야채 비빔밥', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Korean_cuisine-Bibimbap-08.jpg/500px-Korean_cuisine-Bibimbap-08.jpg', sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-4', storeId: STORE_ID, categoryId: 'cat-1', name: '불고기', price: 15000, description: '소불고기 정식', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Korean.cuisine-Bulgogi-01.jpg/500px-Korean.cuisine-Bulgogi-01.jpg', sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[0] },
  { id: 'menu-5', storeId: STORE_ID, categoryId: 'cat-2', name: '계란말이', price: 5000, description: '치즈 계란말이', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Korean_Style_Omelette.jpg/500px-Korean_Style_Omelette.jpg', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[1] },
  { id: 'menu-6', storeId: STORE_ID, categoryId: 'cat-2', name: '김치전', price: 7000, description: '바삭한 김치전', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Korean_pancake-Haemul_kimchijeon-01.jpg', sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[1] },
  { id: 'menu-7', storeId: STORE_ID, categoryId: 'cat-3', name: '콜라', price: 2000, description: '코카콜라 355ml', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/CocaColaCan.jpg/500px-CocaColaCan.jpg', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[2] },
  { id: 'menu-8', storeId: STORE_ID, categoryId: 'cat-3', name: '사이다', price: 2000, description: '칠성사이다 355ml', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Lemon_lime_soda.jpg/500px-Lemon_lime_soda.jpg', sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories[2] },
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

  // SSE: 주문 생성 이벤트 전송
  const ssePayload = {
    orderId: order.id,
    tableId: 'table-1',
    tableNumber: 1,
    items: orderItems.map((oi: { menuName: string; quantity: number; unitPrice: number }) => ({
      menuItemName: oi.menuName,
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      subtotal: oi.unitPrice * oi.quantity,
    })),
    totalAmount,
    orderedAt: now.toISOString(),
  };
  broadcastSSE('order:created', ssePayload);

  res.status(201).json({ success: true, data: order });
});

app.get('/api/orders', (req, res) => {
  const sessionId = req.query.sessionId as string;
  const filtered = sessionId ? orders.filter(o => o.sessionId === sessionId) : orders;
  res.json({ success: true, data: filtered });
});

// --- Admin: Tables ---
const tables = [
  { id: 'table-1', storeId: STORE_ID, tableNumber: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-2', storeId: STORE_ID, tableNumber: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-3', storeId: STORE_ID, tableNumber: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-4', storeId: STORE_ID, tableNumber: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-5', storeId: STORE_ID, tableNumber: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

app.get('/api/tables', (_req, res) => {
  res.json(tables);
});

app.get('/api/tables/:id/summary', (req, res) => {
  const table = tables.find(t => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const tableOrders = orders.filter(o => o.sessionId === 'session-1');
  const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const summary = {
    tableId: table.id,
    tableNumber: table.tableNumber,
    status: tableOrders.length > 0 ? 'OCCUPIED' : 'IDLE',
    sessionId: tableOrders.length > 0 ? 'session-1' : null,
    totalAmount: table.id === 'table-1' ? totalAmount : 0,
    orderCount: table.id === 'table-1' ? tableOrders.length : 0,
    latestOrders: table.id === 'table-1' ? tableOrders.slice(-5).reverse().map(o => ({
      orderId: o.id,
      status: o.status,
      totalAmount: o.totalAmount,
      itemCount: o.items.length,
      orderedAt: o.createdAt,
      isNew: o.status === 'PENDING',
    })) : [],
    hasNewOrder: table.id === 'table-1' ? tableOrders.some(o => o.status === 'PENDING') : false,
  };

  res.json(summary);
});

app.post('/api/tables/:id/complete', (req, res) => {
  const archivedOrders = orders.length;
  orders.length = 0;
  broadcastSSE('table:completed', { tableId: req.params.id, tableNumber: 1, sessionSummary: { totalAmount: 0, orderCount: archivedOrders, completedAt: new Date().toISOString() } });
  res.json({ success: true, archivedOrders });
});

// --- Admin: Order actions ---
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  // admin-app expects items with menuItem.name and subtotal
  const formattedOrder = {
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      menuItem: { name: item.menuName },
      subtotal: item.unitPrice * item.quantity,
    })),
  };
  res.json(formattedOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const previousStatus = order.status;
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  broadcastSSE('order:updated', { orderId: order.id, tableId: 'table-1', previousStatus, newStatus: order.status, updatedAt: order.updatedAt });
  res.json({ success: true, data: order });
});

app.delete('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  orders.splice(idx, 1);
  broadcastSSE('order:deleted', { orderId: req.params.id, tableId: 'table-1', deletedAt: new Date().toISOString() });
  res.json({ success: true });
});

// --- Admin: Menu management ---
app.post('/api/menus', (req, res) => {
  const { name, price, description, categoryId, imageUrl } = req.body;
  const newItem = { id: `menu-${Date.now()}`, storeId: STORE_ID, categoryId, name, price, description, imageUrl: imageUrl || null, sortOrder: menuItems.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), category: categories.find(c => c.id === categoryId) };
  menuItems.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

app.put('/api/menus/:id', (req, res) => {
  const item = menuItems.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu not found' });
  Object.assign(item, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: item });
});

app.delete('/api/menus/:id', (req, res) => {
  const idx = menuItems.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Menu not found' });
  menuItems.splice(idx, 1);
  res.json({ success: true });
});

// --- SSE (Server-Sent Events) ---
const sseClients: Set<any> = new Set();

function broadcastSSE(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    client.write(payload);
  });
}

app.get('/api/events/orders', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // 연결 이벤트 전송
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to SSE' })}\n\n`);

  sseClients.add(res);

  // 하트비트
  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    sseClients.delete(res);
    clearInterval(heartbeat);
  });
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
