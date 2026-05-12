import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card } from './ui';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen render failed', error, info);
  }

  componentDidUpdate(previousProps: { children: ReactNode }) {
    if (previousProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen">
          <Card className="empty-home-card">
            <strong>화면을 불러오지 못했습니다</strong>
            <p>잠시 후 다시 시도해주세요.</p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
