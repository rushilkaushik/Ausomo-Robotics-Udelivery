import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bot, Battery, MapPin, Clock } from "lucide-react";

interface RobotStatusProps {
  robotName: string;
  batteryLevel: number;
  currentLocation: string;
  speed: number;
  status: 'moving' | 'stopped' | 'loading' | 'delivering';
}

export function RobotStatus({ robotName, batteryLevel, currentLocation, speed, status }: RobotStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'stopped': return 'bg-yellow-500';
      case 'loading': return 'bg-blue-500';
      case 'delivering': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'moving': return 'Moving';
      case 'stopped': return 'Stopped';
      case 'loading': return 'Loading';
      case 'delivering': return 'Delivering';
      default: return 'Unknown';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-6 w-6 text-primary" />
        <h3>Robot Status</h3>
        <Badge className={`${getStatusColor(status)} text-white ml-auto`}>
          {getStatusText(status)}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Robot */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Robot</span>
          <span className="text-sm">{robotName}</span>
        </div>

        {/* Battery Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Battery</span>
            </div>
            <span className="text-sm">{batteryLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getBatteryColor(batteryLevel)}`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Current Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Location</span>
          </div>
          <span className="text-sm">{currentLocation}</span>
        </div>

        {/* Speed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Speed</span>
          </div>
          <span className="text-sm">{speed} m/min</span>
        </div>
      </div>
    </Card>
  );
}
