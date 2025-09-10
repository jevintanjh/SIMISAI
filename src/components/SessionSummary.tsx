import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { Progress } from "@/components/ui/progress";

interface SessionSummaryProps {
  sessionData: {
    device: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    language: string;
    guidanceStyle: string;
    totalSteps: number;
    completedSteps: number;
    timeSpent: number;
    successRate: number;
    keyLearnings: string[];
    areasForImprovement: string[];
    commonIssues: string[];
  };
  onClose: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export default function SessionSummary({ 
  sessionData, 
  onClose, 
  onExport, 
  onShare 
}: SessionSummaryProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create a summary document
      const summaryText = `
SIMIS AI Session Summary
=======================

Device Information:
- Type: ${sessionData.deviceType}
- Device: ${sessionData.device}
- Brand: ${sessionData.deviceBrand}
- Model: ${sessionData.deviceModel}

Session Details:
- Language: ${sessionData.language}
- Guidance Style: ${sessionData.guidanceStyle}
- Duration: ${Math.round(sessionData.timeSpent / 60)} minutes
- Steps Completed: ${sessionData.completedSteps}/${sessionData.totalSteps}
- Success Rate: ${sessionData.successRate}%

Key Learnings:
${sessionData.keyLearnings.map(learning => `• ${learning}`).join('\n')}

Areas for Improvement:
${sessionData.areasForImprovement.map(area => `• ${area}`).join('\n')}

Common Issues Encountered:
${sessionData.commonIssues.map(issue => `• ${issue}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
      `;

      // Create and download file
      const blob = new Blob([summaryText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simis-ai-session-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return "text-green-400";
    if (rate >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getSuccessBadgeVariant = (rate: number) => {
    if (rate >= 80) return "default";
    if (rate >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Session Summary</h2>
              <p className="text-white/70 text-sm mt-1">
                Review your learning progress and key insights
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Icon icon="mingcute:close-line" className="w-6 h-6" />
            </Button>
          </div>

          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Icon icon="mingcute:device-line" className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Device</p>
                    <p className="text-white font-semibold text-sm">
                      {sessionData.deviceBrand} {sessionData.deviceModel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Icon icon="mingcute:check-circle-line" className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Progress</p>
                    <p className="text-white font-semibold text-sm">
                      {sessionData.completedSteps}/{sessionData.totalSteps} steps
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Icon icon="mingcute:time-line" className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Duration</p>
                    <p className="text-white font-semibold text-sm">
                      {Math.round(sessionData.timeSpent / 60)} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Icon icon="mingcute:target-line" className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Success Rate</p>
                    <p className={`font-semibold text-sm ${getSuccessColor(sessionData.successRate)}`}>
                      {sessionData.successRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="bg-card/50 border-border mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Overall Progress</h3>
                <Badge variant={getSuccessBadgeVariant(sessionData.successRate)}>
                  {sessionData.successRate}% Complete
                </Badge>
              </div>
              <Progress 
                value={sessionData.successRate} 
                className="h-3"
              />
            </CardContent>
          </Card>

          {/* Key Learnings and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Key Learnings */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Icon icon="mingcute:lightbulb-line" className="w-5 h-5 text-yellow-400" />
                  <span>Key Learnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sessionData.keyLearnings.map((learning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon icon="mingcute:check-line" className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{learning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Icon icon="mingcute:target-line" className="w-5 h-5 text-orange-400" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sessionData.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon icon="mingcute:arrow-up-line" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Common Issues */}
          {sessionData.commonIssues.length > 0 && (
            <Card className="bg-card/50 border-border mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Icon icon="mingcute:warning-line" className="w-5 h-5 text-red-400" />
                  <span>Common Issues Encountered</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sessionData.commonIssues.map((issue, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icon icon="mingcute:information-line" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="bg-transparent text-white border-border hover:border-white/60"
            >
              {isExporting ? (
                <>
                  <Icon icon="mingcute:loading-line" className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Icon icon="mingcute:download-line" className="w-4 h-4 mr-2" />
                  Export Summary
                </>
              )}
            </Button>
            
            {onShare && (
              <Button
                onClick={onShare}
                variant="outline"
                className="bg-transparent text-white border-border hover:border-white/60"
              >
                <Icon icon="mingcute:share-line" className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Icon icon="mingcute:check-line" className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
