import { supabase } from "./supabaseClient";
import type { User } from '@supabase/supabase-js'
import { AuthUser, Delivery, Robot, AnchorPoint, FloorMap } from './types'


export async function signUpNewUser(email:string, password:string, userData: {
    full_name: string,
    building_id: string | null
}) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })
    if (authError) throw authError
    if (!authData.user) {
      throw new Error('Signup completed but no user was returned.')
    }

    // Ensure profile exists and can be fetched immediately after signup.
    const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email: authData.user.email ?? email,
      full_name: userData.full_name,
      role: 'user',
      building_id: userData.building_id
    }, { onConflict: 'id' })

    if (profileError) {
      // Auth user is created; profile will be retried on first login.
      console.warn('Profile setup after signup failed:', profileError.message)
    }
    return authData
}

export async function signIn(email: string, password: string) {
    const {data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    if (error) throw error
    
    return {user: data.user, session: data.session}
}

export async function getUserById(user: User) {
    const userId = user.id
    const {data: profile, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)

    if (error) throw error
    return profile[0]
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return profile
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}



export async function getUserDeliveries(userId: string): Promise<Delivery[] | null> {
  const {data : deliveries} = await supabase
    .from('deliveries')
    .select('*')
    .eq('user_id', userId)
  return deliveries
}


export async function getAdminBuildingDeliveries(user: AuthUser): Promise<Delivery[] | null | undefined> {
  if (user.role == "admin") {
    const admin_building_id = user.building_id
    const {data: deliveries, error: fetchError} = await supabase
      .from('deliveries')
      .select('*')
      .eq('building_id', admin_building_id)
    if (fetchError) throw fetchError
    return deliveries
  }
}

export async function getRobotsForbuilding(buildingId: string): Promise<Robot[] | null> {
  const {data: robots, error: fetchError} = await supabase.from('robots').select('*').eq('building_id', buildingId)
  if (fetchError) throw fetchError
  return robots
}

export async function getAnchorPointsForFloor(floorMapId: string): Promise<AnchorPoint[] | null> {
  const {data: anchorPoints, error: fetchError} = await supabase
    .from('anchor_points')
    .select('*')
    .eq('floor_map_id', floorMapId)
    .in('type', ['delivery_point', 'reception', 'entrance'])

  if (fetchError) throw fetchError
  return anchorPoints
}

export async function getAnchorPointNamesByIds(anchorPointIds: string[]): Promise<Record<string, string>> {
  const uniqueAnchorPointIds = Array.from(new Set(anchorPointIds.filter(Boolean)))

  if (uniqueAnchorPointIds.length === 0) {
    return {}
  }

  const { data: anchorPoints, error: fetchError } = await supabase
    .from('anchor_points')
    .select('id, name')
    .in('id', uniqueAnchorPointIds)

  if (fetchError) throw fetchError

  return (anchorPoints || []).reduce<Record<string, string>>((acc, point) => {
    if (point.name) {
      acc[point.id] = point.name
    }
    return acc
  }, {})
}

export async function getBuildingNameById(buildingId: string): Promise<string | null> {
  const { data: building, error: fetchError } = await supabase
    .from('buildings')
    .select('name')
    .eq('id', buildingId)
    .single()

  if (fetchError) throw fetchError
  return building?.name || null
}

export async function getFloorMapById(floorMapId: string): Promise<FloorMap | null> {
  const { data: floorMap, error: fetchError } = await supabase
    .from('floor_maps')
    .select('*')
    .eq('id', floorMapId)
    .single()

  if (fetchError) throw fetchError
  return floorMap
}

export async function createDelivery(
  userId: string,
  buildingId: string,
  floorMapId: string,
  pickupAnchorPointId: string,
  dropoffAnchorPointId: string,
  userName: string
): Promise<Delivery> {
  // Generate delivery code: username + truncated UUID
  const uuid = crypto.randomUUID().split('-')[0] // First segment of UUID
  const deliveryCode = `${userName.replace(/\s+/g, '')}-${uuid}`

  const {data: delivery, error} = await supabase
    .from('deliveries')
    .insert({
      delivery_code: deliveryCode,
      user_id: userId,
      robot_id: null,
      building_id: buildingId,
      floor_map_id: floorMapId,
      pickup_anchor_point_id: pickupAnchorPointId,
      dropoff_anchor_point_id: dropoffAnchorPointId,
      status: 'pending',
      progress_percentage: 0
    })
    .select()
    .single()

  if (error) throw error
  return delivery
}
