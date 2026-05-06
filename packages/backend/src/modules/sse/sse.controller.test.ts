import request from 'supertest';
import express from 'express';
import { sseController } from './sse.controller';

// SSE Service Mock
jest.mock('./sse.service', () => ({
  sseService: {
    addClient: jest.fn().mockReturnValue('mock-client-id'),
    getConnectedClients: jest.fn().mockReturnValue(1),
  },
}));

describe('SSE Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/api/events', sseController);
  });

  describe('GET /api/events/orders', () => {
    it('SSE 연결을 설정해야 한다', async () => {
      const response = await request(app)
        .get('/api/events/orders')
        .set('Accept', 'text/event-stream');

      // SSE 엔드포인트는 스트림이므로 연결이 유지됨
      // supertest에서는 응답 헤더로 확인
      expect(response.status).toBe(200);
    });
  });
});
