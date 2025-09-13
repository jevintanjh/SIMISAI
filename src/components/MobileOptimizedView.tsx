import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

interface MobileOptimizedViewProps {
  children: React.ReactNode;
  isMobile: boolean;
  className?: string;
}

export default function MobileOptimizedView({ 
  children, 
  isMobile, 
  className = "" 
}: MobileOptimizedViewProps) {
  const [isPortrait, setIsPortrait] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
      setOrientation(isPortraitMode ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mobile-optimized ${className}`}>
      {/* Mobile-specific optimizations */}
      <div className={`
        ${isPortrait ? 'flex-col' : 'flex-row'}
        ${orientation === 'portrait' ? 'min-h-screen' : 'h-screen'}
        flex
      `}>
        {children}
      </div>
      
      {/* Mobile-specific UI elements */}
      {isMobile && (
        <>
          {/* Touch-friendly spacing */}
          <style jsx>{`
            .mobile-optimized {
              -webkit-tap-highlight-color: transparent;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            .mobile-optimized button {
              min-height: 44px;
              min-width: 44px;
            }
            
            .mobile-optimized input,
            .mobile-optimized textarea {
              font-size: 16px; /* Prevents zoom on iOS */
            }
            
            @media (max-width: 768px) {
              .mobile-optimized .grid {
                grid-template-columns: 1fr;
                gap: 1rem;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

// Hook to detect mobile devices
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Accessibility utilities
export const accessibilityUtils = {
  // Announce to screen readers
  announce: (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  // Focus management
  focusElement: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  },

  // High contrast mode detection
  isHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Reduced motion detection
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};
