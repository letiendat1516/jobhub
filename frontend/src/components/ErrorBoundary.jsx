import { Component } from 'react';

/**
 * ErrorBoundary — catch render-time errors in the React tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 *
 * Optionally pass a custom `fallback` prop (React node) to override
 * the default UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to your error-tracking service (e.g. Sentry).
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Đã xảy ra lỗi
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Trang này gặp sự cố
          </h1>
          <p className="mt-2 text-slate-500">
            Vui lòng tải lại trang hoặc quay lại sau.
          </p>
          <button
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 max-h-40 w-full overflow-auto rounded border bg-slate-50 p-4 text-left text-xs text-slate-700">
              {String(this.state.error)}
            </pre>
          )}
        </main>
      );
    }
    return this.props.children;
  }
}

