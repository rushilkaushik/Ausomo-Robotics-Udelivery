import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { MapPin, Package, Clock, CheckCircle } from 'lucide-react';

interface OrderFlowProps {
  onOrderSubmit: (orderData: OrderData) => void;
  buildingInfo: {
    name: string;
    floors: number;
    address: string;
  };
}

export interface OrderData {
  deliveryLocation: {
    floor: number;
    room: string;
    instructions?: string;
  };
  recipient: {
    name: string;
    phone: string;
  };
  package: {
    description: string;
    pickupLocation: string;
    priority: 'standard' | 'urgent';
  };
}

export function OrderFlow({ onOrderSubmit, buildingInfo }: OrderFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<Partial<OrderData>>({
    deliveryLocation: {},
    recipient: {},
    package: {}
  });

  const updateOrderData = (section: keyof OrderData, data: any) => {
    setOrderData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return orderData.deliveryLocation?.floor && orderData.deliveryLocation?.room;
      case 2:
        return orderData.recipient?.name && orderData.recipient?.phone;
      case 3:
        return orderData.package?.description && orderData.package?.pickupLocation;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (isStepComplete(1) && isStepComplete(2) && isStepComplete(3)) {
      onOrderSubmit(orderData as OrderData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h3>Delivery Location</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Select
                  value={orderData.deliveryLocation?.floor?.toString()}
                  onValueChange={(value) => updateOrderData('deliveryLocation', { floor: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: buildingInfo.floors }, (_, i) => i + 1).map(floor => (
                      <SelectItem key={floor} value={floor.toString()}>
                        Floor {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Room/Apartment Number</Label>
                <Input
                  id="room"
                  placeholder="e.g., 5B, Room 512, Office 3A"
                  value={orderData.deliveryLocation?.room || ''}
                  onChange={(e) => updateOrderData('deliveryLocation', { room: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special instructions for the delivery robot..."
                  value={orderData.deliveryLocation?.instructions || ''}
                  onChange={(e) => updateOrderData('deliveryLocation', { instructions: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-green-500" />
              <h3>Recipient Information</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter recipient's name"
                  value={orderData.recipient?.name || ''}
                  onChange={(e) => updateOrderData('recipient', { name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={orderData.recipient?.phone || ''}
                  onChange={(e) => updateOrderData('recipient', { phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-500" />
              <h3>Package Details</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="description">Package Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Food delivery, Documents, Electronics"
                  value={orderData.package?.description || ''}
                  onChange={(e) => updateOrderData('package', { description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="pickup">Pickup Location</Label>
                <Select
                  value={orderData.package?.pickupLocation}
                  onValueChange={(value) => updateOrderData('package', { pickupLocation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reception">Reception Desk</SelectItem>
                    <SelectItem value="mailroom">Mail Room</SelectItem>
                    <SelectItem value="security">Security Desk</SelectItem>
                    <SelectItem value="loading-dock">Loading Dock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority Level</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={orderData.package?.priority === 'standard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderData('package', { priority: 'standard' })}
                  >
                    Standard
                  </Button>
                  <Button
                    variant={orderData.package?.priority === 'urgent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateOrderData('package', { priority: 'urgent' })}
                  >
                    Urgent
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2>Create New Delivery</h2>
        <p className="text-sm text-muted-foreground">{buildingInfo.name}</p>
      </div>

      {/* Progress Steps */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-500 text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : isStepComplete(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isStepComplete(step) && step !== currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step < currentStep || isStepComplete(step + 1) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Location</span>
          <span>Recipient</span>
          <span>Package</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="p-4">
          {renderStepContent()}
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepComplete(currentStep)}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)}
              className="flex-1"
            >
              Submit Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}