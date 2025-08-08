import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useGuidanceStore } from '@/store/guidanceStore';
import { deviceInstructions } from '@/lib/deviceInstructions';
import { DeviceType } from '@shared/schema';

export const DeviceSelector: React.FC = () => {
  const { selectedDevice, setSelectedDevice } = useGuidanceStore();

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="lg"
        className="bg-purple-800/50 border-purple-600 text-purple-100 hover:bg-purple-700/50 px-6 py-3"
      >
        <Search className="w-5 h-5 mr-2" />
        Device
      </Button>
      
      <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50">
        <Card className="bg-purple-900/90 border-purple-600 p-4 min-w-[280px]">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search device"
              className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-md text-purple-100 placeholder-purple-300 focus:outline-none focus:border-purple-400"
            />
          </div>
          
          <div className="space-y-2">
            {(Object.entries(deviceInstructions) as [DeviceType, typeof deviceInstructions[DeviceType]][]).map(([deviceType, info]) => (
              <Button
                key={deviceType}
                variant={selectedDevice === deviceType ? "default" : "ghost"}
                size="sm"
                className="w-full text-left justify-start text-purple-100 hover:bg-purple-700/50"
                onClick={() => setSelectedDevice(deviceType)}
              >
                <span className="mr-2 text-lg">{info.icon}</span>
                {info.name}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
