import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export default function HelpTooltip({ 
  content, 
  position = 'top', 
  children, 
  className = '' 
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isVisible, position]);

  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0";
    switch (position) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-white`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-white`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-white`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 max-w-xs bg-white text-gray-800 text-sm rounded-lg shadow-lg border border-gray-200 p-3"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className={getArrowClasses()} />
          <div className="flex items-start space-x-2">
            <Icon icon="mingcute:information-line" className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
