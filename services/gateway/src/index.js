require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const crypto = require('crypto')
const supabase = require('./supabase')
const rosbridge = require('./rosbridge')

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// Maps delivery_id → Set of WebSocket clients watching that delivery
const watchers = new Map()

// ─── HTTP: Create delivery ────────────────────────────────────────────────────

app.post('/deliveries', async (req, res) => {
  // 1. Validate JWT
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Missing token' })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { floor_map_id, pickup_anchor_point_id, dropoff_anchor_point_id } = req.body
  if (!floor_map_id || !pickup_anchor_point_id || !dropoff_anchor_point_id) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // 2. Fetch anchor point details (coordinates + floor info)
  const { data: anchorPoints, error: anchorError } = await supabase
    .from('anchor_points')
    .select('*')
    .in('id', [pickup_anchor_point_id, dropoff_anchor_point_id])

  if (anchorError || anchorPoints.length < 2) {
    return res.status(400).json({ error: 'Could not fetch anchor points' })
  }

  const pickup = anchorPoints.find((p) => p.id === pickup_anchor_point_id)
  const dropoff = anchorPoints.find((p) => p.id === dropoff_anchor_point_id)

  // 3. Fetch user profile to get building_id and name
  const { data: profile } = await supabase
    .from('profiles')
    .select('building_id, full_name')
    .eq('id', user.id)
    .single()

  // 4. Create delivery record in Supabase
  const deliveryCode = `${(profile.full_name || 'user').replace(/\s+/g, '')}-${crypto.randomUUID().split('-')[0]}`

  const { data: delivery, error: deliveryError } = await supabase
    .from('deliveries')
    .insert({
      delivery_code: deliveryCode,
      user_id: user.id,
      building_id: profile.building_id,
      floor_map_id,
      pickup_anchor_point_id,
      dropoff_anchor_point_id,
      status: 'pending',
      progress_percentage: 0
    })
    .select()
    .single()

  if (deliveryError) {
    console.error('Failed to create delivery:', deliveryError)
    return res.status(500).json({ error: 'Failed to create delivery' })
  }

  // 5. Send navigation goal to robot
  rosbridge.publishDeliveryGoal(
    delivery.id,
    { x: pickup.x_position,  y: pickup.y_position  },
    { x: dropoff.x_position, y: dropoff.y_position }
  )

  console.log(`Delivery ${delivery.id} created — goal sent to robot (pickup ${pickup.x_position},${pickup.y_position} → dropoff ${dropoff.x_position},${dropoff.y_position})`)

  res.json({ delivery_id: delivery.id })
})

// ─── WebSocket: Stream position and status updates ────────────────────────────

wss.on('connection', (ws) => {
  let watchingDeliveryId = null

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)

      if (msg.type === 'watch' && msg.delivery_id) {
        watchingDeliveryId = msg.delivery_id

        if (!watchers.has(watchingDeliveryId)) {
          watchers.set(watchingDeliveryId, new Set())
        }
        watchers.get(watchingDeliveryId).add(ws)

        console.log(`Client watching delivery ${watchingDeliveryId}`)
      }
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e)
    }
  })

  ws.on('close', () => {
    if (watchingDeliveryId) {
      watchers.get(watchingDeliveryId)?.delete(ws)
    }
  })
})

// Forward robot position to all currently watching clients
rosbridge.onPosition((position) => {
  watchers.forEach((clients) => {
    clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'position', ...position }))
      }
    })
  })
})

// Forward delivery status updates to the relevant delivery's watchers
rosbridge.onDeliveryStatus(async ({ delivery_id, status }) => {
  // Update Supabase delivery record
  const now = new Date().toISOString()
  const updates = { status, updated_at: now }

  if (status === 'picked-up')  updates.picked_up_at = now
  if (status === 'in-transit') updates.in_transit_at = now
  if (status === 'arrived')    updates.arrived_at = now
  if (status === 'delivered')  updates.delivered_at = now

  await supabase.from('deliveries').update(updates).eq('id', delivery_id)

  // Push status to watching clients
  watchers.get(delivery_id)?.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'status', status }))
    }
  })

  console.log(`Delivery ${delivery_id} → ${status}`)
})

// ─── Start ────────────────────────────────────────────────────────────────────

rosbridge.connect()

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`Gateway running on port ${PORT}`))
