import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "../lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/toaster";
import { TooltipProvider } from "./ui/tooltip";
import Home from "./pages/home";
import Welcome from "./pages/welcome";
import Guidance from "./pages/guidance";
import NotFound from "./pages/not-found";

interface SessionConfig {
  language: string;
  device: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  guidanceStyle: string;
  voiceOption: string;
}

function Router() {
  const [currentView, setCurrentView] = useState<'welcome' | 'guidance' | 'home'>('welcome');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  const handleStartSession = (config: SessionConfig) => {
    setSessionConfig(config);
    setCurrentView('guidance');
  };

  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setSessionConfig(null);
  };

  const handleGoToHome = () => {
    setCurrentView('home');
  };

  const handleBackFromHome = () => {
    setCurrentView('welcome');
  };

  if (currentView === 'welcome') {
    return <Welcome onStartSession={handleStartSession} />;
  }

  if (currentView === 'guidance' && sessionConfig) {
    return <Guidance config={sessionConfig} onBack={handleBackToWelcome} />;
  }

  if (currentView === 'home') {
    return <Home onBack={handleBackFromHome} sessionConfig={sessionConfig || undefined} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Home onBack={handleBackFromHome} sessionConfig={sessionConfig || undefined} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
