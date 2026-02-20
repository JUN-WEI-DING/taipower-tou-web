import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full px-4">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  應用程式發生錯誤
                </h2>
                <p className="text-gray-600 mb-4">
                  很抱歉，應用程式遇到意外錯誤。請重新整理頁面或稍後再試。
                </p>
                {this.state.error && (
                  <details className="text-left text-sm text-gray-500 mt-4">
                    <summary className="cursor-pointer hover:text-gray-700">
                      錯誤詳情
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  重新載入
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
