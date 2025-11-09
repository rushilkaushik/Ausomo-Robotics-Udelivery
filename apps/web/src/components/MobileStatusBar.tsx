import { Badge } from "./ui/badge";
import { Clock, MapPin, User, Package } from "lucide-react";

interface MobileStatusBarProps {
  deliveryId: string;
  status: 'in-transit' | 'delivered' | 'pending' | 'delayed';
  recipientName: string;
  destination: string;
  eta: string;
  currentLocation: string;
}

export function MobileStatusBar({ 
  deliveryId, 
  status, 
  recipientName, 
  destination, 
  eta, 
  currentLocation 
}: MobileStatusBarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'pending': return 'Pending';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      {/* Main status header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{deliveryId}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`${getStatusColor(status)} text-white`}>
              {getStatusText(status)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">ETA</p>
          <p className="font-medium text-blue-600">{eta}</p>
        </div>
      </div>

      {/* Quick info bar */}
      <div className="px-4 py-2 bg-gray-50 border-t">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">To:</span>
            <span className="truncate">{recipientName}</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Apt:</span>
            <span className="truncate">{destination}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 truncate">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Now:</span>
          <span className="truncate">{currentLocation}</span>
        </div>
      </div>
    </div>
  );
}