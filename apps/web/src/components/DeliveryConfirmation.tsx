import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Camera, CheckCircle, Clock, AlertTriangle, Package, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// The file '../tools/unsplash' appears to be an internal tool, likely used to get Unsplash images dynamically.
// If it does not exist, you should implement it or replace its functionality.
// For now, we'll remove the import and provide a stub function as a placeholder.

async function unsplash_tool({ query }: { query: string }): Promise<string> {
  // This is a placeholder function simulating fetching an Unsplash image URL based on a search query.
  // Replace this with actual integration to Unsplash or your existing logic as needed.
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
}

interface DeliveryConfirmationProps {
  deliveryData: {
    id: string;
    recipient: {
      name: string;
      phone: string;
      location: string;
    };
    package: {
      description: string;
      id: string;
    };
    confirmationCode: string;
    deliveryPhoto?: string;
    status: 'waiting-confirmation' | 'confirmed' | 'failed';
  };
  onConfirm: (method: 'code' | 'button', value?: string) => void;
  onReportIssue: () => void;
}

export function DeliveryConfirmation({ deliveryData, onConfirm, onReportIssue }: DeliveryConfirmationProps) {
  const [enteredCode, setEnteredCode] = useState('');
  const [confirmationMethod, setConfirmationMethod] = useState<'code' | 'button' | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    // Simulate delivery photo
    const loadPhoto = async () => {
      try {
        const photo = await unsplash_tool({ query: 'robot delivery package door' });
        setPhotoUrl(photo);
      } catch (error) {
        console.log('Could not load photo');
      }
    };
    loadPhoto();
  }, []);

  const handleCodeConfirmation = () => {
    if (enteredCode === deliveryData.confirmationCode) {
      onConfirm('code', enteredCode);
    }
  };

  const handleButtonConfirmation = () => {
    onConfirm('button');
  };

  if (deliveryData.status === 'confirmed') {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <h2 className="text-green-800">Delivery Confirmed!</h2>
              <p className="text-sm text-green-600">Package successfully delivered</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Card className="p-4 border-green-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Delivery ID:</span>
                <Badge variant="secondary">{deliveryData.id}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Confirmed at:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recipient:</span>
                <span>{deliveryData.recipient.name}</span>
              </div>
            </div>
          </Card>

          {photoUrl && (
            <Card className="p-4">
              <h3 className="mb-3">Delivery Photo</h3>
              <ImageWithFallback
                src={photoUrl}
                alt="Delivery confirmation photo"
                className="w-full rounded-lg max-h-64 object-cover"
              />
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (deliveryData.status === 'failed') {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h2 className="text-red-800">Delivery Failed</h2>
              <p className="text-sm text-red-600">Unable to complete delivery</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <Card className="p-4 border-red-200">
            <p className="text-sm text-muted-foreground mb-4">
              The robot was unable to complete the delivery. This could be due to:
            </p>
            <ul className="text-sm space-y-2">
              <li>• Recipient not available</li>
              <li>• Door access issues</li>
              <li>• Navigation problems</li>
              <li>• Technical difficulties</li>
            </ul>
          </Card>

          <Button onClick={onReportIssue} variant="outline" className="w-full">
            Contact Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-blue-800">Delivery Arrived!</h2>
            <p className="text-sm text-blue-600">Please confirm receipt of your package</p>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Recipient:</span>
            <div className="font-medium">{deliveryData.recipient.name}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>
            <div className="font-medium">{deliveryData.recipient.location}</div>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Package:</span>
            <div className="font-medium">{deliveryData.package.description}</div>
          </div>
        </div>
      </div>

      {/* Delivery Photo */}
      {photoUrl && (
        <div className="p-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Delivery Photo</span>
            </div>
            <ImageWithFallback
              src={photoUrl}
              alt="Delivery photo showing package at door"
              className="w-full rounded-lg max-h-48 object-cover cursor-pointer"
              onClick={() => setShowPhoto(true)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tap to view full size
            </p>
          </Card>
        </div>
      )}

      {/* Confirmation Methods */}
      <div className="flex-1 p-4 space-y-4">
        <h3>Confirm Delivery Receipt</h3>
        
        {/* Code Confirmation */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Enter Confirmation Code</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the 4-digit code displayed on the robot's screen
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter code"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.slice(0, 4))}
                className="flex-1"
                maxLength={4}
              />
              <Button
                onClick={handleCodeConfirmation}
                disabled={enteredCode.length !== 4}
              >
                Confirm
              </Button>
            </div>
            {enteredCode && enteredCode !== deliveryData.confirmationCode && enteredCode.length === 4 && (
              <p className="text-sm text-red-500">Incorrect code. Please try again.</p>
            )}
          </div>
        </Card>

        {/* Button Confirmation */}
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Quick Confirmation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Confirm you've received your package
            </p>
            <Button onClick={handleButtonConfirmation} className="w-full" variant="default">
              Yes, I received my package
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Confirmation Code: {deliveryData.confirmationCode}
          </div>
          <Button variant="ghost" size="sm" onClick={onReportIssue}>
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}