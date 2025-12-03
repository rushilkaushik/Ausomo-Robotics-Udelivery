import { supabase } from "./supabaseClient";
import type { User } from '@supabase/supabase-js'
import { AuthUser, Delivery, Robot, AnchorPoint } from './types'


export async function signUpNewUser(email:string, password:string, userData: {
    full_name: string,
    role: string,
    building_id: string
}) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })
    if (authError) throw authError

    // Update the profile that was created by the trigger
    const {data: updateData, error: profileError} = await supabase
    .from('profiles')
    .update({
      full_name: userData.full_name,
      role: userData.role,
      building_id: userData.building_id
    })
    .eq('id', authData.user!.id)
    .select()

    console.log('Update result:', updateData, profileError)
    if (profileError) throw profileError
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
  const {data: robots, error: fetchError} = await supabase.from('robots').select('*').eq('[building_id', buildingId)
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
