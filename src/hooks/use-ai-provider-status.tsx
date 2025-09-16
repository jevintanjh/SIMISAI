import { useEffect, useState, useCallback } from 'react';

interface AIProvider {
  available: boolean;
  responseTime: number;
  lastChecked: string;
  description: string;
}

interface AIProviderStatus {
  providers: {
    sagemaker: AIProvider;
    openai: AIProvider;
  };
  recommendation: {
    primary: 'sagemaker' | 'openai';
    reason: string;
    timestamp: string;
  };
  systemStatus: 'excellent' | 'good' | 'degraded';
}

interface AIProviderHook {
  status: AIProviderStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  currentProvider: 'sagemaker' | 'openai';
  systemHealth: 'excellent' | 'good' | 'degraded';
}

export function useAIProviderStatus(): AIProviderHook {
  const [status, setStatus] = useState<AIProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod'
    : 'http://localhost:3001';

  const checkAIProviderStatus = useCallback(async (forceCheck = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we need to refresh (cache for 30 seconds)
      const now = Date.now();
      if (!forceCheck && now - lastChecked < 30000 && status) {
        setIsLoading(false);
        return;
      }

      console.log('🔍 Checking AI provider status...');
      
      const response = await fetch(`${API_BASE_URL}/ai-status${forceCheck ? '/check' : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      if (!response.ok) {
        throw new Error(`AI Status API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setStatus(data);
      setLastChecked(now);
      
      console.log('✅ AI Provider Status:', {
        primary: data.recommendation.primary,
        reason: data.recommendation.reason,
        systemHealth: data.systemStatus,
        sagemaker: data.providers.sagemaker.available ? 'Available' : 'Unavailable',
        openai: data.providers.openai.available ? 'Available' : 'Unavailable'
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Failed to check AI provider status:', errorMessage);
      setError(errorMessage);
      
      // Set fallback status
      setStatus({
        providers: {
          sagemaker: {
            available: false,
            responseTime: 0,
            lastChecked: new Date().toISOString(),
            description: 'SEA-LION 27B - Custom ASEAN Medical AI Model'
          },
          openai: {
            available: true, // Assume OpenAI is available as fallback
            responseTime: 0,
            lastChecked: new Date().toISOString(),
            description: 'OpenAI GPT-4 - Fast and Reliable Fallback'
          }
        },
        recommendation: {
          primary: 'openai',
          reason: 'Using OpenAI as fallback due to status check failure',
          timestamp: new Date().toISOString()
        },
        systemStatus: 'good'
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, status, lastChecked]);

  const refreshStatus = useCallback(async () => {
    await checkAIProviderStatus(true);
  }, [checkAIProviderStatus]);

  // Check status on mount
  useEffect(() => {
    checkAIProviderStatus();
  }, [checkAIProviderStatus]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      checkAIProviderStatus();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [checkAIProviderStatus]);

  return {
    status,
    isLoading,
    error,
    refreshStatus,
    currentProvider: status?.recommendation.primary || 'openai',
    systemHealth: status?.systemStatus || 'good'
  };
}

/**
 * Hook for getting AI provider status with visual indicators
 */
export function useAIProviderIndicator() {
  const { status, isLoading, currentProvider, systemHealth } = useAIProviderStatus();
  
  const getStatusIndicator = useCallback(() => {
    if (isLoading) {
      return {
        color: 'yellow',
        text: 'Checking AI Status...',
        icon: '⏳'
      };
    }

    if (!status) {
      return {
        color: 'gray',
        text: 'AI Status Unknown',
        icon: '❓'
      };
    }

    switch (systemHealth) {
      case 'excellent':
        return {
          color: 'green',
          text: currentProvider === 'sagemaker' ? '🦁 SEA-LION Active' : '🤖 OpenAI Active',
          icon: '✅'
        };
      case 'good':
        return {
          color: 'blue',
          text: currentProvider === 'sagemaker' ? '🦁 SEA-LION (Limited)' : '🤖 OpenAI Fallback',
          icon: '⚠️'
        };
      case 'degraded':
        return {
          color: 'orange',
          text: '🤖 Emergency Mode',
          icon: '🚨'
        };
      default:
        return {
          color: 'gray',
          text: 'Unknown Status',
          icon: '❓'
        };
    }
  }, [isLoading, status, currentProvider, systemHealth]);

  return {
    ...useAIProviderStatus(),
    indicator: getStatusIndicator()
  };
}
