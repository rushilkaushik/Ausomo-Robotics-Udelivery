import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Building, ImageOff } from "lucide-react";
import { motion } from 'framer-motion';

interface MobileBuildingMapProps {
  floorLabel: string;
  pathCompleted: number;
  buildingName: string;
  mapPreviewUrl: string | null;
  liveX: number | null;
  liveY: number | null;
  isLive: boolean;
  telemetryMessage: string;
}

export function MobileBuildingMap({ 
  floorLabel, 
  pathCompleted,
  buildingName,
  mapPreviewUrl,
  liveX,
  liveY,
  isLive,
  telemetryMessage,
}: MobileBuildingMapProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!mapPreviewUrl) {
      setImageFailed(false);
      setPreviewError(false);
      return;
    }

    setImageFailed(false);
    setPreviewError(false);
  }, [mapPreviewUrl]);

  return (
    <div className="h-full flex flex-col">
      {/* Building header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{buildingName}</h3>
        </div>
        <Badge variant="outline">{floorLabel}</Badge>
      </div>

      {/* Main floor map */}
      <div className="flex-1 overflow-hidden rounded-xl border bg-gray-50">
        {mapPreviewUrl && !imageFailed ? (
          <img
            src={mapPreviewUrl}
            alt={`${floorLabel} map preview`}
            className="h-full w-full object-contain"
            onError={() => {
              setImageFailed(true);
              setPreviewError(true);
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-full bg-gray-200 p-3">
              <ImageOff className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">Map preview not available</p>
              <p className="text-sm text-muted-foreground">
                {previewError
                  ? "The PNG preview URL could not be loaded."
                  : "This floor does not have a generated PNG preview yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h4>Live Robot Position</h4>
          <span
            className={`text-xs font-medium ${
              isLive ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {isLive ? "Live" : "Not live"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {telemetryMessage}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border bg-gray-50 p-3">
            <div className="text-muted-foreground">X Position</div>
            <div className="mt-1 font-mono">
              {isLive && liveX !== null ? liveX.toFixed(3) : "Not found"}
            </div>
          </div>

          <div className="rounded-lg border bg-gray-50 p-3">
            <div className="text-muted-foreground">Y Position</div>
            <div className="mt-1 font-mono">
              {isLive && liveY !== null ? liveY.toFixed(3) : "Not found"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Journey Progress</span>
          <span className="font-medium">{pathCompleted}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pathCompleted}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
