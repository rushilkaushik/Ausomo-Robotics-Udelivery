import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, Clock, MapPin, Phone, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ErrorAlertProps {
  error: {
    type: 'robot-stuck' | 'task-failed' | 'network-error' | 'access-denied';
    message: string;
    location?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    canRetry: boolean;
  };
  onRetry?: () => void;
  onContactSupport?: () => void;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onRetry, onContactSupport, onDismiss }: ErrorAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'robot-stuck':
        return <MapPin className="h-4 w-4" />;
      case 'task-failed':
        return <AlertTriangle className="h-4 w-4" />;
      case 'network-error':
        return <RefreshCw className="h-4 w-4" />;
      case 'access-denied':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'robot-stuck':
        return 'Robot Navigation Issue';
      case 'task-failed':
        return 'Delivery Task Failed';
      case 'network-error':
        return 'Connection Problem';
      case 'access-denied':
        return 'Access Restricted';
      default:
        return 'Delivery Issue';
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityBadge = () => {
    switch (error.severity) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getDetailedMessage = () => {
    switch (error.type) {
      case 'robot-stuck':
        return "The robot has encountered an obstacle or navigation issue and cannot proceed. Our team has been notified and will resolve this shortly.";
      case 'task-failed':
        return "The delivery task could not be completed successfully. This might be due to access issues, recipient unavailability, or technical problems.";
      case 'network-error':
        return "Unable to maintain connection with the robot. Please check your internet connection or try again in a few moments.";
      case 'access-denied':
        return "The robot cannot access the delivery location. This might be due to locked doors, restricted areas, or security protocols.";
      default:
        return "An unexpected issue has occurred with your delivery.";
    }
  };

  const getSuggestedActions = () => {
    switch (error.type) {
      case 'robot-stuck':
        return [
          "Wait for automatic resolution (usually 5-10 minutes)",
          "Contact building management if blocking object is present",
          "Contact support if issue persists"
        ];
      case 'task-failed':
        return [
          "Ensure you're available at the delivery location",
          "Check that doors are accessible",
          "Retry the delivery if possible"
        ];
      case 'network-error':
        return [
          "Check your internet connection",
          "Try refreshing the app",
          "Wait a moment and retry"
        ];
      case 'access-denied':
        return [
          "Ensure doors along the route are unlocked",
          "Contact building security if needed",
          "Provide access instructions for robot"
        ];
      default:
        return ["Contact support for assistance"];
    }
  };

  return (
    <Alert className={`${getSeverityColor()} relative`}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getErrorIcon()}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTitle className="text-sm font-medium">{getErrorTitle()}</AlertTitle>
            {getSeverityBadge()}
          </div>
          
          <AlertDescription className="text-sm">
            {error.message}
          </AlertDescription>

          {error.location && (
            <div className="text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 inline mr-1" />
              Location: {error.location}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {error.timestamp}
          </div>

          {!isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-auto p-0 text-xs text-blue-600"
            >
              View details & suggested actions
            </Button>
          )}

          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div>
                <h4 className="text-xs font-medium mb-1">What happened:</h4>
                <p className="text-xs text-muted-foreground">{getDetailedMessage()}</p>
              </div>

              <div>
                <h4 className="text-xs font-medium mb-1">Suggested actions:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {getSuggestedActions().map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                {error.canRetry && onRetry && (
                  <Button size="sm" onClick={onRetry} className="text-xs h-7">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
                
                {onContactSupport && (
                  <Button size="sm" variant="outline" onClick={onContactSupport} className="text-xs h-7">
                    <Phone className="h-3 w-3 mr-1" />
                    Support
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-auto p-0 text-xs text-gray-500"
              >
                Show less
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}