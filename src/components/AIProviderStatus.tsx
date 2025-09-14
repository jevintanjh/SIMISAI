import React from 'react';
import { useAIProviderIndicator } from '../hooks/use-ai-provider-status';

interface AIProviderStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function AIProviderStatus({ showDetails = false, className = '' }: AIProviderStatusProps) {
  const { status, isLoading, error, refreshStatus, indicator } = useAIProviderIndicator();

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'orange': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'gray': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(indicator.color)} ${className}`}>
        <span className="mr-1">{indicator.icon}</span>
        {indicator.text}
      </div>
    );
  }

  // Detailed status panel
  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">AI Provider Status</h3>
        <button
          onClick={refreshStatus}
          disabled={isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isLoading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Current Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(indicator.color)}`}>
          <span className="mr-2">{indicator.icon}</span>
          {indicator.text}
        </div>
        {status?.recommendation.reason && (
          <p className="text-xs text-gray-600 mt-1">{status.recommendation.reason}</p>
        )}
      </div>

      {/* Provider Details */}
      {status && (
        <div className="space-y-3">
          {/* SEA-LION Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">🦁</span>
              <div>
                <p className="text-sm font-medium">SEA-LION 27B</p>
                <p className="text-xs text-gray-600">Custom ASEAN Medical AI</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs px-2 py-1 rounded-full ${status.providers.sagemaker.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status.providers.sagemaker.available ? 'Available' : 'Unavailable'}
              </div>
              {status.providers.sagemaker.responseTime > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {status.providers.sagemaker.responseTime}ms
                </p>
              )}
            </div>
          </div>

          {/* OpenAI Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">🤖</span>
              <div>
                <p className="text-sm font-medium">OpenAI GPT-4</p>
                <p className="text-xs text-gray-600">Fast & Reliable Fallback</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs px-2 py-1 rounded-full ${status.providers.openai.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status.providers.openai.available ? 'Available' : 'Unavailable'}
              </div>
              {status.providers.openai.responseTime > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {status.providers.openai.responseTime}ms
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ Status check failed: {error}
        </div>
      )}

      {/* Last Updated */}
      {status?.recommendation.timestamp && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(status.recommendation.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Simple AI Status Badge for headers/navbars
 */
export function AIStatusBadge({ className = '' }: { className?: string }) {
  const { indicator } = useAIProviderIndicator();
  
  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'orange': return 'bg-orange-500';
      case 'yellow': return 'bg-yellow-500';
      case 'gray': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getBadgeColor(indicator.color)}`}></div>
      <span className="text-xs font-medium text-gray-700">
        {indicator.icon} {indicator.text}
      </span>
    </div>
  );
}
