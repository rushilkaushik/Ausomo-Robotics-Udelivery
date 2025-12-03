import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Package, MapPin, Clock, ChevronRight } from "lucide-react";
import { motion } from 'framer-motion';
import { Delivery, DeliveryStatus } from '../lib/types';

interface UserDeliverySelectorProps {
  deliveries: Delivery[];
  selectedDeliveryId: string;
  onSelectDelivery: (deliveryId: string) => void;
}

const statusColors: Record<DeliveryStatus, string> = {
  'pending': 'bg-gray-500',
  'assigned': 'bg-gray-500',
  'picked-up': 'bg-blue-500',
  'in-transit': 'bg-blue-500',
  'arrived': 'bg-green-500',
  'delivered': 'bg-green-500',
  'failed': 'bg-red-500',
  'cancelled': 'bg-red-500'
};

const statusLabels: Record<DeliveryStatus, string> = {
  'pending': 'Pending',
  'assigned': 'Assigned',
  'picked-up': 'Picked Up',
  'in-transit': 'In Transit',
  'arrived': 'Arrived',
  'delivered': 'Delivered',
  'failed': 'Failed',
  'cancelled': 'Cancelled'
};

export function UserDeliverySelector({
  deliveries,
  selectedDeliveryId,
  onSelectDelivery
}: UserDeliverySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h3>My Deliveries</h3>
        <Badge variant="secondary">{deliveries.length}</Badge>
      </div>

      <div className="space-y-2 px-4">
        {deliveries.map((delivery, index) => (
          <motion.div
            key={delivery.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedDeliveryId === delivery.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectDelivery(delivery.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  delivery.status === 'in-transit' || delivery.status === 'picked-up' ? 'bg-blue-100' :
                  delivery.status === 'delivered' || delivery.status === 'arrived' ? 'bg-green-100' :
                  delivery.status === 'failed' || delivery.status === 'cancelled' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <Package className={`h-5 w-5 ${
                    delivery.status === 'in-transit' || delivery.status === 'picked-up' ? 'text-blue-600' :
                    delivery.status === 'delivered' || delivery.status === 'arrived' ? 'text-green-600' :
                    delivery.status === 'failed' || delivery.status === 'cancelled' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-mono font-semibold">{delivery.delivery_code}</p>
                      <p className="text-xs text-muted-foreground">ID: {delivery.id.slice(0, 8)}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[delivery.status]} text-white text-xs`}
                    >
                      {statusLabels[delivery.status]}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {delivery.dropoff_anchor_point_id || 'Destination pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>
                        ETA: {delivery.estimated_delivery_time
                          ? new Date(delivery.estimated_delivery_time).toLocaleTimeString()
                          : 'Calculating...'}
                      </span>
                    </div>
                  </div>

                  {(delivery.status === 'in-transit' || delivery.status === 'picked-up') && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(delivery.progress_percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${delivery.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {selectedDeliveryId === delivery.id && (
                  <ChevronRight className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {deliveries.length === 0 && (
        <Card className="p-6 mx-4 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No active deliveries</p>
        </Card>
      )}
    </div>
  );
}
