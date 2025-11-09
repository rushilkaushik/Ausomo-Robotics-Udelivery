import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Bot, Package } from "lucide-react";

interface DeliveryHeaderProps {
  deliveryId: string;
  status: 'in-transit' | 'delivered' | 'pending' | 'delayed';
  robotId: string;
}

export function DeliveryHeader({ deliveryId, status, robotId }: DeliveryHeaderProps) {
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
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Delivery ID</p>
              <p className="font-mono">{deliveryId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Robot</p>
              <p>{robotId}</p>
            </div>
          </div>
        </div>
        <Badge className={`${getStatusColor(status)} text-white`}>
          {getStatusText(status)}
        </Badge>
      </div>
    </Card>
  );
}