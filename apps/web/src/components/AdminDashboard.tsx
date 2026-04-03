import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Building, 
  Bot, 
  Package, 
  Activity, 
  Battery, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut
} from "lucide-react";
import { motion } from 'framer-motion';
import { supabase } from "../lib/supabaseClient";
import type { Delivery, Robot } from "../lib/types";

interface AdminDashboardProps {
  buildingName: string;
  robots: Robot[];
  deliveries: Delivery[];
  onLogout: () => void;
}

export function AdminDashboard({ buildingName, robots, deliveries, onLogout }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [recipientNames, setRecipientNames] = useState<Record<string, string>>({});
  const [destinationNames, setDestinationNames] = useState<Record<string, string>>({});
  const [floorLabels, setFloorLabels] = useState<Record<string, string>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving':
      case 'in-transit':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      case 'idle':
        return 'bg-gray-500';
      case 'pending':
      case 'assigned':
      case 'picked-up':
      case 'arrived':
        return 'bg-orange-500';
      case 'error':
      case 'failed':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  useEffect(() => {
    const loadRelatedLabels = async () => {
      const userIds = Array.from(new Set(deliveries.map((delivery) => delivery.user_id).filter(Boolean))) as string[];
      const anchorIds = Array.from(new Set(deliveries.map((delivery) => delivery.dropoff_anchor_point_id).filter(Boolean))) as string[];
      const floorIds = Array.from(new Set([
        ...deliveries.map((delivery) => delivery.floor_map_id),
        ...robots.map((robot) => robot.current_floor_map_id),
      ].filter(Boolean))) as string[];

      if (userIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const nextRecipientNames = (data || []).reduce<Record<string, string>>((acc, profile) => {
          acc[profile.id] = profile.full_name || profile.id;
          return acc;
        }, {});
        setRecipientNames(nextRecipientNames);
      } else {
        setRecipientNames({});
      }

      if (anchorIds.length > 0) {
        const { data } = await supabase
          .from('anchor_points')
          .select('id, name')
          .in('id', anchorIds);

        const nextDestinationNames = (data || []).reduce<Record<string, string>>((acc, point) => {
          acc[point.id] = point.name || point.id;
          return acc;
        }, {});
        setDestinationNames(nextDestinationNames);
      } else {
        setDestinationNames({});
      }

      if (floorIds.length > 0) {
        const { data } = await supabase
          .from('floor_maps')
          .select('id, floor_number, floor_name')
          .in('id', floorIds);

        const nextFloorLabels = (data || []).reduce<Record<string, string>>((acc, floor) => {
          acc[floor.id] = floor.floor_name || `Floor ${floor.floor_number}`;
          return acc;
        }, {});
        setFloorLabels(nextFloorLabels);
      } else {
        setFloorLabels({});
      }
    };

    void loadRelatedLabels();
  }, [deliveries, robots]);

  // Calculate stats
  const stats = {
    totalRobots: robots.length,
    activeRobots: robots.filter(r => r.status === 'moving').length,
    idleRobots: robots.filter(r => r.status === 'idle').length,
    chargingRobots: 0,
    totalDeliveries: deliveries.length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
    lowBattery: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl">{buildingName}</h1>
                <p className="text-sm text-muted-foreground">Administrator Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Robots</p>
                  <p className="text-2xl font-bold">{stats.activeRobots}/{stats.totalRobots}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{stats.inTransit}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stats.lowBattery > 0 ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <AlertCircle className={`h-5 w-5 ${
                    stats.lowBattery > 0 ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Battery</p>
                  <p className="text-2xl font-bold">{stats.lowBattery}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="robots">
              Robots ({robots.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              Deliveries ({deliveries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Robot Status Summary */}
              <Card className="p-6">
                <h3 className="mb-4">Robot Fleet Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Active</span>
                    </div>
                    <Badge className="bg-blue-500">{stats.activeRobots}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Idle</span>
                    </div>
                    <Badge variant="secondary">{stats.idleRobots}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Charging</span>
                    </div>
                    <Badge className="bg-yellow-500">{stats.chargingRobots}</Badge>
                  </div>
                </div>
              </Card>

              {/* Delivery Status Summary */}
              <Card className="p-6">
                <h3 className="mb-4">Delivery Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">In Transit</span>
                    </div>
                    <Badge className="bg-blue-500">{stats.inTransit}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge className="bg-orange-500">{stats.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Delivered</span>
                    </div>
                    <Badge className="bg-green-500">{stats.delivered}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="robots" className="space-y-4">
            {robots.map((robot, index) => (
              <motion.div
                key={robot.robot_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-mono">{robot.name || robot.robot_id}</h4>
                          <Badge className={getStatusColor(robot.status)}>
                            {getStatusText(robot.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Battery className={`h-3 w-3 ${getBatteryColor(100)}`} />
                            <span className={getBatteryColor(100)}>
                              Battery N/A
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">
                              {robot.current_floor_map_id ? floorLabels[robot.current_floor_map_id] || "Unknown floor" : "Unknown floor"}
                            </span>
                          </div>
                          <div className="col-span-2 text-muted-foreground truncate">
                            {robot.current_location || "Unknown location"}
                          </div>
                          {deliveries.find((delivery) => delivery.robot_id === robot.robot_id)?.delivery_code && (
                            <div className="col-span-2 flex items-center gap-1">
                              <Package className="h-3 w-3 text-blue-500" />
                              <span className="text-blue-600 font-mono text-xs">
                                {deliveries.find((delivery) => delivery.robot_id === robot.robot_id)?.delivery_code}
                              </span>
                            </div>
                          )}
                          <div className="col-span-2 text-xs text-muted-foreground">
                            Last activity: {new Date(robot.updated_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {robot.speed ? (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Speed</p>
                        <p className="font-medium">{robot.speed} cm/s</p>
                      </div>
                    ) : null}
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-4">
            {deliveries.map((delivery, index) => (
              <motion.div
                key={delivery.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-mono">{delivery.delivery_code || delivery.id}</h4>
                        <Badge className={getStatusColor(delivery.status)}>
                          {getStatusText(delivery.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Delivery ID: {delivery.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">ETA</p>
                      <p className="font-medium">{delivery.estimated_delivery_time || "Not available"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Recipient</p>
                      <p className="font-medium">{delivery.user_id ? recipientNames[delivery.user_id] || "Unknown recipient" : "Guest / unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Destination</p>
                      <p className="font-medium">
                        {delivery.dropoff_anchor_point_id ? destinationNames[delivery.dropoff_anchor_point_id] || "Unknown destination" : "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Robot</p>
                      <p className="font-medium font-mono text-xs">
                        {delivery.robot_id
                          ? robots.find((robot) => robot.robot_id === delivery.robot_id)?.name || delivery.robot_id
                          : "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Floor</p>
                      <p className="font-medium">
                        {delivery.floor_map_id ? floorLabels[delivery.floor_map_id] || "Unknown floor" : "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{delivery.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getStatusColor(delivery.status)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${delivery.progress_percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
