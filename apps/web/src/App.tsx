import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { MobileStatusBar } from "./components/MobileStatusBar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { RobotAnimation } from "./components/RobotAnimation";
import { MobileBuildingMap } from "./components/MobileBuildingMap";
import { ViewToggle } from "./components/ViewToggle";
import { MobileProgressSteps } from "./components/MobileProgressSteps";
import { DeliveryDetails } from "./components/DeliveryDetails";
import { RobotStatus } from "./components/RobotStatus";
import { BuildingSelector } from "./components/BuildingSelector";
import { DeliveryList } from "./components/DeliveryList";
import { RobotFleet } from "./components/RobotFleet";
import { UserDeliverySelector } from "./components/UserDeliverySelector";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import {
  Settings,
  Phone,
  MessageCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";

// User type definition
interface User {
  id: string;
  name: string;
  role: "admin" | "user";
  buildingId?: string;
  deliveryIds?: string[]; // For account users with multiple deliveries
  deliveryId?: string; // For guest tracking single delivery
}

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);

  // State management
  const [currentPage, setCurrentPage] = useState<
    "tracking" | "details" | "robot" | "building" | "more"
  >("tracking");
  const [currentView, setCurrentView] = useState<
    "animation" | "map"
  >("animation");
  const [currentStep, setCurrentStep] = useState(1);
  const [robotPosition, setRobotPosition] = useState({
    x: 20,
    y: 80,
  });
  const [pathCompleted, setPathCompleted] = useState(15);
  const [currentLocation, setCurrentLocation] =
    useState("Reception Desk");
  const [selectedBuilding, setSelectedBuilding] =
    useState("building-1");
  const [selectedDelivery, setSelectedDelivery] = useState(
    "DEL-2024-001234",
  );
  const [selectedRobot, setSelectedRobot] =
    useState("RB-Alpha-03");

  // Simulate robot movement and status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPathCompleted((prev) => {
        const newProgress = Math.min(prev + 0.8, 100);

        // Update position
        setRobotPosition((prevPos) => ({
          x: Math.min(prevPos.x + 1.2, 85),
          y: Math.max(prevPos.y - 0.6, 15),
        }));

        // Update location and step based on progress
        let newLocation = "Reception Desk";
        let newStep = 1;

        if (newProgress <= 20) {
          newLocation = "Reception Desk";
          newStep = 1;
        } else if (newProgress <= 40) {
          newLocation = "Hallway - Ground Floor";
          newStep = 2;
        } else if (newProgress <= 65) {
          newLocation = "Elevator - Floor 3";
          newStep = 3;
        } else if (newProgress <= 90) {
          newLocation = "Floor 5, Corridor B";
          newStep = 3;
        } else {
          newLocation = "Apt 5B Door";
          newStep = 4;
        }

        setCurrentLocation(newLocation);
        setCurrentStep(newStep);

        return newProgress;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock data - using current location state
  const deliveryData = {
    deliveryId: "DEL-2024-001234",
    status: "in-transit" as const,
    robotId: "RB-Alpha-03",
    batteryLevel: 78,
    currentLocation: currentLocation,
    speed: 12,
    robotStatus: "moving" as const,
    recipient: {
      name: "Sarah Johnson",
      apartment: "5B",
      floor: 5,
      phone: "+1 (555) 123-4567",
    },
    package: {
      id: "PKG-789012",
      description: "Electronics Package",
      sender: "TechMart Inc.",
      weight: "2.3 kg",
    },
    timing: {
      orderTime: "2:25 PM",
      estimatedDelivery: "2:45 PM",
    },
  };

  const mockBuildings = [
    {
      id: "building-1",
      name: "Tech Tower",
      address: "123 Innovation Drive",
      floors: 12,
      activeRobots: 2,
      totalRobots: 3,
      activeDeliveries: 5,
    },
    {
      id: "building-2",
      name: "Corporate Plaza",
      address: "456 Business Ave",
      floors: 8,
      activeRobots: 1,
      totalRobots: 2,
      activeDeliveries: 2,
    },
  ];

  const mockDeliveries = [
    {
      id: "DEL-2024-001234",
      packageId: "PKG-789012",
      robotId: "RB-Alpha-03",
      recipientName: "Sarah Johnson",
      destination: "Apt 5B",
      buildingId: "building-1",
      buildingName: "Tech Tower",
      status: "in-transit" as const,
      estimatedDelivery: "2:45 PM",
      currentFloor: 5,
      progress: pathCompleted,
    },
    {
      id: "DEL-2024-001235",
      packageId: "PKG-789013",
      robotId: "RB-Beta-01",
      recipientName: "John Smith",
      destination: "Apt 3A",
      buildingId: "building-2",
      buildingName: "Corporate Plaza",
      status: "pending" as const,
      estimatedDelivery: "3:15 PM",
      currentFloor: 1,
      progress: 0,
    },
    {
      id: "DEL-2024-001236",
      packageId: "PKG-789014",
      robotId: "RB-Gamma-02",
      recipientName: "Sarah Johnson",
      destination: "Apt 5B",
      buildingId: "building-1",
      buildingName: "Tech Tower",
      status: "delivered" as const,
      estimatedDelivery: "1:30 PM",
      currentFloor: 5,
      progress: 100,
    },
    {
      id: "DEL-2024-001238",
      packageId: "PKG-789016",
      robotId: "RB-Beta-01",
      recipientName: "John Smith",
      destination: "Office 3A",
      buildingId: "building-2",
      buildingName: "Corporate Plaza",
      status: "delivered" as const,
      estimatedDelivery: "11:00 AM",
      currentFloor: 3,
      progress: 100,
    },
    {
      id: "DEL-2024-001240",
      packageId: "PKG-789018",
      robotId: "RB-Alpha-03",
      recipientName: "Sarah Johnson",
      destination: "Apt 5B",
      buildingId: "building-1",
      buildingName: "Tech Tower",
      status: "pending" as const,
      estimatedDelivery: "4:00 PM",
      currentFloor: 1,
      progress: 0,
    },
  ];

  const mockRobots = [
    {
      id: "RB-Alpha-03",
      name: "Alpha-03",
      batteryLevel: deliveryData.batteryLevel,
      status: deliveryData.robotStatus,
      currentFloor: 5,
      currentLocation: deliveryData.currentLocation,
      assignedDelivery: "PKG-789012",
      speed: deliveryData.speed,
      lastActivity: "2 min ago",
    },
    {
      id: "RB-Beta-01",
      name: "Beta-01",
      batteryLevel: 95,
      status: "idle" as const,
      currentFloor: 1,
      currentLocation: "Reception Desk",
      lastActivity: "15 min ago",
    },
    {
      id: "RB-Gamma-02",
      name: "Gamma-02",
      batteryLevel: 32,
      status: "charging" as const,
      currentFloor: -1,
      currentLocation: "Charging Station B1",
      lastActivity: "45 min ago",
    },
  ];

  // Helper function to get delivery data by ID
  const getDeliveryDataById = (deliveryId: string) => {
    // Return the animated data for DEL-2024-001234 (in-transit demo)
    if (deliveryId === "DEL-2024-001234") {
      return deliveryData;
    }

    // Return static data for other deliveries based on mock data
    const delivery = mockDeliveries.find(
      (d) => d.id === deliveryId,
    );
    if (!delivery) return deliveryData;

    const deliveryDetails: { [key: string]: any } = {
      "DEL-2024-001235": {
        deliveryId: "DEL-2024-001235",
        status: "pending" as const,
        robotId: "RB-Beta-01",
        batteryLevel: 95,
        currentLocation: "Reception Desk",
        speed: 0,
        robotStatus: "idle" as const,
        recipient: {
          name: "John Smith",
          apartment: "3A",
          floor: 3,
          phone: "+1 (555) 987-6543",
        },
        package: {
          id: "PKG-789013",
          description: "Office Supplies",
          sender: "SupplyHub",
          weight: "1.5 kg",
        },
        timing: {
          orderTime: "2:50 PM",
          estimatedDelivery: "3:15 PM",
        },
      },
      "DEL-2024-001236": {
        deliveryId: "DEL-2024-001236",
        status: "delivered" as const,
        robotId: "RB-Gamma-02",
        batteryLevel: 85,
        currentLocation: "Reception Desk",
        speed: 0,
        robotStatus: "idle" as const,
        recipient: {
          name: "Sarah Johnson",
          apartment: "5B",
          floor: 5,
          phone: "+1 (555) 123-4567",
        },
        package: {
          id: "PKG-789014",
          description: "Documents Package",
          sender: "Legal Docs Inc.",
          weight: "0.8 kg",
        },
        timing: {
          orderTime: "12:45 PM",
          estimatedDelivery: "1:30 PM",
        },
      },
      "DEL-2024-001238": {
        deliveryId: "DEL-2024-001238",
        status: "delivered" as const,
        robotId: "RB-Beta-01",
        batteryLevel: 92,
        currentLocation: "Reception Desk",
        speed: 0,
        robotStatus: "idle" as const,
        recipient: {
          name: "John Smith",
          apartment: "3A",
          floor: 3,
          phone: "+1 (555) 987-6543",
        },
        package: {
          id: "PKG-789016",
          description: "Medical Supplies",
          sender: "HealthCare Co.",
          weight: "3.2 kg",
        },
        timing: {
          orderTime: "10:15 AM",
          estimatedDelivery: "11:00 AM",
        },
      },
      "DEL-2024-001240": {
        deliveryId: "DEL-2024-001240",
        status: "pending" as const,
        robotId: "RB-Alpha-03",
        batteryLevel: 78,
        currentLocation: "Reception Desk",
        speed: 0,
        robotStatus: "idle" as const,
        recipient: {
          name: "Sarah Johnson",
          apartment: "5B",
          floor: 5,
          phone: "+1 (555) 123-4567",
        },
        package: {
          id: "PKG-789018",
          description: "Grocery Delivery",
          sender: "FreshMart",
          weight: "5.1 kg",
        },
        timing: {
          orderTime: "3:20 PM",
          estimatedDelivery: "4:00 PM",
        },
      },
    };

    return deliveryDetails[deliveryId] || deliveryData;
  };

  const renderMainContent = () => {
    // Get active delivery data based on selected delivery
    const activeDeliveryData =
      getDeliveryDataById(selectedDelivery);

    // Filter deliveries based on user role and access
    const userDeliveries =
      user?.role === "user"
        ? mockDeliveries.filter(
            (d) =>
              user.deliveryIds?.includes(d.id) ||
              user.deliveryId === d.id,
          )
        : mockDeliveries;

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
                      status={activeDeliveryData.robotStatus}
                      batteryLevel={
                        activeDeliveryData.batteryLevel
                      }
                      progress={
                        selectedDelivery === "DEL-2024-001234"
                          ? pathCompleted
                          : activeDeliveryData.progress
                      }
                      currentStep={
                        selectedDelivery === "DEL-2024-001234"
                          ? currentStep
                          : activeDeliveryData.status ===
                              "delivered"
                            ? 5
                            : 1
                      }
                      currentLocation={
                        activeDeliveryData.currentLocation
                      }
                    />
                  </div>

                  {/* Progress Steps - Collapsible */}
                  <div className="mt-4">
                    <Card className="p-4">
                      <h3 className="mb-4">Journey Progress</h3>
                      <MobileProgressSteps
                        currentStep={
                          selectedDelivery === "DEL-2024-001234"
                            ? currentStep
                            : activeDeliveryData.status ===
                                "delivered"
                              ? 5
                              : 1
                        }
                      />
                    </Card>
                  </div>
                </div>
              ) : (
                <MobileBuildingMap
                  currentFloor={
                    activeDeliveryData.recipient.floor
                  }
                  destinationFloor={
                    activeDeliveryData.recipient.floor
                  }
                  robotPosition={robotPosition}
                  pathCompleted={
                    selectedDelivery === "DEL-2024-001234"
                      ? pathCompleted
                      : activeDeliveryData.progress
                  }
                  buildingName={
                    mockDeliveries.find(
                      (d) => d.id === selectedDelivery,
                    )?.buildingName || "Tech Tower"
                  }
                />
              )}
            </div>
          </div>
        );

      case "details":
        return (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <DeliveryDetails
              recipient={activeDeliveryData.recipient}
              package={activeDeliveryData.package}
              timing={activeDeliveryData.timing}
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
                  Call Recipient
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
        return (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <RobotStatus
              robotId={activeDeliveryData.robotId}
              batteryLevel={activeDeliveryData.batteryLevel}
              currentLocation={
                activeDeliveryData.currentLocation
              }
              speed={activeDeliveryData.speed}
              status={activeDeliveryData.robotStatus}
            />
            {/* User can only see their assigned robot */}
            <Card className="p-4">
              <h3 className="mb-4">Assigned Robot</h3>
              <p className="text-sm text-muted-foreground">
                Your delivery is being handled by robot{" "}
                {activeDeliveryData.robotId}
              </p>
            </Card>
          </div>
        );

      case "building":
        return (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {/* Show delivery selector for account users with multiple deliveries */}
            {user?.deliveryIds &&
              user.deliveryIds.length > 0 && (
                <div className="pt-4">
                  <UserDeliverySelector
                    deliveries={mockDeliveries.filter((d) =>
                      user.deliveryIds?.includes(d.id),
                    )}
                    selectedDeliveryId={selectedDelivery}
                    onSelectDelivery={setSelectedDelivery}
                  />
                </div>
              )}

            {/* Building info for current delivery */}
            <div className="px-4">
              <Card className="p-4">
                <h3 className="mb-4">Building Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Building:
                    </span>
                    <span>
                      {mockDeliveries.find(
                        (d) => d.id === selectedDelivery,
                      )?.buildingName || "Tech Tower"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Your Floor:
                    </span>
                    <span>
                      Floor {activeDeliveryData.recipient.floor}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Apartment:
                    </span>
                    <span>
                      {activeDeliveryData.recipient.apartment}
                    </span>
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
              <h3 className="mb-4">Settings & More</h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  App Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-3" />
                  Sync Data
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Phone className="h-4 w-4 mr-3" />
                  Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
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

  // Handle login
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // If guest user with single delivery ID, set it as selected
    if (
      loggedInUser.role === "user" &&
      loggedInUser.deliveryId
    ) {
      setSelectedDelivery(loggedInUser.deliveryId);
    }
    // If account user with multiple deliveries, select the first active one
    if (
      loggedInUser.role === "user" &&
      loggedInUser.deliveryIds &&
      loggedInUser.deliveryIds.length > 0
    ) {
      // Find first in-transit or pending delivery, otherwise first delivery
      const activeDelivery = mockDeliveries.find(
        (d) =>
          loggedInUser.deliveryIds?.includes(d.id) &&
          (d.status === "in-transit" || d.status === "pending"),
      );
      setSelectedDelivery(
        activeDelivery?.id || loggedInUser.deliveryIds[0],
      );
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setCurrentPage("tracking");
    // Reset progress for demo
    setPathCompleted(15);
    setRobotPosition({ x: 20, y: 80 });
    setCurrentLocation("Reception Desk");
    setCurrentStep(1);
  };

  // Show login screen if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin dashboard for admin users
  if (user.role === "admin") {
    // Filter deliveries and robots for admin's building only
    const buildingDeliveries = mockDeliveries.filter(
      (d) => d.buildingId === user.buildingId,
    );
    const buildingRobots = mockRobots; // All robots shown for now - can be filtered by building if needed
    const buildingName =
      mockBuildings.find((b) => b.id === user.buildingId)
        ?.name || "Tech Tower";

    return (
      <AdminDashboard
        buildingName={buildingName}
        robots={buildingRobots}
        deliveries={buildingDeliveries}
        onLogout={handleLogout}
      />
    );
  }

  // Get active delivery data based on selected delivery
  const activeDeliveryData =
    getDeliveryDataById(selectedDelivery);

  // Regular user view - can only see their own delivery
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Status Bar */}
      <MobileStatusBar
        deliveryId={activeDeliveryData.deliveryId}
        status={activeDeliveryData.status}
        recipientName={activeDeliveryData.recipient.name}
        destination={activeDeliveryData.recipient.apartment}
        eta={activeDeliveryData.timing.estimatedDelivery}
        currentLocation={activeDeliveryData.currentLocation}
      />

      {/* Main Content */}
      {renderMainContent()}

      {/* Bottom Navigation */}
      <MobileBottomNav
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        notifications={{
          details: undefined,
          robot: mockRobots.filter((r) => r.batteryLevel < 30)
            .length,
          building: mockDeliveries.filter(
            (d) => d.status === "pending",
          ).length,
        }}
      />
    </div>
  );
}