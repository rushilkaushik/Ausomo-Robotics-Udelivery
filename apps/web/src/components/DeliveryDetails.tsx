import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { User, MapPin, Package, Clock } from "lucide-react";

interface DeliveryDetailsProps {
  recipient: {
    name: string;
    apartment: string;
    floor: number;
    phone: string;
  };
  package: {
    id: string;
    description: string;
    sender: string;
    weight: string;
  };
  timing: {
    orderTime: string;
    estimatedDelivery: string;
    actualDelivery?: string;
  };
}

export function DeliveryDetails({ recipient, package: pkg, timing }: DeliveryDetailsProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-6">Delivery Details</h3>
      
      <div className="space-y-6">
        {/* Recipient Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-primary" />
            <h4>Recipient</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{recipient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Apartment:</span>
              <span>{recipient.apartment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor:</span>
              <span>{recipient.floor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-mono">{recipient.phone}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Package Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-primary" />
            <h4>Package</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package ID:</span>
              <span className="font-mono">{pkg.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span>{pkg.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From:</span>
              <span>{pkg.sender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{pkg.weight}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timing Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h4>Timing</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Time:</span>
              <span>{timing.orderTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Delivery:</span>
              <span>{timing.estimatedDelivery}</span>
            </div>
            {timing.actualDelivery && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivered:</span>
                <span className="text-green-600">{timing.actualDelivery}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}