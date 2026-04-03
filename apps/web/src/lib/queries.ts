/**
 * queries.ts — centralized Supabase data-fetching layer.
 *
 * All functions return plain typed objects. UUID → name resolution is done
 * here so that UI components never have to deal with raw IDs.
 */

import { supabase } from './supabaseClient'
import type {
  Delivery,
  DeliveryWithDetails,
  Robot,
  Building,
  FloorMap,
  AnchorPoint,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveAnchorName(
  id: string | null,
  map: Record<string, AnchorPoint>
): string | null {
  if (!id) return null
  return map[id]?.name ?? null
}

/** Fetch a map of anchor point id → AnchorPoint for a set of IDs. */
async function fetchAnchorPointMap(
  ids: string[]
): Promise<Record<string, AnchorPoint>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return {}

  const { data, error } = await supabase
    .from('anchor_points')
    .select('*')
    .in('id', unique)

  if (error) throw error
  return Object.fromEntries((data ?? []).map((p) => [p.id, p]))
}

/** Fetch a map of robot id → Robot for a set of IDs. */
async function fetchRobotMap(
  ids: string[]
): Promise<Record<string, Robot>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return {}

  const { data, error } = await supabase
    .from('robots')
    .select('*')
    .in('robot_id', unique)

  if (error) throw error
  return Object.fromEntries((data ?? []).map((r) => [r.robot_id, r]))
}

/** Enrich an array of raw deliveries with human-readable names. */
async function enrichDeliveries(
  deliveries: Delivery[],
  buildingMap: Record<string, Building>
): Promise<DeliveryWithDetails[]> {
  if (deliveries.length === 0) return []

  const anchorIds = deliveries.flatMap((d) =>
    [d.pickup_anchor_point_id, d.dropoff_anchor_point_id].filter(
      (id): id is string => !!id
    )
  )
  const robotIds = deliveries
    .map((d) => d.robot_id)
    .filter((id): id is string => !!id)

  const floorIds = deliveries
    .map((d) => d.floor_map_id)
    .filter((id): id is string => !!id)

  const [anchorMap, robotMap, floorData] = await Promise.all([
    fetchAnchorPointMap(anchorIds),
    fetchRobotMap(robotIds),
    floorIds.length > 0
      ? supabase
          .from('floor_maps')
          .select('*')
          .in('id', [...new Set(floorIds)])
          .then(({ data }) => data ?? [])
      : Promise.resolve([] as FloorMap[]),
  ])

  const floorMap: Record<string, FloorMap> = Object.fromEntries(
    floorData.map((f) => [f.id, f])
  )

  return deliveries.map((d) => ({
    ...d,
    building_name: d.building_id ? (buildingMap[d.building_id]?.name ?? null) : null,
    floor_name: d.floor_map_id
      ? (floorMap[d.floor_map_id]?.floor_name ??
          (floorMap[d.floor_map_id]
            ? `Floor ${floorMap[d.floor_map_id].floor_number}`
            : null))
      : null,
    pickup_point_name: resolveAnchorName(d.pickup_anchor_point_id, anchorMap),
    dropoff_point_name: resolveAnchorName(d.dropoff_anchor_point_id, anchorMap),
    robot_name: d.robot_id ? (robotMap[d.robot_id]?.name ?? null) : null,
    robot_status: d.robot_id ? (robotMap[d.robot_id]?.status ?? null) : null,
  }))
}

// ---------------------------------------------------------------------------
// Public query functions
// ---------------------------------------------------------------------------

/** Fetch all deliveries for a user, enriched with readable names. */
export async function fetchUserDeliveries(
  userId: string
): Promise<DeliveryWithDetails[]> {
  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!deliveries || deliveries.length === 0) return []

  const buildingIds = [
    ...new Set(deliveries.map((d) => d.building_id).filter(Boolean)),
  ]
  const buildingMap = await fetchBuildingMap(buildingIds)

  return enrichDeliveries(deliveries, buildingMap)
}

/** Fetch all deliveries for a building (admin view), enriched. */
export async function fetchAdminDeliveries(
  buildingId: string
): Promise<DeliveryWithDetails[]> {
  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!deliveries || deliveries.length === 0) return []

  const buildingMap = await fetchBuildingMap([buildingId])
  return enrichDeliveries(deliveries, buildingMap)
}

/** Fetch all robots for a building. */
export async function fetchBuildingRobots(
  buildingId: string
): Promise<Robot[]> {
  const { data, error } = await supabase
    .from('robots')
    .select('*')
    .eq('building_id', buildingId)

  if (error) throw error
  return data ?? []
}

/** Fetch building info by ID. */
export async function fetchBuilding(
  buildingId: string
): Promise<Building | null> {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', buildingId)
    .single()

  if (error) return null
  return data
}

/** Fetch floor maps for a building. */
export async function fetchFloorsForBuilding(
  buildingId: string
): Promise<FloorMap[]> {
  const { data, error } = await supabase
    .from('floor_maps')
    .select('*')
    .eq('building_id', buildingId)
    .order('floor_number')

  if (error) throw error
  return data ?? []
}

/** Fetch anchor points for a floor (filtered to useful delivery types). */
export async function fetchAnchorPointsForFloor(
  floorMapId: string
): Promise<AnchorPoint[]> {
  const { data, error } = await supabase
    .from('anchor_points')
    .select('*')
    .eq('floor_map_id', floorMapId)
    .in('type', ['delivery_point', 'reception', 'entrance'])

  if (error) throw error
  return data ?? []
}

/** Insert a new delivery record. */
export async function createDelivery(params: {
  userId: string
  buildingId: string
  floorMapId: string
  pickupAnchorPointId: string
  dropoffAnchorPointId: string
  userName: string
}): Promise<Delivery> {
  const uuid = crypto.randomUUID().split('-')[0]
  const deliveryCode = `${params.userName.replace(/\s+/g, '')}-${uuid}`

  const { data, error } = await supabase
    .from('deliveries')
    .insert({
      delivery_code: deliveryCode,
      user_id: params.userId,
      building_id: params.buildingId,
      floor_map_id: params.floorMapId,
      pickup_anchor_point_id: params.pickupAnchorPointId,
      dropoff_anchor_point_id: params.dropoffAnchorPointId,
      status: 'pending',
      progress_percentage: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchBuildingMap(
  ids: string[]
): Promise<Record<string, Building>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return {}

  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .in('id', unique)

  if (error) throw error
  return Object.fromEntries((data ?? []).map((b) => [b.id, b]))
}
