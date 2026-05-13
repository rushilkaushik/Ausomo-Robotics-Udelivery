# Gateway Integration Guide

This guide covers how to get the robot to navigate between two waypoints on the same floor when a delivery is created from the web frontend.

---

## Overview

```
User clicks "Dispatch Robot"
        │
        ▼
  Gateway (Node.js)              ← services/gateway/
        │
        │  /delivery_goal (std_msgs/String via rosbridge WebSocket)
        ▼
  delivery_task_node (Python)    ← your ROS node on the robot
        │
        │  sends goals to Nav2 / move_base
        ▼
  Navigation stack
```

The gateway is the middleman. It handles authentication and database writes, then tells the robot what to do over ROS. The robot node handles navigation and reports status back.

---

## Step 1 — Configure and Start the Gateway

### Environment variables

Create `services/gateway/.env`:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ROSBRIDGE_URL=ws://192.168.1.42:9090
```

Change `192.168.1.42` to the actual IP of the robot on your network. If running everything on one machine (simulation), use `ws://localhost:9090`.

### Start the gateway

```bash
cd services/gateway
npm install
npm run dev
```

You should see:
```
Gateway running on port 3001
Connected to rosbridge
```

If you see `Rosbridge connection closed, retrying in 3s...` — rosbridge is not running on the robot yet. The gateway will keep retrying automatically.

---

## Step 2 — Configure the Frontend

Add these to `apps/web/.env.local`:

```env
VITE_GATEWAY_URL=http://localhost:3001
VITE_GATEWAY_WS_URL=ws://localhost:3001
```

Replace `localhost` with the machine running the gateway if they are on different machines. When these are set, the "Dispatch Robot" button will route through the gateway instead of writing directly to Supabase.

---

## Step 3 — Set Up rosbridge on the Robot

rosbridge exposes ROS topics over WebSocket so the gateway can publish and subscribe to them.

**Install (if not already installed):**
```bash
# ROS 2
sudo apt install ros-$ROS_DISTRO-rosbridge-suite

# ROS 1
sudo apt install ros-$ROS_DISTRO-rosbridge-server
```

**Launch:**
```bash
# ROS 2
ros2 launch rosbridge_server rosbridge_websocket_launch.xml

# ROS 1
roslaunch rosbridge_server rosbridge_websocket.launch
```

rosbridge listens on port `9090` by default. Once it's running and the gateway is started, you should see `Connected to rosbridge` in the gateway logs.

---

## Step 4 — Write the Robot-Side Node

This is the node that receives delivery tasks from the gateway and handles navigation. It needs to:

1. Subscribe to `/delivery_goal` — receives both waypoints and the delivery ID
2. Navigate to the pickup point
3. Publish status `picked-up`
4. Navigate to the dropoff point
5. Publish status `delivered`
6. Publish `/current_pose` continuously so the map on the frontend updates in real time

### ROS Topics

| Topic | Direction | Type | Description |
|---|---|---|---|
| `/delivery_goal` | gateway → robot | `std_msgs/String` | JSON with pickup + dropoff coords and delivery ID |
| `/delivery_status` | robot → gateway | `std_msgs/String` | JSON status updates |
| `/current_pose` | robot → gateway | `geometry_msgs/PoseStamped` | Robot position, published continuously |

### `/delivery_goal` message format

The gateway publishes a JSON string on this topic:

```json
{
  "delivery_id": "uuid-of-the-delivery",
  "pickup":  { "x": 1.5, "y": 2.0 },
  "dropoff": { "x": 4.2, "y": 3.8 }
}
```

Coordinates are in metres in the ROS `map` frame. These come from the `x_position` and `y_position` columns of the `anchor_points` table in Supabase.

### `/delivery_status` message format

Publish a JSON string:

```json
{ "delivery_id": "uuid-of-the-delivery", "status": "picked-up" }
```

Valid status values (in order):

| Status | Meaning |
|---|---|
| `picked-up` | Robot has arrived at the pickup point |
| `in-transit` | Robot is now heading to the dropoff |
| `delivered` | Robot has arrived at the dropoff point |

---

### Example Node (ROS 2, Python)

Save this as `delivery_task_node.py` in your ROS 2 package:

```python
import json
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
from nav2_msgs.action import NavigateToPose


class DeliveryTaskNode(Node):
    def __init__(self):
        super().__init__('delivery_task_node')

        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')

        self.goal_sub = self.create_subscription(
            String, '/delivery_goal', self.on_delivery_goal, 10)

        self.status_pub = self.create_publisher(String, '/delivery_status', 10)

        self.get_logger().info('delivery_task_node ready')

    # ── Receive delivery goal from gateway ───────────────────────────────────

    def on_delivery_goal(self, msg):
        try:
            task = json.loads(msg.data)
        except json.JSONDecodeError:
            self.get_logger().error('Could not parse /delivery_goal message')
            return

        delivery_id = task['delivery_id']
        pickup  = task['pickup']
        dropoff = task['dropoff']

        self.get_logger().info(
            f'Delivery {delivery_id}: pickup ({pickup["x"]}, {pickup["y"]}) '
            f'→ dropoff ({dropoff["x"]}, {dropoff["y"]})'
        )

        # Navigate in order: pickup first, then dropoff
        self.navigate_to(pickup, done_callback=lambda: self._on_pickup_done(delivery_id, dropoff))

    # ── Navigation ───────────────────────────────────────────────────────────

    def navigate_to(self, point, done_callback):
        goal = NavigateToPose.Goal()
        goal.pose.header.frame_id = 'map'
        goal.pose.pose.position.x = float(point['x'])
        goal.pose.pose.position.y = float(point['y'])
        goal.pose.pose.position.z = 0.0
        goal.pose.pose.orientation.w = 1.0

        self.nav_client.wait_for_server()
        future = self.nav_client.send_goal_async(goal)
        future.add_done_callback(lambda f: self._on_goal_accepted(f, done_callback))

    def _on_goal_accepted(self, future, done_callback):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().error('Goal rejected by Nav2')
            return
        result_future = goal_handle.get_result_async()
        result_future.add_done_callback(lambda f: done_callback())

    # ── Status transitions ───────────────────────────────────────────────────

    def _on_pickup_done(self, delivery_id, dropoff):
        self.publish_status(delivery_id, 'picked-up')
        self.get_logger().info(f'Delivery {delivery_id}: picked up, heading to dropoff')
        self.navigate_to(dropoff, done_callback=lambda: self._on_dropoff_done(delivery_id))

    def _on_dropoff_done(self, delivery_id):
        self.publish_status(delivery_id, 'delivered')
        self.get_logger().info(f'Delivery {delivery_id}: delivered')

    def publish_status(self, delivery_id, status):
        msg = String()
        msg.data = json.dumps({'delivery_id': delivery_id, 'status': status})
        self.status_pub.publish(msg)


def main():
    rclpy.init()
    node = DeliveryTaskNode()
    rclpy.spin(node)
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### If You Are Using ROS 1 / move_base

Replace the `ActionClient` block with a `move_base` action client:

```python
import actionlib
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal

self.move_base = actionlib.SimpleActionClient('move_base', MoveBaseAction)

def navigate_to(self, point, done_callback):
    goal = MoveBaseGoal()
    goal.target_pose.header.frame_id = 'map'
    goal.target_pose.pose.position.x = float(point['x'])
    goal.target_pose.pose.position.y = float(point['y'])
    goal.target_pose.pose.orientation.w = 1.0
    self.move_base.wait_for_server()
    self.move_base.send_goal(goal, done_cb=lambda state, result: done_callback())
```

---

## Step 5 — Relay Current Pose to the Frontend Map

The frontend map updates in real time from the `/current_pose` topic. If your robot already publishes its pose on a different topic (e.g. `/amcl_pose`), you can relay it without writing any code:

```bash
# ROS 2
ros2 run topic_tools relay /amcl_pose /current_pose geometry_msgs/msg/PoseStamped

# ROS 1
rosrun topic_tools relay /amcl_pose /current_pose
```

Or publish directly to `/current_pose` from your localization setup. The gateway reads it and forwards it to any browser clients watching that delivery.

---

## Anchor Point Coordinates

The `x_position` and `y_position` values stored in the `anchor_points` table must be in the same coordinate frame as the robot's navigation map (the ROS `map` frame, in metres). When you add anchor points to Supabase, use the map coordinates from your LIDAR scan or your nav stack's known waypoints.

You can verify the coordinate frame is correct by checking what the robot's navigation stack expects — the goals are published with `frame_id: 'map'`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Gateway logs `Rosbridge connection closed, retrying...` | rosbridge is not running on the robot. Run the launch command in Step 3. |
| Gateway logs `Connected to rosbridge` but robot doesn't move | The robot node is not running, or it is not subscribed to `/delivery_goal`. Check with `ros2 topic echo /delivery_goal`. |
| Robot moves but status never updates in the frontend | The robot node is not publishing to `/delivery_status`. Check with `ros2 topic echo /delivery_status`. |
| Frontend map shows "Not connected" | `VITE_GATEWAY_WS_URL` is not set, or the gateway is not running. |
| Robot navigates to the wrong location | Anchor point coordinates in Supabase don't match the robot's map frame. Verify `x_position`/`y_position` in the `anchor_points` table. |
| Nav2 rejects the goal | Nav2 may not be fully initialized. Wait for it to print `Lifecycle transition: activate` and try again. |
