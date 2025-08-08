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
        size="lg"
        className="bg-purple-800/50 border-purple-600 text-purple-100 hover:bg-purple-700/50 px-6 py-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-5 h-5 mr-2" />
        <span className="mr-2">{selectedDeviceData?.icon}</span>
        {selectedDeviceData?.name || 'Select Device'}
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Card className="bg-purple-900/90 border-purple-600 p-4 min-w-[280px]">            
            <div className="space-y-2">
              {(Object.entries(deviceInstructions) as [DeviceType, typeof deviceInstructions[DeviceType]][]).map(([deviceType, info]) => (
                <Button
                  key={deviceType}
                  variant={selectedDevice === deviceType ? "default" : "ghost"}
                  size="sm"
                  className="w-full text-left justify-start text-purple-100 hover:bg-purple-700/50"
                  onClick={() => {
                    setSelectedDevice(deviceType);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-2 text-lg">{info.icon}</span>
                  {info.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
