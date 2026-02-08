import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for widgets (ChatWidget, EmergencyWidget)
 * Fails silently without blocking the main app
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Widget Error (${this.props.widgetName || 'Unknown'}):`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Return null to hide the widget completely if it fails
      // This prevents blocking the main app
      return null;
    }

    return this.props.children;
  }
}

/**
 * Minimal error fallback for widgets
 * Shows a small error indicator without blocking the UI
 */
export const WidgetErrorFallback = ({ 
  widgetName, 
  onRetry 
}: { 
  widgetName: string; 
  onRetry?: () => void;
}) => (
  <div className="fixed bottom-12 right-12 z-50">
    <button
      onClick={onRetry}
      className="rounded-full w-12 h-12 bg-red-100 hover:bg-red-200 shadow-lg flex items-center justify-center transition-all"
      title={`${widgetName} unavailable. Click to retry.`}
    >
      <AlertCircle className="w-6 h-6 text-red-600" />
    </button>
  </div>
);
