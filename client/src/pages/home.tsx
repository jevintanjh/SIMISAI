import React from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GuidanceInterface } from '@/components/GuidanceInterface';
import { useGuidanceStore } from '@/store/guidanceStore';

export default function Home() {
  const { showWelcome } = useGuidanceStore();

  return (
    <div className="min-h-screen">
      {showWelcome ? <WelcomeScreen /> : <GuidanceInterface />}
    </div>
  );
}
