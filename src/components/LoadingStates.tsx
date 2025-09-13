import { Icon } from "@iconify/react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
      {text && (
        <p className="text-sm text-muted-foreground mt-2">{text}</p>
      )}
    </div>
  );
}

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`h-4 bg-muted rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

interface ErrorBoundaryProps {
  error: Error | null;
  resetError: () => void;
  fallback?: React.ReactNode;
}

export function ErrorDisplay({ 
  error, 
  resetError, 
  fallback 
}: ErrorBoundaryProps) {
  if (!error) return null;

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <Icon icon="mingcute:warning-line" className="w-8 h-8 text-red-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        Something went wrong
      </h3>
      
      <p className="text-white/70 text-sm mb-4 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      
      <div className="flex space-x-3">
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-transparent text-white border border-white/30 rounded-lg hover:border-white/60 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressIndicator({ 
  current, 
  total, 
  label = 'Progress',
  className = '' 
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-sm text-white/70">{percentage}%</span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-center space-x-1">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < current ? 'bg-primary' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  className?: string;
}

export function ConnectionStatus({ 
  isConnected, 
  isReconnecting = false,
  className = '' 
}: ConnectionStatusProps) {
  if (isConnected) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <Icon 
          icon={isReconnecting ? "mingcute:loading-line" : "mingcute:wifi-off-line"} 
          className={`w-4 h-4 ${isReconnecting ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm font-medium">
          {isReconnecting ? 'Reconnecting...' : 'Connection lost'}
        </span>
      </div>
    </div>
  );
}
