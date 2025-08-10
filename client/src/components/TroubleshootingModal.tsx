import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
}

export const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({
  isOpen,
  onClose,
  error
}) => {
  if (!isOpen) return null;

  const getCameraErrorHelp = () => {
    if (error?.includes('Device in use')) {
      return {
        title: 'Camera Already in Use',
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        solutions: [
          'Close other browser tabs that might be using the camera',
          'Close video conferencing apps (Zoom, Teams, Meet, etc.)',
          'Close camera apps or photo applications',
          'Restart your browser if the problem persists',
          'Try using a different browser'
        ]
      };
    }

    if (error?.includes('not allowed') || error?.includes('denied')) {
      return {
        title: 'Camera Permission Denied',
        icon: Camera,
        color: 'text-red-400',
        bgColor: 'bg-red-900/20',
        solutions: [
          'Click the camera icon in your browser address bar',
          'Select "Always allow" for camera access',
          'Refresh the page after granting permission',
          'Check your browser camera settings',
          'Make sure your camera is connected and working'
        ]
      };
    }

    if (error?.includes('not found')) {
      return {
        title: 'No Camera Found',
        icon: Camera,
        color: 'text-blue-400',
        bgColor: 'bg-blue-900/20',
        solutions: [
          'Make sure your camera is properly connected',
          'Try unplugging and reconnecting your camera',
          'Check if your camera works in other applications',
          'Restart your computer if using an external camera',
          'Try using a different camera if available'
        ]
      };
    }

    return {
      title: 'Camera Error',
      icon: AlertTriangle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      solutions: [
        'Try refreshing the page',
        'Restart your browser',
        'Check camera permissions in browser settings',
        'Make sure your camera is working in other apps',
        'Try using a different browser'
      ]
    };
  };

  const errorHelp = getCameraErrorHelp();
  const IconComponent = errorHelp.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Camera Troubleshooting</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={`${errorHelp.bgColor} rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-3 mb-2">
            <IconComponent className={`w-6 h-6 ${errorHelp.color}`} />
            <h3 className="font-semibold text-white">{errorHelp.title}</h3>
          </div>
          {error && (
            <p className="text-sm text-slate-300 mb-3">{error}</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-white">Try these solutions:</h4>
          <ul className="space-y-2">
            {errorHelp.solutions.map((solution, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                {solution}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Got it
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};