import { useState, useEffect } from "react";
import { MobileStatusBar } from "./MobileStatusBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { RobotAnimation } from "./RobotAnimation";
import { MobileBuildingMap } from "./MobileBuildingMap";
import { ViewToggle } from "./ViewToggle";
import { MobileProgressSteps } from "./MobileProgressSteps";
import { DeliveryDetails } from "./DeliveryDetails";
import { RobotStatus } from "./RobotStatus";
import { UserDeliverySelector } from "./UserDeliverySelector";
import { DeliveryForm } from "./DeliveryForm";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useAuth } from '../contexts/AuthContext';
import {
  getAnchorPointNamesByIds,
  getBuildingNameById,
  getFloorMapById,
  getUserDeliveries,
} from "../lib/auth";
import { Delivery, FloorMap } from "../lib/types";
import { useRealtimeRobotPosition } from "../lib/useRealtimeRobotPosition";
import {
  Settings,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
  Package,
  Plus,
  Bot,
} from "lucide-react";

export function UserDashboard() {
  const { user, signOut } = useAuth();

  // Data state
  const [userDeliveries, setUserDeliveries] = useState<Delivery[] | null>(null);
  const [activeFloorMap, setActiveFloorMap] = useState<FloorMap | null>(null);
  const [anchorPointNames, setAnchorPointNames] = useState<Record<string, string>>({});
  const [loadedAnchorPointIdsKey, setLoadedAnchorPointIdsKey] = useState("");
  const [isLoadingAnchorPointNames, setIsLoadingAnchorPointNames] = useState(false);
  const [buildingName, setBuildingName] = useState<string | null>(null);
  const [loadedBuildingId, setLoadedBuildingId] = useState("");
  const [isLoadingBuildingName, setIsLoadingBuildingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Page state
  const [currentPage, setCurrentPage] = useState<
    "tracking" | "details" | "robot" | "building" | "more"
  >("tracking");
  const [currentView, setCurrentView] = useState<"animation" | "map">("animation");
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [showCreateDelivery, setShowCreateDelivery] = useState(false);

  // Fetch user deliveries
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      const deliveries = await getUserDeliveries(user.id);
      setUserDeliveries(deliveries || []);
      // Set first delivery as selected if none selected
      if (deliveries && deliveries.length > 0 && !selectedDelivery) {
        setSelectedDelivery(deliveries[0].id);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Refetch deliveries function
  const refetchDeliveries = async () => {
    if (!user) return;
    setIsLoading(true);
    const deliveries = await getUserDeliveries(user.id);
    setUserDeliveries(deliveries || []);
    if (deliveries && deliveries.length > 0) {
      setSelectedDelivery(deliveries[0].id);
    }
    setIsLoading(false);
  };

  // Get active delivery
  const activeDelivery = userDeliveries?.find(d => d.id === selectedDelivery) || userDeliveries?.[0];
  const robotPosition = useRealtimeRobotPosition(activeDelivery?.robot_id);
  const deliveryAnchorPointIdsKey = Array.from(new Set(
    (userDeliveries || []).flatMap((delivery) => [
      delivery.pickup_anchor_point_id,
      delivery.dropoff_anchor_point_id,
    ]).filter(Boolean) as string[]
  )).sort().join("|");
  const hasLoadedAnchorPointNames = deliveryAnchorPointIdsKey === loadedAnchorPointIdsKey;

  const getAnchorPointLabel = (
    anchorPointId: string | null | undefined,
    pendingLabel: string,
    unknownLabel: string,
  ) => {
    if (!anchorPointId) {
      return pendingLabel;
    }

    if (anchorPointNames[anchorPointId]) {
      return anchorPointNames[anchorPointId];
    }

    if (!hasLoadedAnchorPointNames || isLoadingAnchorPointNames) {
      return "Loading...";
    }

    return unknownLabel;
  };

  const getDestinationLabel = (delivery: Delivery) =>
    getAnchorPointLabel(
      delivery.dropoff_anchor_point_id,
      "Destination pending",
      "Unknown destination",
    );

  const currentLocationLabel = getAnchorPointLabel(
    activeDelivery?.pickup_anchor_point_id,
    "Unknown",
    "Unknown location",
  );
  const activeDestinationLabel = activeDelivery
    ? getDestinationLabel(activeDelivery)
    : "Destination";
  const activeBuildingLabel =
    activeDelivery?.building_id && buildingName && loadedBuildingId === activeDelivery.building_id
      ? buildingName
      : isLoadingBuildingName
        ? "Loading..."
        : "Unknown building";
  const assignedRobotLabel = activeDelivery?.robot_id
    ? robotPosition.robot?.name || "Assigned robot"
    : "No robot assigned";
  const assignedRobotDescription = robotPosition.robot?.name || "your assigned robot";

  useEffect(() => {
    const floorMapId = activeDelivery?.floor_map_id;

    if (!floorMapId) {
      setActiveFloorMap(null);
      return;
    }

    const fetchFloorMap = async () => {
      try {
        const floorMap = await getFloorMapById(floorMapId);
        setActiveFloorMap(floorMap);
      } catch (error) {
        console.error("Failed to load floor map preview:", error);
        setActiveFloorMap(null);
      }
    };

    void fetchFloorMap();
  }, [activeDelivery?.floor_map_id]);

  useEffect(() => {
    const anchorPointIds = deliveryAnchorPointIdsKey ? deliveryAnchorPointIdsKey.split("|") : [];

    if (anchorPointIds.length === 0) {
      setAnchorPointNames({});
      setLoadedAnchorPointIdsKey("");
      setIsLoadingAnchorPointNames(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingAnchorPointNames(true);

    const fetchAnchorPointNames = async () => {
      try {
        const names = await getAnchorPointNamesByIds(anchorPointIds);
        if (!isCancelled) {
          setAnchorPointNames(names);
          setLoadedAnchorPointIdsKey(deliveryAnchorPointIdsKey);
        }
      } catch (error) {
        console.error("Failed to load anchor point names:", error);
        if (!isCancelled) {
          setAnchorPointNames({});
          setLoadedAnchorPointIdsKey(deliveryAnchorPointIdsKey);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAnchorPointNames(false);
        }
      }
    };

    void fetchAnchorPointNames();

    return () => {
      isCancelled = true;
    };
  }, [deliveryAnchorPointIdsKey]);

  useEffect(() => {
    const buildingId = activeDelivery?.building_id;

    if (!buildingId) {
      setBuildingName(null);
      setLoadedBuildingId("");
      setIsLoadingBuildingName(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingBuildingName(true);

    const fetchBuildingName = async () => {
      try {
        const name = await getBuildingNameById(buildingId);
        if (!isCancelled) {
          setBuildingName(name);
          setLoadedBuildingId(buildingId);
        }
      } catch (error) {
        console.error("Failed to load building name:", error);
        if (!isCancelled) {
          setBuildingName(null);
          setLoadedBuildingId(buildingId);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBuildingName(false);
        }
      }
    };

    void fetchBuildingName();

    return () => {
      isCancelled = true;
    };
  }, [activeDelivery?.building_id]);

  // Helper function to map delivery status to step number
  const getStepFromStatus = (status: Delivery['status']): number => {
    switch (status) {
      case 'pending': return 1;
      case 'assigned': return 1;
      case 'picked-up': return 2;
      case 'in-transit': return 3;
      case 'arrived': return 4;
      case 'delivered': return 5;
      case 'failed': return 1;
      case 'cancelled': return 1;
      default: return 1;
    }
  };

  // Helper to map delivery status to status bar
  const getStatusBarStatus = (status: Delivery['status']): 'pending' | 'in-transit' | 'delivered' | 'delayed' => {
    if (status === 'delivered') return 'delivered';
    if (status === 'in-transit' || status === 'picked-up' || status === 'arrived') return 'in-transit';
    if (status === 'failed' || status === 'cancelled') return 'delayed';
    return 'pending';
  };

  const getTelemetryMessage = () => {
    if (!activeDelivery?.robot_id) {
      return "No robot has been assigned to this delivery yet.";
    }

    if (robotPosition.localizationUnavailable) {
      return "Robot is online, but map-frame localization is unavailable.";
    }

    if (!robotPosition.connected) {
      return "Connecting to live robot updates.";
    }

    if (!robotPosition.isLive) {
      return "Waiting for fresh map-frame coordinates from the robot.";
    }

    return "Showing live map-frame coordinates from the assigned robot.";
  };

  // Show create delivery form
  if (showCreateDelivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <DeliveryForm
          onSuccess={async () => {
            setShowCreateDelivery(false);
            await refetchDeliveries();
          }}
          onCancel={() => setShowCreateDelivery(false)}
        />
      </div>
    );
  }

  const renderMainContent = () => {
    // Empty state with nav structure
    if (!activeDelivery) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-sm">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2">No Deliveries Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first delivery to get started
            </p>
            <Button onClick={() => setShowCreateDelivery(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Delivery
            </Button>
          </Card>
        </div>
      );
    }

    switch (currentPage) {
      case "tracking":
        return (
          <div className="flex-1 flex flex-col">
            {/* View Toggle */}
            <div className="p-4 pb-2">
              <ViewToggle
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-4 pb-6">
              {currentView === "animation" ? (
                <div className="h-full flex flex-col">
                  {/* Robot Animation */}
                  <div className="flex-1">
                    <RobotAnimation
                      status={activeDelivery.status}
                      batteryLevel={100}
                      progress={activeDelivery.progress_percentage}
                      currentStep={getStepFromStatus(activeDelivery.status)}
                      currentLocation={currentLocationLabel}
                    />
                  </div>

                  {/* Progress Steps */}
                  <div className="mt-4">
                    <Card className="p-4">
                      <h3 className="mb-4">Journey Progress</h3>
                      <MobileProgressSteps
                        currentStep={getStepFromStatus(activeDelivery.status)}
                      />
                    </Card>
                  </div>
                </div>
              ) : (
                <MobileBuildingMap
                  floorLabel={
                    activeFloorMap?.floor_name ||
                    (activeFloorMap?.floor_number
                      ? `Floor ${activeFloorMap.floor_number}`
                      : "Floor map")
                  }
                  pathCompleted={activeDelivery.progress_percentage}
                  buildingName={activeBuildingLabel}
                  mapPreviewUrl={activeFloorMap?.map_preview_url || null}
                  liveX={robotPosition.x}
                  liveY={robotPosition.y}
                  isLive={robotPosition.isLive}
                  telemetryMessage={getTelemetryMessage()}
                />
              )}
            </div>
          </div>
        );

      case "details":
        return (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <DeliveryDetails
              recipient={{
                name: user?.full_name || "User",
                apartment: activeDelivery.dropoff_anchor_point_id ? activeDestinationLabel : "N/A",
                floor: 1,
                phone: user?.email || "N/A"
              }}
              package={{
                id: activeDelivery.delivery_code,
                description: "Package",
                sender: "Unknown",
                weight: "Unknown"
              }}
              timing={{
                orderTime: activeDelivery.created_at,
                estimatedDelivery: activeDelivery.estimated_delivery_time || "Calculating...",
                actualDelivery: activeDelivery.delivered_at || undefined
              }}
            />

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Support
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Update
                </Button>
              </div>
            </Card>
          </div>
        );

      case "robot":
        const robotStatus: 'moving' | 'stopped' | 'loading' | 'delivering' =
          activeDelivery.status === 'in-transit' ? 'moving' :
          activeDelivery.status === 'picked-up' ? 'loading' :
          activeDelivery.status === 'arrived' || activeDelivery.status === 'delivered' ? 'delivering' :
          'stopped';

        return (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {activeDelivery.robot_id ? (
              <RobotStatus
                robotName={assignedRobotLabel}
                batteryLevel={100}
                currentLocation={currentLocationLabel}
                speed={1.5}
                status={robotStatus}
              />
            ) : (
              <Card className="p-4">
                <div className="text-center py-8">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2">No Robot Assigned</h3>
                  <p className="text-sm text-muted-foreground">
                    Your delivery is pending robot assignment
                  </p>
                </div>
              </Card>
            )}

            {/* User can only see their assigned robot */}
            <Card className="p-4">
              <h3 className="mb-4">Assigned Robot</h3>
              <p className="text-sm text-muted-foreground">
                {activeDelivery.robot_id
                  ? `Your delivery is being handled by ${assignedRobotDescription}.`
                  : "No robot assigned yet"}
              </p>
            </Card>
          </div>
        );

      case "building":
        return (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {/* Show delivery selector for users with multiple deliveries */}
            {userDeliveries && userDeliveries.length > 1 && (
              <div className="pt-4">
                <UserDeliverySelector
                  deliveries={userDeliveries}
                  selectedDeliveryId={selectedDelivery || ""}
                  getDestinationLabel={getDestinationLabel}
                  onSelectDelivery={setSelectedDelivery}
                />
              </div>
            )}

            {/* Building info for current delivery */}
            <div className="px-4">
              <Card className="p-4">
                <h3 className="mb-4">Delivery Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Building:</span>
                    <span>{activeBuildingLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Code:</span>
                    <span>{activeDelivery.delivery_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{activeDelivery.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress:</span>
                    <span>{activeDelivery.progress_percentage}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case "more":
        return (
          <div className="flex-1 p-4 space-y-4">
            <Card className="p-6">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => setShowCreateDelivery(true)}
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Delivery
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={refetchDeliveries}
                >
                  <RefreshCw className="h-4 w-4 mr-3" />
                  Refresh Deliveries
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Settings & More</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  App Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-3" />
                  Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading your deliveries...</p>
      </div>
    );
  }

  // Empty state without nav (no deliveries at all)
  if (!userDeliveries || userDeliveries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
        {/* Simple header */}
        <div className="bg-white shadow-sm p-4">
          <h2 className="text-lg font-semibold">My Deliveries</h2>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 text-center max-w-sm">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2">No Deliveries Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first delivery to get started
            </p>
            <Button onClick={() => setShowCreateDelivery(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Delivery
            </Button>
          </Card>
        </div>

        {/* Bottom nav placeholder */}
        <MobileBottomNav
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          notifications={{
            details: undefined,
            robot: 0,
            building: 0,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Status Bar */}
      {activeDelivery && (
        <MobileStatusBar
          deliveryId={activeDelivery.delivery_code}
          status={getStatusBarStatus(activeDelivery.status)}
          recipientName={user?.full_name || "User"}
          destination={activeDestinationLabel}
          eta={activeDelivery.estimated_delivery_time || "Calculating..."}
          currentLocation={currentLocationLabel}
        />
      )}

      {/* Main Content */}
      {renderMainContent()}

      {/* Bottom Navigation */}
      <MobileBottomNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        notifications={{
          details: undefined,
          robot: 0,
          building: userDeliveries?.filter((d) => d.status === "pending").length || 0,
        }}
      />
    </div>
  );
}
