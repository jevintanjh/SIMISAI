import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { GuidanceSession } from '@shared/schema';

interface ProgressTrackerProps {
  session: GuidanceSession;
  currentInstruction?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  session,
  currentInstruction
}) => {
  const progressPercentage = (session.currentStep / session.totalSteps) * 100;

  return (
    <Card className="bg-purple-900/30 border-purple-700/50 p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">
            Step {session.currentStep + 1} of {session.totalSteps}
          </h3>
          <span className="text-purple-300 text-sm">
            Progress
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 mb-2"
        />
        
        <div className="text-right text-sm text-purple-300">
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Messages Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-purple-200 mb-2">Messages</h4>
        <div className="bg-purple-800/30 rounded-lg p-4 min-h-[60px] border border-purple-700/50">
          {currentInstruction ? (
            <div className="text-purple-100">
              <p className="text-sm">{currentInstruction}</p>
            </div>
          ) : (
            <p className="text-purple-300 text-sm italic">
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
                  isCurrent ? 'text-purple-300' : 'text-purple-500'
                }`} />
              )}
              <span className={`text-sm ${
                isCurrent ? 'text-white font-medium' : 'text-purple-200'
              }`}>
                Step {index + 1}: Loading instruction...
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
