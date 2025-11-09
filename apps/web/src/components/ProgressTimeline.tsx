import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, Clock, MapPin, Home, Building } from "lucide-react";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  icon: React.ReactNode;
}

interface ProgressTimelineProps {
  currentStep: number;
}

export function ProgressTimeline({ currentStep }: ProgressTimelineProps) {
  const steps: TimelineStep[] = [
    {
      id: '1',
      title: 'Package Received',
      description: 'Package collected at reception desk',
      status: currentStep >= 1 ? 'completed' : 'pending',
      timestamp: currentStep >= 1 ? '2:30 PM' : undefined,
      icon: <Building className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Journey Started',
      description: 'Robot departed from reception',
      status: currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
      timestamp: currentStep >= 2 ? '2:32 PM' : undefined,
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Elevator Access',
      description: 'Robot accessing elevator to floor 5',
      status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
      timestamp: currentStep >= 3 ? '2:35 PM' : undefined,
      icon: <Building className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'En Route to Destination',
      description: 'Navigating to Apt 5B',
      status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
      timestamp: currentStep >= 4 ? '2:38 PM' : undefined,
      icon: <MapPin className="h-4 w-4" />
    },
    {
      id: '5',
      title: 'Delivery Complete',
      description: 'Package delivered to recipient',
      status: currentStep >= 5 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
      timestamp: currentStep >= 5 ? '2:42 PM' : undefined,
      icon: <Home className="h-4 w-4" />
    }
  ];

  const getStepIcon = (step: TimelineStep) => {
    if (step.status === 'completed') {
      return <Check className="h-4 w-4 text-white" />;
    } else if (step.status === 'current') {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return step.icon;
  };

  const getStepStyles = (step: TimelineStep) => {
    if (step.status === 'completed') {
      return 'bg-green-500 border-green-500';
    } else if (step.status === 'current') {
      return 'bg-blue-50 border-blue-500 border-2';
    }
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <Card className="p-6">
      <h3 className="mb-6">Delivery Progress</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getStepStyles(step)}`}>
                {getStepIcon(step)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
            
            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={step.status === 'current' ? 'text-blue-600' : ''}>{step.title}</h4>
                {step.status === 'current' && (
                  <Badge variant="outline" className="border-blue-500 text-blue-600">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">{step.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}