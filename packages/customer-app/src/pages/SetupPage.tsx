import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function SetupPage() {
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(storeId, parseInt(tableNumber), password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError('로그인에 실패했습니다. 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">테이블 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매장 ID</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
              placeholder="매장 식별자 입력"
              required
              data-testid="setup-store-id"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
              placeholder="테이블 번호"
              min="1"
              required
              data-testid="setup-table-number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
              placeholder="비밀번호"
              required
              data-testid="setup-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-medium min-h-touch disabled:opacity-50"
            data-testid="setup-submit"
          >
            {isLoading ? '로그인 중...' : '설정 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
