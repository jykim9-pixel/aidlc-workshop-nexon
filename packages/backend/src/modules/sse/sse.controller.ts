import { Router, Request, Response } from 'express';
import { sseService } from './sse.service';

const router = Router();

/**
 * GET /api/events/orders
 * SSE 주문 이벤트 스트림
 * 인증: JWT 필수 (관리자)
 */
router.get('/orders', (req: Request, res: Response) => {
  // JWT 인증은 미들웨어에서 처리 (authMiddleware 적용)
  const clientId = sseService.addClient(res);

  // 연결 로그
  console.log(`[SSE] Client connected: ${clientId} (total: ${sseService.getConnectedClients()})`);

  // 연결 종료 시 로그
  res.on('close', () => {
    console.log(
      `[SSE] Client disconnected: ${clientId} (total: ${sseService.getConnectedClients()})`,
    );
  });
});

export const sseController = router;
