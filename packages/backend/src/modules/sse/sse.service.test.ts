import { SSEService } from './sse.service';
import { SSEEventType } from '@shared/types';
import { Response } from 'express';

// Mock Response 생성 헬퍼
function createMockResponse(): Response {
  const res = {
    writeHead: jest.fn(),
    write: jest.fn().mockReturnValue(true),
    end: jest.fn(),
    on: jest.fn(),
    writableEnded: false,
  } as unknown as Response;
  return res;
}

describe('SSEService', () => {
  let service: SSEService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new SSEService();
  });

  afterEach(() => {
    service.destroy();
    jest.useRealTimers();
  });

  describe('addClient', () => {
    it('클라이언트를 등록하고 clientId를 반환해야 한다', () => {
      const res = createMockResponse();
      const clientId = service.addClient(res);

      expect(clientId).toBeDefined();
      expect(typeof clientId).toBe('string');
      expect(service.getConnectedClients()).toBe(1);
    });

    it('SSE 헤더를 설정해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
    });

    it('초기 connected 이벤트를 전송해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      expect(res.write).toHaveBeenCalledWith(
        expect.stringContaining(`event: ${SSEEventType.CONNECTED}`),
      );
    });

    it('close 이벤트 리스너를 등록해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      expect(res.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('removeClient', () => {
    it('클라이언트를 맵에서 제거해야 한다', () => {
      const res = createMockResponse();
      const clientId = service.addClient(res);

      service.removeClient(clientId);

      expect(service.getConnectedClients()).toBe(0);
    });

    it('존재하지 않는 clientId에 대해 에러 없이 처리해야 한다', () => {
      expect(() => service.removeClient('non-existent')).not.toThrow();
    });
  });

  describe('broadcast', () => {
    it('모든 클라이언트에 이벤트를 전송해야 한다', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      service.addClient(res1);
      service.addClient(res2);

      service.broadcast(SSEEventType.ORDER_CREATED, { orderId: '123' });

      // 초기 connected 이벤트 + broadcast 이벤트
      expect(res1.write).toHaveBeenCalledTimes(2);
      expect(res2.write).toHaveBeenCalledTimes(2);
    });

    it('SSE 형식으로 메시지를 전송해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      service.broadcast(SSEEventType.ORDER_CREATED, { orderId: '123' });

      const lastCall = (res.write as jest.Mock).mock.calls[1][0];
      expect(lastCall).toContain('event: order:created');
      expect(lastCall).toContain('data: ');
      expect(lastCall).toContain('"orderId":"123"');
    });

    it('전송 실패한 클라이언트를 제거해야 한다', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      (res2.write as jest.Mock).mockReturnValueOnce(true).mockReturnValueOnce(false);

      service.addClient(res1);
      service.addClient(res2);

      service.broadcast(SSEEventType.ORDER_CREATED, { orderId: '123' });

      expect(service.getConnectedClients()).toBe(1);
    });
  });

  describe('heartbeat', () => {
    it('30초 간격으로 heartbeat를 전송해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      // 초기 connected 이벤트 후 write 호출 횟수 리셋
      (res.write as jest.Mock).mockClear();

      jest.advanceTimersByTime(30000);

      expect(res.write).toHaveBeenCalledWith(': heartbeat\n\n');
    });

    it('heartbeat 실패 시 클라이언트를 제거해야 한다', () => {
      const res = createMockResponse();
      service.addClient(res);

      (res.write as jest.Mock).mockReturnValue(false);

      jest.advanceTimersByTime(30000);

      expect(service.getConnectedClients()).toBe(0);
    });
  });

  describe('destroy', () => {
    it('모든 클라이언트를 정리해야 한다', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      service.addClient(res1);
      service.addClient(res2);

      service.destroy();

      expect(service.getConnectedClients()).toBe(0);
    });
  });
});
