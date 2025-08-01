import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const ReportPage: React.FC = () => {
  // Инициализация Keycloak с PKCE
  const { keycloak, initialized } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверка аутентификации при инициализации
  useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      // Автоматический редирект на логин с PKCE
      keycloak.login();
    }
  }, [initialized, keycloak]);

  const downloadReport = async () => {
    if (!keycloak?.token) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Обновляем токен перед запросом
      try {
        const refreshed = await keycloak.updateToken(30); // Обновляем если осталось меньше 30 сек
        if (refreshed) {
          console.log('Token was refreshed');
        } else {
          console.log('Token is still valid');
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        keycloak.login();
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Обработка скачивания отчета
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Если ошибка связана с аутентификацией, предлагаем перелогиниться
      if (err instanceof Error && err.message.includes('401')) {
        keycloak.login();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-lg">Initializing authentication...</div>
    </div>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Usage Reports</h1>
            <button
                onClick={() => keycloak.logout()}
                className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>

          <button
              onClick={downloadReport}
              disabled={loading}
              className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? (
                <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Report...
            </span>
            ) : 'Download Report'}
          </button>

          {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded border border-red-200">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
                <button
                    onClick={() => keycloak.login()}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                >
                  Re-authenticate
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default ReportPage;