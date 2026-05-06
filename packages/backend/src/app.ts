import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { menuRouter } from './modules/menu/menu.router';
import { orderRouter } from './modules/order/order.router';
import { sseRouter } from './modules/sse/sse.router';
import { tableRouter } from './modules/table/table.router';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', menuRouter.categories);
app.use('/api/menus', menuRouter.menus);
app.use('/api/orders', orderRouter);
app.use('/api/tables', tableRouter);
app.use('/api/events', sseRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export { app };
