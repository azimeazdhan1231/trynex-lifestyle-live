import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Log error to console for debugging
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo, this.state.errorId);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please send this to support.');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorReport, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Error report copied to clipboard. Please send this to support.');
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl border-red-200">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                কিছু সমস্যা হয়েছে
              </CardTitle>
              <p className="text-gray-600 mt-2">
                দুঃখিত, কিছু ভুল হয়েছে। আমরা এটি ঠিক করার চেষ্টা করছি।
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details for Developers */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Developer Information
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Error:</strong> {this.state.error.message}</p>
                    <p><strong>Error ID:</strong> {this.state.errorId}</p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={this.handleReload}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  পুনরায় লোড করুন
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  হোমে যান
                </Button>
                
                <Button
                  onClick={this.handleReportError}
                  variant="outline"
                  className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  রিপোর্ট করুন
                </Button>
              </div>

              {/* Helpful Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">কি করতে পারেন:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• পৃষ্ঠাটি পুনরায় লোড করার চেষ্টা করুন</li>
                  <li>• ব্রাউজার ক্যাশ মুছে ফেলুন</li>
                  <li>• অন্য ব্রাউজারে চেষ্টা করুন</li>
                  <li>• সমস্যা চলতে থাকলে আমাদের জানান</li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="text-center text-sm text-gray-500">
                <p>সাহায্যের জন্য যোগাযোগ করুন:</p>
                <p className="font-medium text-gray-700">📧 support@trynexlifestyle.com</p>
                <p className="font-medium text-gray-700">📞 +880 1234-567890</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}