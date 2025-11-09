import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Package, Clock, User, MapPin } from "lucide-react";

interface Delivery {
  id: string;
  packageId: string;
  robotId: string;
  recipientName: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  currentFloor: number;
  progress: number;
}

interface DeliveryListProps {
  deliveries: Delivery[];
  selectedDelivery: string | null;
  onDeliverySelect: (deliveryId: string) => void;
}

export function DeliveryList({ deliveries, selectedDelivery, onDeliverySelect }: DeliveryListProps) {
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
      <h3 className="mb-6">Active Deliveries</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedDelivery === delivery.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-border hover:border-border/60'
            }`}
            onClick={() => onDeliverySelect(delivery.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{delivery.packageId}</span>
              </div>
              <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                {getStatusText(delivery.status)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{delivery.recipientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{delivery.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>ETA: {delivery.estimatedDelivery}</span>
              </div>
            </div>
            
            {delivery.status === 'in-transit' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{delivery.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${delivery.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {deliveries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active deliveries</p>
          </div>
        )}
      </div>
    </Card>
  );
}