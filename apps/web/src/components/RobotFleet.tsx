import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Bot, Battery, MapPin, Package, Clock } from "lucide-react";

interface Robot {
  id: string;
  name: string;
  batteryLevel: number;
  status: 'idle' | 'moving' | 'loading' | 'delivering' | 'charging' | 'maintenance';
  currentFloor: number;
  currentLocation: string;
  assignedDelivery?: string;
  speed?: number;
  lastActivity: string;
}

interface RobotFleetProps {
  robots: Robot[];
  selectedRobot: string | null;
  onRobotSelect: (robotId: string) => void;
}

export function RobotFleet({ robots, selectedRobot, onRobotSelect }: RobotFleetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'moving': return 'bg-green-500';
      case 'loading': return 'bg-blue-500';
      case 'delivering': return 'bg-purple-500';
      case 'charging': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Idle';
      case 'moving': return 'Moving';
      case 'loading': return 'Loading';
      case 'delivering': return 'Delivering';
      case 'charging': return 'Charging';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const activeRobots = robots.filter(r => ['moving', 'loading', 'delivering'].includes(r.status));
  const totalBattery = robots.reduce((sum, robot) => sum + robot.batteryLevel, 0) / robots.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <h3>Robot Fleet</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{activeRobots.length}/{robots.length} active</Badge>
        </div>
      </div>

      {/* Fleet Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted rounded-lg">
        <div>
          <div className="text-sm text-muted-foreground">Fleet Battery Avg</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getBatteryColor(totalBattery)}`}
                  style={{ width: `${totalBattery}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{Math.round(totalBattery)}%</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Active Deliveries</div>
          <div className="text-2xl font-bold text-primary mt-1">{activeRobots.length}</div>
        </div>
      </div>

      {/* Robot List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {robots.map((robot) => (
          <div
            key={robot.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedRobot === robot.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-border hover:border-border/60'
            }`}
            onClick={() => onRobotSelect(robot.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(robot.status)}`} />
                <div>
                  <div className="font-medium">{robot.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{robot.id}</div>
                </div>
              </div>
              <Badge className={`${getStatusColor(robot.status)} text-white`}>
                {getStatusText(robot.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Battery className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Battery</span>
                  <span className="ml-auto font-medium">{robot.batteryLevel}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBatteryColor(robot.batteryLevel)}`}
                    style={{ width: `${robot.batteryLevel}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Floor {robot.currentFloor}</span>
                </div>
                {robot.assignedDelivery && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground font-mono text-xs">{robot.assignedDelivery}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Location: {robot.currentLocation}</span>
                <span>Last: {robot.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {robots.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No robots available</p>
        </div>
      )}
    </Card>
  );
}