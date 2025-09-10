import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";
import type { Device } from "@shared/schema";

interface DeviceLibraryProps {
  onDeviceSelect: (deviceId: string) => void;
}

export default function DeviceLibrary({ onDeviceSelect }: DeviceLibraryProps) {
  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supported Devices</h2>
        <p className="text-gray-600 text-sm">Select a device to start guided instructions</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onDeviceSelect(device.id)}
          >
            {device.imageUrl && (
              <img
                src={device.imageUrl}
                alt={device.name}
                className="w-full h-32 object-cover"
              />
            )}
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{device.name}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {device.stepCount} guided steps
              </p>
              <div className="flex items-center text-xs">
                {device.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1 text-[hsl(122,39%,49%)]" />
                    <span className="text-[hsl(122,39%,49%)]">Ready</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-gray-400">Coming Soon</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
