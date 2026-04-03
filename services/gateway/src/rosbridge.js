const ROSLIB = require('roslib')

let ros = null
const positionListeners = new Set()
const deliveryStatusListeners = new Set()

function connect() {
  ros = new ROSLIB.Ros({ url: process.env.ROSBRIDGE_URL || 'ws://localhost:9090' })

  ros.on('connection', () => console.log('Connected to rosbridge'))
  ros.on('error', (e) => console.error('Rosbridge error:', e))
  ros.on('close', () => {
    console.log('Rosbridge connection closed, retrying in 3s...')
    setTimeout(connect, 3000)
  })

  // Subscribe to robot pose — fired continuously during navigation
  const poseTopic = new ROSLIB.Topic({
    ros,
    name: '/current_pose',
    messageType: 'geometry_msgs/PoseStamped'
  })

  poseTopic.subscribe((msg) => {
    const { x, y } = msg.pose.position
    const { z, w } = msg.pose.orientation
    // Convert quaternion z/w to yaw (theta) for 2D
    const theta = 2 * Math.atan2(z, w)
    positionListeners.forEach((cb) => cb({ x, y, theta }))
  })

  // Subscribe to delivery status updates published by delivery_task_manager
  // Expected message: JSON string { delivery_id, status }
  const statusTopic = new ROSLIB.Topic({
    ros,
    name: '/delivery_status',
    messageType: 'std_msgs/String'
  })

  statusTopic.subscribe((msg) => {
    try {
      const payload = JSON.parse(msg.data)
      deliveryStatusListeners.forEach((cb) => cb(payload))
    } catch (e) {
      console.error('Failed to parse delivery status message:', e)
    }
  })
}

function publishGoal(x, y) {
  if (!ros) {
    console.warn('Cannot publish goal — not connected to rosbridge')
    return
  }

  const goalTopic = new ROSLIB.Topic({
    ros,
    name: '/web_goal',
    messageType: 'geometry_msgs/PoseStamped'
  })

  goalTopic.publish(new ROSLIB.Message({
    header: { frame_id: 'map' },
    pose: {
      position: { x, y, z: 0 },
      orientation: { x: 0, y: 0, z: 0, w: 1 }
    }
  }))
}

function onPosition(cb) {
  positionListeners.add(cb)
  return () => positionListeners.delete(cb)
}

function onDeliveryStatus(cb) {
  deliveryStatusListeners.add(cb)
  return () => deliveryStatusListeners.delete(cb)
}

module.exports = { connect, publishGoal, onPosition, onDeliveryStatus }
