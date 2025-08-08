import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, ChevronDown } from 'lucide-react';
import { useGuidanceStore } from '@/store/guidanceStore';
import { deviceInstructions } from '@/lib/deviceInstructions';
import { DeviceType } from '@shared/schema';

export const DeviceSelector: React.FC = () => {
  const { selectedDevice, setSelectedDevice } = useGuidanceStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedDeviceData = selectedDevice ? deviceInstructions[selectedDevice] : null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <Search className="w-5 h-5" />
        {selectedDeviceData ? selectedDeviceData.name : 'Select Device'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800/90 border border-slate-600 rounded-lg p-3 min-w-[280px]">            
          <div className="space-y-1">
            <div className="px-3 py-2 text-slate-400 text-xs border-b border-slate-600 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search device
            </div>
            {(Object.entries(deviceInstructions) as [DeviceType, typeof deviceInstructions[DeviceType]][]).map(([deviceType, info]) => (
              <button
                key={deviceType}
                onClick={() => {
                  setSelectedDevice(deviceType);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedDevice === deviceType 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
