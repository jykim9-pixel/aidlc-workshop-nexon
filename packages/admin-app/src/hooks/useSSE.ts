import { useEffect } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { DEFAULT_SSE_CONFIG } from '@shared/types/sse';

/**
 * SSE 연결 관리 Hook
 * DashboardPage 마운트 시 자동 연결, 언마운트 시 해제
 */
export function useSSE() {
  const isConnected = useDashboardStore((state) => state.isConnected);
  const retryCount = useDashboardStore((state) => state.retryCount);
  const connectSSE = useDashboardStore((state) => state.connectSSE);
  const disconnectSSE = useDashboardStore((state) => state.disconnectSSE);

  useEffect(() => {
    connectSSE();

    return () => {
      disconnectSSE();
    };
  }, [connectSSE, disconnectSSE]);

  return {
    isConnected,
    retryCount,
    maxRetries: DEFAULT_SSE_CONFIG.maxRetries,
    connect: connectSSE,
    disconnect: disconnectSSE,
  };
}
