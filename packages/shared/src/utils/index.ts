export function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isValidOrderStatusTransition(
  current: string,
  next: string
): boolean {
  const transitions: Record<string, string> = {
    PENDING: 'PREPARING',
    PREPARING: 'COMPLETED',
  };
  return transitions[current] === next;
}
