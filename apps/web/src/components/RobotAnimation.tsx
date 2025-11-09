import { motion } from 'framer-motion';
import { Package, Battery, Wifi, Home, ArrowUp, Clock } from 'lucide-react';

interface RobotAnimationProps {
  status: 'moving' | 'loading' | 'delivering' | 'idle';
  batteryLevel: number;
  progress: number;
  currentStep: number;
  currentLocation: string;
}

export function RobotAnimation({ status, batteryLevel, progress, currentStep, currentLocation }: RobotAnimationProps) {
  const getAnimationScene = () => {
    // Determine scene based on progress and location
    if (currentStep <= 2 || currentLocation.includes('Reception')) {
      return 'loading'; // At reception loading
    } else if (currentLocation.includes('Elevator') || currentStep === 3) {
      return 'elevator'; // In elevator
    } else if (currentStep === 4 || status === 'delivering') {
      return 'door'; // At recipient's door
    } else {
      return 'hallway'; // Moving through hallway
    }
  };

  const scene = getAnimationScene();

  const renderRobotScene = () => {
    switch (scene) {
      case 'hallway':
        return (
          <div className="relative w-80 h-48 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {/* Hallway walls */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gray-300 border-b-2 border-gray-400" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gray-300 border-t-2 border-gray-400" />
            
            {/* Floor pattern */}
            <div className="absolute inset-x-0 top-8 bottom-8 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150">
              {/* Floor tiles */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`absolute top-0 bottom-0 w-0.5 bg-gray-300 opacity-30`} style={{ left: `${i * 16.66}%` }} />
              ))}
            </div>
            
            {/* Doors along hallway */}
            <div className="absolute right-4 top-10 w-3 h-16 bg-amber-800 rounded-sm" />
            <div className="absolute right-4 top-28 w-3 h-2 bg-gray-600 rounded-full" />
            
            <div className="absolute left-4 top-16 w-3 h-16 bg-amber-800 rounded-sm" />
            <div className="absolute left-4 top-34 w-3 h-2 bg-gray-600 rounded-full" />
            
            {/* Robot moving through hallway */}
            <motion.div
              className="absolute bottom-12 w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
              animate={{
                x: [60, 200],
                transition: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            >
              {/* Robot body */}
              <div className="w-8 h-6 bg-blue-600 rounded-sm relative">
                <div className="absolute -top-1 left-1 w-2 h-2 bg-green-400 rounded-full" />
                <div className="absolute -top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
              </div>
              
              {/* Wheels */}
              <motion.div
                className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            
            {/* Package on robot */}
            <motion.div
              className="absolute bottom-16 w-4 h-3 bg-amber-500 rounded-sm"
              animate={{
                x: [64, 204],
                transition: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            >
              <Package size={12} className="text-amber-700" />
            </motion.div>
          </div>
        );

      case 'elevator':
        return (
          <div className="relative w-80 h-48 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg overflow-hidden border-4 border-gray-400">
            {/* Elevator interior */}
            <div className="absolute inset-2 bg-gradient-to-b from-gray-100 to-gray-200 rounded">
              {/* Elevator panels */}
              <div className="absolute right-2 top-4 w-8 h-16 bg-gray-800 rounded-sm">
                {[5, 4, 3, 2, 1].map((floor, i) => (
                  <motion.div
                    key={floor}
                    className={`absolute left-1 w-6 h-2 rounded-sm m-0.5 ${
                      floor === 5 ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                    style={{ top: `${i * 12 + 4}px` }}
                    animate={floor === 5 ? { opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>
              
              {/* Floor indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-black text-green-400 px-3 py-1 rounded font-mono text-sm">
                  Floor 5
                </div>
                <div className="flex justify-center mt-1">
                  <ArrowUp size={16} className="text-blue-500" />
                </div>
              </div>
              
              {/* Robot waiting in elevator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-8 h-6 bg-blue-600 rounded-sm relative">
                  <motion.div 
                    className="absolute -top-1 left-1 w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="absolute -top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
                </div>
                
                {/* Stationary wheels */}
                <div className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 rounded-full" />
                <div className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rounded-full" />
              </div>
              
              {/* Package */}
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-amber-500 rounded-sm flex items-center justify-center">
                <Package size={10} className="text-amber-700" />
              </div>
            </div>
          </div>
        );

      case 'door':
        return (
          <div className="relative w-80 h-48 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
            {/* Apartment door */}
            <div className="absolute right-8 top-8 w-20 h-32 bg-amber-900 rounded-lg border-2 border-amber-800">
              {/* Door panels */}
              <div className="absolute inset-2 border border-amber-700 rounded" />
              <div className="absolute top-4 left-4 right-4 h-10 border border-amber-700 rounded" />
              <div className="absolute bottom-4 left-4 right-4 h-10 border border-amber-700 rounded" />
              
              {/* Door handle */}
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-brass-500 bg-yellow-600 rounded-full" />
              
              {/* Apartment number */}
              <div className="absolute -left-8 top-2 bg-white px-2 py-1 rounded shadow text-sm font-bold">
                5B
              </div>
            </div>
            
            {/* Door frame */}
            <div className="absolute right-6 top-6 w-24 h-36 border-4 border-gray-400 rounded-lg" />
            
            {/* Robot at door */}
            <motion.div
              className="absolute bottom-12 right-32 w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
              animate={{
                y: [0, -2, 0],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-8 h-6 bg-blue-600 rounded-sm relative">
                <motion.div 
                  className="absolute -top-1 left-1 w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="absolute -top-1 right-1 w-2 h-2 bg-blue-400 rounded-full" />
              </div>
              
              {/* Wheels */}
              <div className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 rounded-full" />
              <div className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rounded-full" />
            </motion.div>
            
            {/* Package being delivered */}
            <motion.div
              className="absolute bottom-16 right-36 w-6 h-4 bg-amber-500 rounded-sm border border-amber-600"
              animate={{
                scale: [1, 1.05, 1],
                transition: { duration: 1.5, repeat: Infinity }
              }}
            >
              <Package size={16} className="text-amber-700" />
            </motion.div>
            
            {/* Delivery indicator */}
            <motion.div
              className="absolute top-16 right-12 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Home size={20} className="text-green-500 mx-auto mb-1" />
              <p className="text-xs text-green-600 font-medium">Delivering</p>
            </motion.div>
          </div>
        );

      case 'loading':
      default:
        return (
          <div className="relative w-80 h-48 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden">
            {/* Reception desk */}
            <div className="absolute left-8 top-16 w-32 h-16 bg-amber-800 rounded-lg">
              <div className="absolute inset-x-2 top-2 bottom-6 bg-amber-900 rounded" />
              <div className="absolute bottom-0 inset-x-0 h-6 bg-amber-700 rounded-b-lg" />
            </div>
            
            {/* Reception sign */}
            <div className="absolute left-12 top-8 bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">
              RECEPTION
            </div>
            
            {/* Robot at reception */}
            <motion.div
              className="absolute bottom-12 left-44 w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
              animate={{
                rotate: [0, 5, -5, 0],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-8 h-6 bg-blue-600 rounded-sm relative">
                <motion.div 
                  className="absolute -top-1 left-1 w-2 h-2 bg-orange-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="absolute -top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
              </div>
              
              {/* Wheels */}
              <motion.div
                className="absolute -bottom-1 left-1 w-2 h-2 bg-gray-800 rounded-full"
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rounded-full"
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            
            {/* Package loading */}
            <motion.div
              className="absolute bottom-20 left-52 w-8 h-6 bg-amber-500 rounded-sm border-2 border-amber-600"
              animate={{
                y: [0, -8, 0],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Package size={20} className="text-amber-700" />
            </motion.div>
            
            {/* Loading indicator */}
            <div className="absolute top-12 left-48 flex items-center gap-1">
              <Clock size={16} className="text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Loading Package</span>
            </div>
          </div>
        );
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-500';
    if (batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSceneTitle = () => {
    switch (scene) {
      case 'hallway': return 'Navigating Hallway';
      case 'elevator': return 'In Elevator';
      case 'door': return 'At Destination';
      case 'loading': return 'Loading Package';
      default: return 'En Route';
    }
  };

  const getSceneDescription = () => {
    switch (scene) {
      case 'hallway': return 'Moving through building corridors';
      case 'elevator': return 'Traveling to destination floor';
      case 'door': return 'Delivering to recipient';
      case 'loading': return 'Securing package for delivery';
      default: return 'Processing delivery request';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      {/* Main Animation Scene */}
      <div className="mb-6">
        {renderRobotScene()}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Battery size={16} className={getBatteryColor()} />
          <span className={`text-sm ${getBatteryColor()}`}>{batteryLevel}%</span>
        </div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            transition: { duration: 2, repeat: Infinity }
          }}
        >
          <Wifi size={16} className="text-blue-500" />
        </motion.div>
      </div>

      {/* Progress Ring */}
      <div className="relative w-24 h-24 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-200"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-blue-500"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - progress / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">{progress}%</span>
        </div>
      </div>

      {/* Status text */}
      <motion.div
        className="text-center"
        key={scene}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-lg font-medium mb-1">{getSceneTitle()}</p>
        <p className="text-sm text-muted-foreground">{getSceneDescription()}</p>
      </motion.div>
    </div>
  );
}