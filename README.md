# CISC498 Ausomo Robotics UDelivery

This repository currently documents the `roslibjs` branch architecture, not the `main` branch.

On `main`, the project is centered around a Supabase-backed web app plus Python data-loading scripts in `backend/`. On `roslibjs`, that Python backend is gone. In its place, this branch adds:

- a ROS-aware React frontend in `apps/web`
- a Node.js delivery gateway in `services/gateway`
- a rosbridge-based path for dispatching deliveries to a robot and streaming live updates back to the browser

## Branch Overview

This branch is a web-first delivery control surface for Ausomo Robotics. Users can sign in, create deliveries, and follow delivery status from the browser. Admins can view building-level delivery and robot data. When the optional gateway is enabled, a delivery request is turned into a ROS task over rosbridge instead of being stored in Supabase only.

The branch was created to establish a practical path from the web app to the robot and back again: frontend -> gateway -> rosbridge -> robot, with live status and pose updates returning to the browser.

It remains a separate branch because the team did not complete end-to-end testing against the physical robot before the project ended. Late project time was spent on getting the robot to navigate autonomously, so this branch should be treated as a handoff prototype for finishing robot communication rather than a production-ready merge target.

## Current Capabilities

- Supabase-backed authentication and profile loading
- Separate user and admin dashboards
- Delivery creation using building floors and anchor points stored in Supabase
- Optional gateway dispatch path that publishes `/delivery_goal` over rosbridge
- Optional live WebSocket stream for robot pose and delivery status
- Delivery history, status timeline, and robot/building enrichment in the UI

## Repository Layout

- `apps/web/`
  React + TypeScript + Vite frontend. This is the main user-facing application on this branch.
- `services/gateway/`
  Express + WebSocket gateway that validates Supabase JWTs, creates delivery rows, publishes ROS goals, and forwards robot updates to browser clients.
- `docs/gateway-integration.md`
  Robot-side integration guide for the rosbridge contract used by this branch.
- `apps/ios/` and `apps/android/`
  Placeholders only on this branch.
- `robot/`
  Placeholder only. The robot-side node described in `docs/gateway-integration.md` is not implemented in this repo.
- `infra/`
  Placeholder only on this branch.

## Runtime Architecture

There are two supported delivery flows:

### 1. Frontend-only mode

If no gateway environment variables are configured in the web app:

- the browser talks directly to Supabase
- creating a delivery inserts a row into `deliveries`
- no ROS goal is published
- live robot streaming stays unavailable

This is the fallback development mode.

### 2. Gateway + ROS mode

If the gateway is running and the web app is configured to use it:

```text
Browser
  -> Gateway HTTP POST /deliveries
  -> Supabase insert
  -> rosbridge publish /delivery_goal

Robot node
  -> rosbridge publish /delivery_status and /current_pose
  -> Gateway WebSocket fan-out
  -> Browser live updates
```

In this mode, the "Dispatch Robot" action creates the delivery and immediately tries to send the robot its pickup and dropoff coordinates.

## Run the Web App

All web commands are run from `apps/web`.

1. Install dependencies:

   ```bash
   cd apps/web
   npm install
   ```

2. Create `apps/web/.env.local`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-supabase-key
   ```

3. If you also want gateway mode, add:

   ```env
   VITE_GATEWAY_URL=http://localhost:3001
   VITE_GATEWAY_WS_URL=ws://localhost:3001
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   npm run preview
   ```

## Run the Gateway

All gateway commands are run from `services/gateway`.

1. Install dependencies:

   ```bash
   cd services/gateway
   npm install
   ```

2. Create `services/gateway/.env` from `services/gateway/.env.example`:

   ```env
   PORT=3001
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ROSBRIDGE_URL=ws://localhost:9090
   ```

3. Start the gateway:

   ```bash
   npm run dev
   ```

The gateway will:

- validate the Supabase JWT sent by the frontend
- fetch pickup and dropoff anchor-point coordinates
- create the delivery row in Supabase
- publish a JSON payload on `/delivery_goal`
- subscribe to `/delivery_status` and `/current_pose`
- forward live updates to browser clients over WebSocket

## Important Notes

- There is no root `package.json` on this branch. Run commands inside `apps/web` and `services/gateway`.
- There is no documented deployment target for this branch. The supported handoff path is local setup and local testing.
- The live map UI currently uses a placeholder SVG floor plan. It does not render real `.pcd` floor-map assets yet.
- The robot integration contract is documented in [docs/gateway-integration.md](docs/gateway-integration.md), but the robot-side ROS node itself is expected to live outside this repository for now.
- `robot/`, `infra/`, `apps/ios/`, and `apps/android/` are not active runtime components on this branch.
