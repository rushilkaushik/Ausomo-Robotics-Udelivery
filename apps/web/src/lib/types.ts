
export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user' | 'guest'
  building_id: string | null
  created_at: string
  updated_at: string
}

export interface Building {
  id: string
  name: string
  address: string
  total_floors: number
  created_at: string
  updated_at: string | null
}


export interface FloorMap {
  id: string
  building_id: string
  floor_number: number
  floor_name: string | null
  pcd_file_path: string | null
  pcd_file_name: string | null
  pcd_file_size: number | null
  created_at: string
  updated_at: string | null
}


export type AnchorPointType = 
  | 'entrance'
  | 'reception'
  | 'elevator'
  | 'delivery_point'
  | 'charging_station'
  | 'waypoint'
  | 'obstacle'
  | 'emergency_exit'
  | 'stairs'

export interface AnchorPoint {
  id: string
  floor_map_id: string
  x_position: number
  y_position: number
  z_position: number | null
  name: string
  type: AnchorPointType
  created_at: string
  updated_at: string | null
}


export type RobotStatus = 'idle' | 'moving' | 'error'

export interface Robot {
  robot_id: string
  name: string
  building_id: string | null
  status: RobotStatus
  current_floor_map_id: string | null
  current_anchor_point_id: string | null
  position_x: number | null
  position_y: number | null
  position_z: number | null
  current_location: string | null
  speed: number
  created_at: string
  updated_at: string
}


export type DeliveryStatus = 
  | 'pending'
  | 'assigned'
  | 'picked-up'
  | 'in-transit'
  | 'arrived'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export interface Delivery {
  id: string
  delivery_code: string
  user_id: string | null
  robot_id: string | null
  building_id: string
  floor_map_id: string | null
  pickup_anchor_point_id: string | null
  dropoff_anchor_point_id: string | null
  status: DeliveryStatus
  progress_percentage: number
  created_at: string
  picked_up_at: string | null
  in_transit_at: string | null
  arrived_at: string | null
  delivered_at: string | null
  estimated_delivery_time: string | null
  updated_at: string
}

