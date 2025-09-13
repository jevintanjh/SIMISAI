import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "../lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/toaster";
import { TooltipProvider } from "./ui/tooltip";
import Home from "./pages/home";
import Welcome from "./pages/welcome";
import Guidance from "./pages/guidance";
import NotFound from "./pages/not-found";
import OnboardingTutorial from "./OnboardingTutorial";
import SessionSummary from "./SessionSummary";

interface SessionConfig {
  language: string;
  device: string;
  guidanceStyle: string;
  voiceOption: string;
}

function Router({ onShowSessionSummary }: { onShowSessionSummary: () => void }) {
  const [currentView, setCurrentView] = useState<'welcome' | 'guidance' | 'home'>('welcome');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [wasInAdvancedMode, setWasInAdvancedMode] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Check if user has seen tutorial before - only show on guidance page
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('simis-tutorial-completed');
    if (!hasSeenTutorial && currentView === 'guidance') {
      setShowTutorial(true);
    }
  }, [currentView]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('simis-tutorial-completed', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('simis-tutorial-completed', 'true');
  };

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setCurrentView('guidance');
  };

  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setSessionConfig(null);
    // Keep the advanced mode state when returning from guidance
  };

  const handleGoToHome = () => {
    setCurrentView('home');
  };

  const handleBackFromHome = () => {
    setCurrentView('welcome');
  };

  if (currentView === 'welcome') {
    return <Welcome onStartSession={handleStartSession} initialAdvancedMode={wasInAdvancedMode} onAdvancedModeChange={setWasInAdvancedMode} />;
  }

  if (currentView === 'guidance' && sessionConfig) {
    return (
      <>
        <Guidance config={sessionConfig} onBack={handleBackToWelcome} />
        <OnboardingTutorial 
          isVisible={showTutorial}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      </>
    );
  }

  if (currentView === 'home') {
    return <Home onBack={handleBackFromHome} sessionConfig={sessionConfig || undefined} onShowSessionSummary={onShowSessionSummary} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Home onBack={handleBackFromHome} sessionConfig={sessionConfig || undefined} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSessionSummary, setShowSessionSummary] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<any>(null);

  const handleShowSessionSummary = () => {
    // Create mock session data for now
    const mockSessionData = {
      device: "Digital thermometer",
      deviceType: "Vital Signs",
      deviceBrand: "Omron",
      deviceModel: "MC-246",
      language: "en",
      guidanceStyle: "direct",
      totalSteps: 5,
      completedSteps: 0,
      timeSpent: 109, // 109 minutes
      successRate: 0,
      keyLearnings: [
        "Successfully completed 0 out of 0 steps",
        "Device: Digital thermometer",
        "Language: en",
        "Guidance style: direct"
      ],
      areasForImprovement: [],
      commonIssues: []
    };
    setSessionData(mockSessionData);
    setShowSessionSummary(true);
  };

  const handleCloseSessionSummary = () => {
    setShowSessionSummary(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router onShowSessionSummary={handleShowSessionSummary} />
        {showSessionSummary && sessionData && (
          <SessionSummary
            sessionData={sessionData}
            onClose={handleCloseSessionSummary}
            onExport={() => console.log('Export session')}
            onShare={() => console.log('Share session')}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
