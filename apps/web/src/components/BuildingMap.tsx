import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bot, MapPin, Home, Building } from "lucide-react";

interface BuildingMapProps {
  currentFloor: number;
  destinationFloor: number;
  robotPosition: { x: number; y: number };
  pathCompleted: number; // percentage of path completed
}

export function BuildingMap({ currentFloor, destinationFloor, robotPosition, pathCompleted }: BuildingMapProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3>Building Map</h3>
        <Badge variant="outline">Floor {currentFloor}</Badge>
      </div>
      
      {/* Simple building floor representation */}
      <div className="relative bg-gray-50 rounded-lg p-4 h-64 border">
        {/* Floor layout - simplified rectangular floor plan */}
        <div className="absolute inset-4 border-2 border-gray-300 rounded">
          {/* Reception/Lobby area */}
          <div className="absolute bottom-2 left-2 w-16 h-12 bg-blue-100 rounded flex items-center justify-center">
            <Building className="h-4 w-4 text-blue-600" />
          </div>
          <div className="absolute bottom-0 left-20 text-xs text-muted-foreground">Reception</div>
          
          {/* Elevator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-500 rounded"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 text-xs text-muted-foreground">Elevator</div>
          
          {/* Destination apartment */}
          <div className="absolute top-2 right-2 w-16 h-12 bg-green-100 rounded flex items-center justify-center">
            <Home className="h-4 w-4 text-green-600" />
          </div>
          <div className="absolute top-0 right-2 text-xs text-muted-foreground">Apt 5B</div>
          
          {/* Robot position */}
          <div 
            className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-1000 shadow-lg"
            style={{ 
              left: `${robotPosition.x}%`, 
              top: `${robotPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Bot className="h-3 w-3 text-white" />
          </div>
          
          {/* Path indicator */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset={`${pathCompleted}%`} stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset={`${pathCompleted}%`} stopColor="#e5e7eb" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path
              d="M 20 220 Q 120 220 120 120 Q 120 20 220 20"
              stroke="url(#pathGradient)"
              strokeWidth="3"
              strokeDasharray="5,5"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Floor indicator */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((floor) => (
            <div
              key={floor}
              className={`w-8 h-6 rounded text-xs flex items-center justify-center border ${
                floor === currentFloor 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : floor === destinationFloor
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}
            >
              {floor}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Robot</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Destination</span>
        </div>
      </div>
    </Card>
  );
}