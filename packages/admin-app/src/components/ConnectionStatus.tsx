import React from 'react';
import { useSSE } from '../hooks/useSSE';

export function ConnectionStatus() {
  const { isConnected, retryCount, maxRetries } = useSSE();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm" data-testid="connection-status">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-green-700">실시간 연결됨</span>
      </div>
    );
  }

  if (retryCount > 0 && retryCount <= maxRetries) {
    return (
      <div className="flex items-center gap-2 text-sm" data-testid="connection-status">
        <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
        <span className="text-yellow-700">
          재연결 중 ({retryCount}/{maxRetries})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm" data-testid="connection-status">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      <span className="text-red-700">연결 실패</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
        data-testid="connection-refresh-button"
      >
        새로고침
      </button>
    </div>
  );
}
