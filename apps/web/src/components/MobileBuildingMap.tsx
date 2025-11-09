import { Badge } from "./ui/badge";
import { Bot, Home, Building, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from 'framer-motion';

interface MobileBuildingMapProps {
  currentFloor: number;
  destinationFloor: number;
  robotPosition: { x: number; y: number };
  pathCompleted: number;
  buildingName: string;
}

export function MobileBuildingMap({ 
  currentFloor, 
  destinationFloor, 
  robotPosition, 
  pathCompleted,
  buildingName 
}: MobileBuildingMapProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Building header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{buildingName}</h3>
        </div>
        <Badge variant="outline">Floor {currentFloor}</Badge>
      </div>
      
      {/* Floor navigator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
            <span className="font-bold text-blue-600">{currentFloor}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {currentFloor < destinationFloor ? (
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          ) : currentFloor > destinationFloor ? (
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          )}
          <div className="w-8 h-0.5 bg-gray-300"></div>
          {currentFloor !== destinationFloor && (
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs text-muted-foreground">Destination</div>
          <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
            <span className="font-bold text-green-600">{destinationFloor}</span>
          </div>
        </div>
      </div>
      
      {/* Main floor map */}
      <div className="flex-1 relative bg-gray-50 rounded-xl border overflow-hidden">
        {/* Floor layout - mobile optimized */}
        <div className="absolute inset-4 border-2 border-gray-300 rounded-lg">
          {/* Reception area */}
          <div className="absolute bottom-3 left-3 w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Building className="h-3 w-3 text-blue-600" />
          </div>
          
          {/* Elevator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded"></div>
          </div>
          
          {/* Destination */}
          <div className="absolute top-3 right-3 w-12 h-8 bg-green-100 rounded flex items-center justify-center">
            <Home className="h-3 w-3 text-green-600" />
          </div>
          
          {/* Robot position */}
          <motion.div 
            className="absolute w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10"
            style={{ 
              left: `${robotPosition.x}%`, 
              top: `${robotPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
          >
            <Bot className="h-2.5 w-2.5 text-white" />
          </motion.div>
          
          {/* Path visualization */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset={`${pathCompleted}%`} stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset={`${pathCompleted}%`} stopColor="#e5e7eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M 25 85 Q 50 85 50 50 Q 50 15 75 15"
              stroke="url(#pathGradient)"
              strokeWidth="2"
              strokeDasharray="3,3"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Floor indicators */}
        <div className="absolute top-3 left-3 space-y-1">
          {[destinationFloor, destinationFloor - 1, destinationFloor - 2].filter(f => f > 0).slice(0, 3).map((floor) => (
            <div
              key={floor}
              className={`w-6 h-5 rounded text-xs flex items-center justify-center border ${
                floor === currentFloor 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {floor}
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Journey Progress</span>
          <span className="font-medium">{pathCompleted}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pathCompleted}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}