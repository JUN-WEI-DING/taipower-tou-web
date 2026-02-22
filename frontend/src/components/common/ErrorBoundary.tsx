import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { AlertTriangle, RefreshCw } from '../icons';

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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
            <Card className="max-w-md w-full shadow-xl">
              <CardBody className="p-8 text-center space-y-6">
                {/* Error Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 mx-auto rounded-full bg-danger-100 flex items-center justify-center"
                >
                  <AlertTriangle size={40} className="text-danger" />
                </motion.div>

                {/* Error Message */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    應用程式發生錯誤
                  </h2>
                  <p className="text-default-600">
                    很抱歉，應用程式遇到意外錯誤。請重新整理頁面或稍後再試。
                  </p>
                </div>

                {/* Error Details (Expandable) */}
                {this.state.error && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm text-default-500 hover:text-default-700 transition-colors">
                      檢視錯誤詳情
                    </summary>
                    <div className="mt-3 p-3 bg-danger-50 rounded-lg border border-danger-200">
                      <pre className="text-xs text-danger-700 whitespace-pre-wrap break-all">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    color="primary"
                    size="lg"
                    className="flex-1"
                    startContent={<RefreshCw size={18} />}
                    onClick={() => window.location.reload()}
                  >
                    重新載入頁面
                  </Button>
                  <Button
                    color="default"
                    size="lg"
                    variant="bordered"
                    onClick={this.handleReset}
                  >
                    重試
                  </Button>
                </div>

                {/* Support Info */}
                <p className="text-xs text-default-400 pt-4 border-t border-divider">
                  如果問題持續發生，請確認您的瀏覽器是否支援 JavaScript
                </p>
              </CardBody>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Import motion for animation
import { motion } from 'framer-motion';
