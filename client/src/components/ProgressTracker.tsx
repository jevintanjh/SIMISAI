import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { GuidanceSession } from '@shared/schema';
import { deviceInstructions } from '@/lib/deviceInstructions';

interface ProgressTrackerProps {
  session: GuidanceSession;
  currentInstruction?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  session,
  currentInstruction
}) => {
  const progressPercentage = (session.currentStep / session.totalSteps) * 100;
  const deviceInfo = deviceInstructions[session.deviceType];

  return (
    <Card className="bg-slate-800/40 border-slate-600/50 p-6 backdrop-blur-sm">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">
            Step {session.currentStep + 1} of {session.totalSteps}
          </h3>
          <span className="text-slate-400 text-sm">
            Progress
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 mb-2"
        />
        
        <div className="text-right text-sm text-slate-400">
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Messages Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Messages</h4>
        <div className="bg-slate-700/40 rounded-lg p-4 min-h-[60px] border border-slate-600/50 backdrop-blur-sm">
          {currentInstruction ? (
            <div className="text-slate-100">
              <p className="text-sm">{currentInstruction}</p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">
              Waiting for instructions...
            </p>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="space-y-2">
        {Array.from({ length: session.totalSteps }, (_, index) => {
          const isCompleted = session.completedSteps.includes(index);
          const isCurrent = index === session.currentStep;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                isCurrent 
                  ? 'bg-purple-600/30 border border-purple-500/50' 
                  : isCompleted 
                    ? 'bg-green-900/20' 
                    : 'opacity-60'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 flex-shrink-0 ${
                  isCurrent ? 'text-purple-400' : 'text-slate-500'
                }`} />
              )}
              <span className={`text-sm ${
                isCurrent ? 'text-white font-medium' : 'text-slate-300'
              }`}>
                Step {index + 1}: {deviceInfo.steps[index]}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
