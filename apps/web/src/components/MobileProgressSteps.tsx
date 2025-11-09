import { Check, Clock, Package, Building, Home, MapPin } from "lucide-react";
import { motion } from 'framer-motion';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  icon: React.ReactNode;
}

interface MobileProgressStepsProps {
  currentStep: number;
}

export function MobileProgressSteps({ currentStep }: MobileProgressStepsProps) {
  const steps: Step[] = [
    {
      id: '1',
      title: 'Package Received',
      description: 'Collected at reception',
      status: currentStep >= 1 ? 'completed' : 'pending',
      timestamp: currentStep >= 1 ? '2:30 PM' : undefined,
      icon: <Package className="h-3 w-3" />
    },
    {
      id: '2',
      title: 'Journey Started',
      description: 'Departed reception',
      status: currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
      timestamp: currentStep >= 2 ? '2:32 PM' : undefined,
      icon: <Building className="h-3 w-3" />
    },
    {
      id: '3',
      title: 'In Transit',
      description: 'Navigating to floor 5',
      status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
      timestamp: currentStep >= 3 ? '2:35 PM' : undefined,
      icon: <MapPin className="h-3 w-3" />
    },
    {
      id: '4',
      title: 'Almost There',
      description: 'Approaching Apt 5B',
      status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
      timestamp: currentStep >= 4 ? '2:38 PM' : undefined,
      icon: <MapPin className="h-3 w-3" />
    },
    {
      id: '5',
      title: 'Delivered',
      description: 'Package delivered',
      status: currentStep >= 5 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
      timestamp: currentStep >= 5 ? '2:42 PM' : undefined,
      icon: <Home className="h-3 w-3" />
    }
  ];

  const getStepIcon = (step: Step) => {
    if (step.status === 'completed') {
      return <Check className="h-3 w-3 text-white" />;
    } else if (step.status === 'current') {
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Clock className="h-3 w-3 text-blue-600" />
        </motion.div>
      );
    }
    return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  };

  const getStepStyles = (step: Step) => {
    if (step.status === 'completed') {
      return 'bg-green-500 border-green-500';
    } else if (step.status === 'current') {
      return 'bg-blue-50 border-blue-500 border-2';
    }
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <div className="px-4">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div 
            key={step.id} 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border ${getStepStyles(step)}`}>
                {getStepIcon(step)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-6 mt-1 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
            
            {/* Step content */}
            <div className="flex-1 min-w-0 pb-6">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${step.status === 'current' ? 'text-blue-600' : ''}`}>
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
              
              {step.status === 'current' && (
                <motion.div
                  className="flex items-center gap-1 mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span className="text-xs text-blue-600 ml-1">In progress</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}