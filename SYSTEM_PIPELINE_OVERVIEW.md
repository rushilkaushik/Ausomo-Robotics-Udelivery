# Ausomo Robotics UDelivery System Pipeline Overview

## Branch Context

This document describes the `roslibjs` branch.

It is not the same architecture as `main`.

- `main` centers on `apps/web` plus Python Supabase tooling in `backend/`
- `roslibjs` removes that `backend/` folder and introduces `services/gateway/`
- `roslibjs` also changes the frontend into a ROS-aware dashboard with optional live robot streaming

That distinction matters because the delivery pipeline on this branch can go through a Node gateway and rosbridge, which does not exist on `main`.

This branch was kept separate because it was not fully validated against the physical robot before project closeout. The intended web-to-robot flow is implemented on the repository side, but final robot-network integration and real hardware testing remain handoff work for the next team.

## Current System State

The implemented system on this branch has four practical pieces:

1. `apps/web`
   The active frontend runtime. It handles auth, dashboard views, delivery creation, and live tracking UI.
2. `services/gateway`
   The delivery gateway. It validates Supabase JWTs, inserts deliveries, publishes ROS goals, and streams robot updates to clients.
3. Supabase
   The source of truth for users, profiles, buildings, floor maps, anchor points, robots, and deliveries.
4. External robot runtime
   Not stored in this repo. The expected rosbridge contract is documented in `docs/gateway-integration.md`.

The folders `robot/`, `infra/`, `apps/ios/`, and `apps/android/` are placeholders on this branch and are not part of the current runtime path.

## Repository Roles

- `apps/web/src/main.tsx`
  Boots the React app and wraps it in `AuthProvider`.
- `apps/web/src/contexts/AuthContext.tsx`
  Resolves the active Supabase session and loads the signed-in user's `profiles` row.
- `apps/web/src/App.tsx`
  Routes users into `Login`, `SignUp`, `AdminDashboard`, or `UserDashboard`.
- `apps/web/src/lib/queries.ts`
  Centralized data-fetching layer for deliveries, robots, buildings, floors, and anchor points.
- `apps/web/src/lib/gateway.ts`
  HTTP client for `POST /deliveries` and helper logic for gateway WebSocket URLs.
- `apps/web/src/hooks/useDeliveryStream.ts`
  Browser WebSocket hook for live position and status updates.
- `services/gateway/src/index.js`
  Main Express + WebSocket server.
- `services/gateway/src/rosbridge.js`
  rosbridge connector for publishing `/delivery_goal` and subscribing to `/current_pose` and `/delivery_status`.
- `services/gateway/src/supabase.js`
  Gateway-side Supabase client created from the service-role key.

## End-to-End Delivery Pipeline

### 1. Auth and initial app load

The frontend starts here:

```text
main.tsx
  -> AuthProvider
  -> App.tsx
  -> AdminDashboard or UserDashboard
```

`AuthProvider` checks `supabase.auth.getSession()`. If a session exists, it fetches the matching row from `profiles`. That profile drives:

- role selection (`admin` vs `user`)
- building scoping
- dashboard data loading

### 2. Dashboard data loading

The dashboards query Supabase directly through `apps/web/src/lib/queries.ts`.

The main tables in use are:

- `profiles`
- `buildings`
- `floor_maps`
- `anchor_points`
- `deliveries`
- `robots`

The query layer enriches raw `deliveries` rows by resolving:

- building name
- floor name
- pickup anchor-point name
- dropoff anchor-point name
- robot name and robot status

That enrichment is why the dashboards can render readable labels instead of raw UUIDs.

### 3. Delivery creation in the frontend

`apps/web/src/components/DeliveryForm.tsx` drives delivery creation.

It does the following:

1. Loads the current user's building floors from `floor_maps`
2. Loads allowed pickup and dropoff points from `anchor_points`
3. Validates that pickup and dropoff are both selected and different
4. Chooses one of two delivery paths:
   - direct Supabase mode
   - gateway mode

### 4. Direct Supabase mode

If `VITE_GATEWAY_URL` is not configured, the frontend uses `createDelivery(...)` in `queries.ts`.

The flow is:

```text
Browser
  -> insert into deliveries
  -> UI refreshes from Supabase
```

In this mode:

- the delivery row is created successfully
- no ROS goal is published
- no live robot stream is available
- the feature behaves like a database-backed delivery request form

This is the current fallback mode for local frontend work when the gateway is not running.

### 5. Gateway mode

If `VITE_GATEWAY_URL` is configured, the frontend switches to `createDeliveryViaGateway(...)`.

The flow is:

```text
Browser
  -> POST /deliveries on gateway
  -> Gateway validates Supabase JWT
  -> Gateway fetches anchor_points and profile
  -> Gateway inserts delivery row into Supabase
  -> Gateway publishes /delivery_goal over rosbridge
```

The request body sent by the browser contains:

- `floor_map_id`
- `pickup_anchor_point_id`
- `dropoff_anchor_point_id`

The Supabase access token is sent in the `Authorization: Bearer ...` header.

## Gateway Request Pipeline

`services/gateway/src/index.js` implements the gateway behavior.

When `POST /deliveries` is called, it performs these steps:

1. Extract the bearer token
2. Validate the user with `supabase.auth.getUser(token)`
3. Read pickup and dropoff anchor-point rows from `anchor_points`
4. Read the user's `profiles` row to get `building_id` and `full_name`
5. Insert a new row into `deliveries`
6. Publish a `/delivery_goal` message using the anchor-point coordinates
7. Return `{ delivery_id }` to the browser

The payload published to ROS is a JSON string on `std_msgs/String`:

```json
{
  "delivery_id": "delivery-uuid",
  "pickup": { "x": 1.5, "y": 2.0 },
  "dropoff": { "x": 4.2, "y": 3.8 }
}
```

Those coordinates come directly from `anchor_points.x_position` and `anchor_points.y_position`.

## ROS and Live Tracking Pipeline

The gateway connects to rosbridge through `services/gateway/src/rosbridge.js`.

### ROS topics used

| Topic | Direction | Type | Purpose |
| --- | --- | --- | --- |
| `/delivery_goal` | gateway -> robot | `std_msgs/String` | Delivery task payload containing delivery ID and pickup/dropoff coordinates |
| `/delivery_status` | robot -> gateway | `std_msgs/String` | Status payload such as `picked-up`, `in-transit`, `arrived`, `delivered` |
| `/current_pose` | robot -> gateway | `geometry_msgs/PoseStamped` | Live robot pose used by the frontend tracking view |

### Status update path

When the robot publishes on `/delivery_status`, the gateway:

1. Parses the JSON payload
2. Updates the matching `deliveries` row in Supabase
3. Sets timestamp fields such as:
   - `picked_up_at`
   - `in_transit_at`
   - `arrived_at`
   - `delivered_at`
4. Pushes the new status to WebSocket clients watching that delivery

### Position update path

When the robot publishes on `/current_pose`, the gateway:

1. Converts quaternion `z/w` into a 2D heading angle
2. Builds `{ x, y, theta }`
3. Sends that position to browser clients over WebSocket

The frontend consumes that stream through `useDeliveryStream(...)`.

## Browser WebSocket Pipeline

The gateway also runs a WebSocket server alongside Express.

The frontend stream flow is:

```text
UserDashboard
  -> selects active delivery
  -> useDeliveryStream(deliveryId)
  -> opens gateway WebSocket
  -> sends { type: "watch", delivery_id }
  -> receives position and status updates
```

The browser receives two message shapes:

```json
{ "type": "position", "x": 1.2, "y": 3.4, "theta": 0.5 }
```

```json
{ "type": "status", "status": "in-transit" }
```

`useDeliveryStream(...)` stores:

- latest robot position
- recent position history
- latest pushed status
- connection state (`connecting`, `connected`, `reconnecting`, `error`)

That state feeds the live status pill and the `RobotMap` view in `UserDashboard`.

## Frontend Runtime Details

### User flow

`UserDashboard` is the main branch-specific user experience on this branch.

It provides:

- a sidebar of deliveries
- a create-delivery form
- a delivery detail panel
- a timeline view
- a live tracking section

The live tracking section can switch between:

- `RobotAnimation`
- `RobotMap`

### Admin flow

`AdminDashboard` is a read-oriented building overview.

It loads:

- building deliveries
- building robots
- building metadata

It summarizes robot counts and delivery counts, and it renders detail cards for deliveries and robots. It does not currently implement active robot assignment or dispatch controls in this branch.

### Map rendering

The live map view is only partially wired today.

`apps/web/src/components/RobotMap.tsx` currently:

- renders a placeholder SVG floor plan by default
- can overlay a live robot pose and path trail
- supports optional future map-image input

The current user dashboard does not yet feed real floor-map imagery into `RobotMap`.

There is also another important caveat in `UserDashboard`:

- pickup and dropoff markers in the live map are currently hardcoded placeholder coordinates
- they are not yet pulled from the selected anchor-point coordinates for rendering

So the branch already supports live pose streaming, but not a fully accurate floor-map visualization.

## Environment Wiring

### Web app

The frontend requires:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`

Optional gateway mode adds:

- `VITE_GATEWAY_URL`
- `VITE_GATEWAY_WS_URL`

If the gateway values are missing, the app falls back to direct Supabase delivery creation.

### Gateway

The gateway requires:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ROSBRIDGE_URL`
- `PORT` optional, defaults to `3001`

## Current Architectural Caveats

The current implementation is functional, but it is not yet a complete production pipeline.

### 1. The gateway is optional, not mandatory

The app can run without the gateway. In that case there is no robot dispatch, only database writes.

### 2. Robot assignment is not handled in the gateway

The gateway creates a delivery and publishes a goal immediately, but it does not assign a specific `robot_id` in the `deliveries` row as part of that flow.

### 3. Position streaming is not delivery-scoped

The gateway tracks watchers per delivery for status updates, but `/current_pose` is currently forwarded to every connected watcher. That means the live pose stream behaves like a shared robot feed, not a per-delivery robot channel.

### 4. The live map is still a placeholder

The UI can draw a streamed pose, but it does not yet render real `.pcd` floor-map assets or accurate anchor-point overlays.

### 5. Robot runtime is external to the repo

This repository defines the browser and gateway side of the integration. The ROS node that consumes `/delivery_goal` and publishes `/delivery_status` and `/current_pose` is described in `docs/gateway-integration.md`, but it is not implemented in `robot/`.

### 6. Mobile and infra folders are not active system components

`apps/ios/`, `apps/android/`, and `infra/` are placeholders on this branch and should not be documented as current runtime pieces.

### 7. No maintained deployment target is documented

This branch should be handed off as a local-development and integration branch. The repo documents how to run the frontend and gateway locally, but it does not define a maintained production deployment path.

## Practical Summary

The actual pipeline on `roslibjs` today is:

1. Users authenticate against Supabase in the React app
2. The frontend reads building, floor, anchor-point, robot, and delivery data directly from Supabase
3. Users create a delivery either:
   - directly in Supabase, or
   - through the gateway if gateway mode is enabled
4. In gateway mode, the gateway publishes `/delivery_goal` to the robot over rosbridge
5. The robot publishes `/delivery_status` and `/current_pose`
6. The gateway updates Supabase and forwards live updates to browser clients
7. The frontend shows status progression and a live pose overlay on a placeholder map

That is the current branch-specific system shape the README and other docs should describe.
