# Ausomo Robotics UDelivery Project Explanation

## What is actually implemented today

This repository is currently a web-first delivery tracking app backed directly by Supabase. The live code path is almost entirely inside `apps/web`, while `services/` and `robot/` are placeholders (`.gitkeep` only). That means the current "robot delivery pipeline" is:

1. React UI gathers user input.
2. Supabase Auth authenticates the user.
3. Supabase tables store profiles, buildings, floor maps, anchor points, deliveries, and robots.
4. The UI reads delivery and robot rows and turns them into user/admin screens.

There is **not** yet a backend service in `services/` or robot control node in `robot/` that assigns robots, updates robot pose, or advances deliveries automatically.

## Repository structure

- `package.json`
  - Root scripts only proxy into the web app (`dev`, `build`, `preview`, `lint`, `install:web`).
- `apps/web`
  - Real application code.
- `infra/.env`
  - Environment file used by the web app's Supabase client.
- `services/.gitkeep`
  - Planned backend service area, not implemented yet.
- `robot/.gitkeep`
  - Planned robot integration area, not implemented yet.

## Main runtime entry points

### App bootstrap

- `apps/web/src/main.tsx`
  - Wraps `<App />` in `<AuthProvider />` (lines 5-10).
  - This makes auth/session state available to the whole UI through React context.

### Top-level router

- `apps/web/src/App.tsx`
  - `showSignUp` at line 14 controls whether the unauthenticated screen shows `Login` or `SignUp`.
  - `buildingDeliveries` at line 17 and `buildingRobots` at line 18 hold admin-only data.
  - `fetchAdminData` at lines 24-31 loads admin deliveries and robots from Supabase.
  - If `loading` is true, the app shows a loading screen.
  - If `!user`, the app shows `Login` or `SignUp`.
  - If `user.role === "admin"` (line 52), the app renders `AdminDashboard`.
  - Otherwise the app renders `UserDashboard` (line 66).

So the entire app branches off the single `user` object loaded by `AuthContext`.

## Core data model

The shared interfaces are in `apps/web/src/lib/types.ts`.

### Profile / auth model

- `AuthUser` (`types.ts:2`)
  - Key fields: `id`, `email`, `full_name`, `role`, `building_id`.
  - `role` is typed as `'admin' | 'user' | 'guest'`.

### Building and map model

- `Building` (`types.ts` near line 10)
  - `id`, `name`, `address`, `total_floors`.
- `FloorMap` (`types.ts:22`)
  - `id`, `building_id`, `floor_number`, `floor_name`.
- `AnchorPoint` (`types.ts:46`)
  - `id`, `floor_map_id`, `name`, `type`, `x_position`, `y_position`, `z_position`.
  - `AnchorPointType` includes `entrance`, `reception`, `elevator`, `delivery_point`, `charging_station`, etc.

### Robot model

- `RobotStatus` (`types.ts:59`)
  - Canonical shared type: `'idle' | 'moving' | 'error'`.
- `Robot` (`types.ts:61`)
  - Key fields: `robot_id`, `building_id`, `status`, `current_floor_map_id`, `current_anchor_point_id`, `position_x`, `position_y`, `position_z`, `current_location`, `speed`.

### Delivery model

- `DeliveryStatus` (`types.ts:78`)
  - `'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'arrived' | 'delivered' | 'failed' | 'cancelled'`
- `Delivery` (`types.ts:88`)
  - Key fields: `id`, `delivery_code`, `user_id`, `robot_id`, `building_id`, `floor_map_id`, `pickup_anchor_point_id`, `dropoff_anchor_point_id`, `status`, `progress_percentage`.
  - Timing fields: `picked_up_at`, `in_transit_at`, `arrived_at`, `delivered_at`, `estimated_delivery_time`.

## Supabase access layer

All direct database access is centralized in `apps/web/src/lib/auth.ts` plus the Supabase client in `apps/web/src/lib/supabaseClient.ts`.

### Supabase client

- `apps/web/src/lib/supabaseClient.ts`
  - Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Exports a single shared `supabase` client.

### Auth/database helper functions

- `signUpNewUser` (`auth.ts:6`)
  - Creates a Supabase Auth user with `supabase.auth.signUp(...)`.
  - Then upserts the user's `profiles` row.
- `signIn` (`auth.ts:37`)
  - Uses `supabase.auth.signInWithPassword(...)`.
- `getUserDeliveries` (`auth.ts:79`)
  - Reads `deliveries` filtered by `user_id`.
- `getAdminBuildingDeliveries` (`auth.ts:88`)
  - Reads `deliveries` filtered by the admin's `building_id`.
- `getRobotsForbuilding` (`auth.ts:100`)
  - Reads `robots` filtered by `building_id`.
- `getAnchorPointsForFloor` (`auth.ts:106`)
  - Reads `anchor_points` for a `floor_map_id`.
  - Filters types to `delivery_point`, `reception`, and `entrance`.
- `createDelivery` (`auth.ts:117`)
  - Generates `deliveryCode` (line 127) from the user's name + a UUID segment.
  - Inserts a new `deliveries` row.
  - Sets `status: 'pending'` (line 138).
  - Sets `progress_percentage: 0` (line 139).

## Authentication and session flow

All session logic lives in `apps/web/src/contexts/AuthContext.tsx`.

### State owned by AuthContext

- `user` (`AuthContext.tsx:17`)
  - The current `AuthUser` profile row.
- `loading` (`AuthContext.tsx:18`)
  - Global "auth/session is still being resolved" flag.

### Session startup sequence

1. `AuthProvider` mounts.
2. `supabase.auth.getSession()` runs (`AuthContext.tsx:46`).
3. If a session exists, `syncUserFromSession(...)` runs (`AuthContext.tsx:20`).
4. `syncUserFromSession(...)` calls `fetchUserProfile(...)` (`AuthContext.tsx:101`).
5. `fetchUserProfile(...)` queries the `profiles` table and stores the result in `setUser(...)`.
6. If the profile row is missing, `ensureProfileForUser(...)` (`AuthContext.tsx:118`) creates a fallback `profiles` record, then fetches again.
7. `supabase.auth.onAuthStateChange(...)` (`AuthContext.tsx:71`) keeps the React app in sync when a user signs in or signs out.

### Account login flow

- File: `apps/web/src/components/Login.tsx`
- Key state:
  - `loginMethod` (`Login.tsx:17`) switches between `"account"` and `"delivery"`.
  - `credentials` (`Login.tsx:18`) stores `email`, `password`, and `deliveryId`.
  - `submitting` (`Login.tsx:21`) controls the disabled/loading UI.
- Key function:
  - `handleAccountLogin(...)` (`Login.tsx:43`) calls `signIn(...)` from `useAuth()`.

Flow:

1. User enters email/password into `credentials`.
2. `handleAccountLogin(...)` validates input and calls `signIn(email, password)`.
3. `AuthContext.signIn(...)` calls `supabase.auth.signInWithPassword(...)`.
4. Supabase emits `SIGNED_IN`.
5. `AuthContext` loads the matching `profiles` row.
6. `App.tsx` routes based on `user.role`.

### Guest tracking by delivery code

- File: `apps/web/src/components/Login.tsx`
  - `handleDeliveryIdLogin()` (`Login.tsx:63`) calls `guestMode(credentials.deliveryId)`.
- File: `apps/web/src/contexts/AuthContext.tsx`
  - `guestMode(deliveryCode)` (`AuthContext.tsx:149`) queries `deliveries` by `delivery_code`.
  - It then calls `fetchUserProfile(data.user_id)` (`AuthContext.tsx:160`).

Important current behavior:

- `guestMode(...)` does **not** create a true temporary guest object.
- It loads the owner profile for the delivery's `user_id`.
- So "track by delivery code" currently reuses the normal `UserDashboard` path rather than a separate guest-only dashboard.

## Sign-up flow

- File: `apps/web/src/components/SignUp.tsx`
- Key state:
  - `formData` (`SignUp.tsx:48`) stores `email`, `password`, `confirmPassword`, `fullName`, `buildingId`.
  - `loading` (`SignUp.tsx:56`)
  - `success` (`SignUp.tsx:57`)
- Key functions:
  - `resolveBuildingId(...)` (`SignUp.tsx:17`) tries to match the user's typed building input to a real `buildings.id` or `buildings.name`.
  - `handleSignUp()` (`SignUp.tsx:59`) validates the form and calls `signUpNewUser(...)`.

Flow:

1. User fills `formData`.
2. `resolveBuildingId(...)` checks the `buildings` table.
3. `signUpNewUser(...)` creates a Supabase Auth account.
4. `signUpNewUser(...)` upserts the `profiles` row with:
   - `full_name`
   - `role: 'user'`
   - `building_id`
5. The app returns the user to login.

## Delivery creation pipeline

This is the main "request a robot delivery" path.

### Where the create-delivery UI is triggered

- File: `apps/web/src/components/UserDashboard.tsx`
  - `showCreateDelivery` (`UserDashboard.tsx:41`) decides whether the user sees the dashboard or `DeliveryForm`.
  - `setShowCreateDelivery(true)` is used from the empty state and "Create New Delivery" action.

### DeliveryForm state and database reads

- File: `apps/web/src/components/DeliveryForm.tsx`
- Key state:
  - `floors` (`DeliveryForm.tsx:15`) holds `floor_maps` for the user's building.
  - `anchorPoints` (`DeliveryForm.tsx:16`) holds valid locations on the selected floor.
  - `formData` (`DeliveryForm.tsx:20`) holds:
    - `floorMapId`
    - `pickupPointId`
    - `dropoffPointId`
- Key effects:
  - `fetchFloors()` (`DeliveryForm.tsx:28`) queries `floor_maps` where `building_id = user.building_id`.
  - `fetchAnchorPoints()` (`DeliveryForm.tsx:58`) calls `getAnchorPointsForFloor(formData.floorMapId)`.

### Create-delivery submit sequence

- `handleSubmit(...)` starts at `DeliveryForm.tsx:75`.

Flow:

1. User selects a floor in `formData.floorMapId`.
2. The floor change resets `pickupPointId` and `dropoffPointId` (lines 147-152).
3. The second `useEffect(...)` loads `anchorPoints` for that floor.
4. User selects pickup and dropoff anchor point IDs.
5. Validation blocks empty selections and prevents `pickupPointId === dropoffPointId` (`DeliveryForm.tsx:92`).
6. `createDelivery(...)` is called (`DeliveryForm.tsx:99`).
7. `createDelivery(...)` inserts a new `deliveries` row with:
   - `delivery_code`
   - `user_id`
   - `building_id`
   - `floor_map_id`
   - `pickup_anchor_point_id`
   - `dropoff_anchor_point_id`
   - `status = 'pending'`
   - `progress_percentage = 0`
8. `onSuccess()` returns to `UserDashboard`.
9. `UserDashboard.refetchDeliveries()` reloads the user's deliveries from Supabase (`UserDashboard.tsx:62`).

## User dashboard and tracking pipeline

`apps/web/src/components/UserDashboard.tsx` is the main end-user experience.

### State that drives the dashboard

- `userDeliveries` (`UserDashboard.tsx:32`)
  - All deliveries returned by `getUserDeliveries(user.id)`.
- `isLoading` (`UserDashboard.tsx:33`)
  - Loading flag for the delivery fetch.
- `currentPage` (`UserDashboard.tsx:36`)
  - One of `"tracking" | "details" | "robot" | "building" | "more"`.
- `currentView` (`UserDashboard.tsx:39`)
  - One of `"animation" | "map"`.
- `selectedDelivery` (`UserDashboard.tsx:40`)
  - Which delivery card is currently active.
- `showCreateDelivery` (`UserDashboard.tsx:41`)
  - Whether to swap into the create-delivery form.

### How deliveries are loaded

- A `useEffect(...)` runs when `user` becomes available.
- It calls `getUserDeliveries(user.id)`.
- If there are deliveries and no selection yet, it sets `selectedDelivery` to the first row (`UserDashboard.tsx:52-53`).
- `activeDelivery` (`UserDashboard.tsx:74`) is then derived from `selectedDelivery`.

### Important implementation detail: data refresh is manual

There is no realtime subscription, websocket, or polling loop in `UserDashboard.tsx`.

- Deliveries are fetched once on mount.
- They are fetched again only when:
  - a delivery is created successfully
  - the user presses the "Refresh Deliveries" button, which calls `refetchDeliveries()` (`UserDashboard.tsx:62`, `329`)

So delivery progress only changes in the UI after a manual refetch or page reload.

## How delivery status becomes UI

### Canonical delivery state machine

The real backend-facing delivery states are the `DeliveryStatus` union in `apps/web/src/lib/types.ts:78`:

1. `pending`
2. `assigned`
3. `picked-up`
4. `in-transit`
5. `arrived`
6. `delivered`
7. `failed`
8. `cancelled`

These are the best representation of the robot/delivery process currently present in the repo.

### User dashboard mappings

`UserDashboard.tsx` translates backend delivery states into multiple UI-specific state systems.

#### 1. Progress-step mapping

- Function: `getStepFromStatus(...)` (`UserDashboard.tsx:77`)

Mapping:

- `pending` -> step `1`
- `assigned` -> step `1`
- `picked-up` -> step `2`
- `in-transit` -> step `3`
- `arrived` -> step `4`
- `delivered` -> step `5`
- `failed` -> step `1`
- `cancelled` -> step `1`

This `currentStep` is passed into:

- `RobotAnimation` (`UserDashboard.tsx:156`)
- `MobileProgressSteps` (`UserDashboard.tsx:166`)

#### 2. Status-bar mapping

- Function: `getStatusBarStatus(...)` (`UserDashboard.tsx:92`)

Mapping:

- `delivered` -> `delivered`
- `in-transit`, `picked-up`, `arrived` -> `in-transit`
- `failed`, `cancelled` -> `delayed`
- everything else -> `pending`

This feeds `MobileStatusBar`, whose display statuses are:

- `'in-transit' | 'delivered' | 'pending' | 'delayed'`
- File: `apps/web/src/components/MobileStatusBar.tsx:6`

#### 3. Robot card mapping

- Local variable: `robotStatus` (`UserDashboard.tsx:231`)

Mapping:

- `in-transit` -> `'moving'`
- `picked-up` -> `'loading'`
- `arrived` or `delivered` -> `'delivering'`
- everything else -> `'stopped'`

This feeds `RobotStatus`, whose UI states are defined in `apps/web/src/components/RobotStatus.tsx:11`:

- `moving`
- `stopped`
- `loading`
- `delivering`

### Mobile progress timeline states

`apps/web/src/components/MobileProgressSteps.tsx` contains a hard-coded 5-step UI timeline driven only by `currentStep`:

1. `Package Received` (`MobileProgressSteps.tsx:21`)
2. `Journey Started` (`MobileProgressSteps.tsx:29`)
3. `In Transit` (`MobileProgressSteps.tsx:37`)
4. `Almost There` (`MobileProgressSteps.tsx:45`)
5. `Delivered` (`MobileProgressSteps.tsx:53`)

These are presentation states, not persisted database states.

### Robot animation scene states

`apps/web/src/components/RobotAnimation.tsx` creates a third state layer for visuals.

- `getAnimationScene()` starts at line 14.
- It returns one of:
  - `loading`
  - `elevator`
  - `door`
  - `hallway`

How it decides:

- If `currentStep <= 2` or `currentLocation.includes('Reception')` -> `loading`
- Else if `currentLocation.includes('Elevator')` or `currentStep === 3` -> `elevator`
- Else if `currentStep === 4` or `status === 'in-transit'` -> `door`
- Else -> `hallway`

Important current behavior:

- `currentLocation` is passed in from `activeDelivery.pickup_anchor_point_id` in `UserDashboard.tsx:157`, not from a joined anchor-point name.
- So this animation logic only works cleanly if those ID strings happen to contain words like `Reception` or `Elevator`, which is unlikely for UUID-based IDs.
- In practice, the animation is mostly driven by `currentStep`, not real robot telemetry.

## Admin dashboard pipeline

### How admin data is fetched

- File: `apps/web/src/App.tsx`
- When `user.role === "admin"` and `user.building_id` exists:
  - `getAdminBuildingDeliveries(user)` is called.
  - `getRobotsForbuilding(user.building_id)` is called.
  - Results are stored in `buildingDeliveries` and `buildingRobots`.

### What the admin dashboard expects

- File: `apps/web/src/components/AdminDashboard.tsx`
- Local `Robot` interface (`AdminDashboard.tsx:20`) expects:
  - `id`
  - `name`
  - `batteryLevel`
  - `status: 'moving' | 'idle' | 'charging' | 'delivering'`
  - `currentFloor`
  - `currentLocation`
  - `assignedDelivery`
  - `speed`
  - `lastActivity`
- Local `Delivery` interface (`AdminDashboard.tsx:32`) expects:
  - `packageId`
  - `robotId`
  - `recipientName`
  - `destination`
  - `status: 'in-transit' | 'delivered' | 'pending' | 'delayed'`
  - `estimatedDelivery`
  - `currentFloor`
  - `progress`

### Important current mismatch

The shared database models in `apps/web/src/lib/types.ts` do **not** match the richer `AdminDashboard` interfaces exactly:

- shared `Robot` uses `robot_id`, `current_floor_map_id`, `current_anchor_point_id`, `status: 'idle' | 'moving' | 'error'`
- shared `Delivery` uses `delivery_code`, `robot_id`, `status` with 8 values, `progress_percentage`, `estimated_delivery_time`

Because `App.tsx` stores admin data as `any[]`, raw Supabase rows are passed straight into `AdminDashboard`. So the admin screen currently assumes an enriched/reshaped dataset that is not yet produced in this repo.

## End-to-end information exchange pipeline

This is the full implemented information path from login to delivery tracking:

### 1. User authentication

- `Login.tsx` collects credentials in `credentials`.
- `AuthContext.signIn(...)` sends them to Supabase Auth.
- `AuthContext.fetchUserProfile(...)` loads the `profiles` row.
- `App.tsx` branches to `AdminDashboard` or `UserDashboard`.

### 2. Delivery request creation

- `UserDashboard.tsx` opens `DeliveryForm` via `showCreateDelivery`.
- `DeliveryForm.tsx` loads `floor_maps` for `user.building_id`.
- `DeliveryForm.tsx` loads `anchor_points` for `formData.floorMapId`.
- User selects `pickupPointId` and `dropoffPointId`.
- `createDelivery(...)` writes the new `deliveries` row.

### 3. Delivery assignment / robot execution

This part is only partially represented in the current repo.

What the UI expects some external process to update:

- `deliveries.robot_id`
- `deliveries.status`
- `deliveries.progress_percentage`
- `deliveries.estimated_delivery_time`
- `deliveries.picked_up_at`
- `deliveries.in_transit_at`
- `deliveries.arrived_at`
- `deliveries.delivered_at`
- `robots.status`
- `robots.current_location`
- `robots.current_anchor_point_id`
- `robots.current_floor_map_id`
- `robots.position_x`, `position_y`, `position_z`

What is missing in the repo:

- no assignment service in `services/`
- no robot command/telemetry process in `robot/`
- no realtime feed from robot to database
- no frontend subscription to live row updates

### 4. User tracking view

- `UserDashboard.tsx` reads `activeDelivery`.
- `MobileStatusBar` shows summary status.
- `MobileProgressSteps` shows timeline progress.
- `RobotStatus` shows a robot card if `activeDelivery.robot_id` is present.
- `RobotAnimation` shows a visual scene derived from delivery status and current step.

### 5. Admin monitoring view

- `App.tsx` loads all deliveries and robots for the admin's building.
- `AdminDashboard.tsx` computes `stats` (`AdminDashboard.tsx:88`) such as:
  - `activeRobots`
  - `chargingRobots`
  - `inTransit`
  - `pending`
  - `lowBattery`

## Robot states in this project

Because the project uses several overlapping state layers, the cleanest way to understand "robot state" is to separate them into four categories.

### A. Canonical delivery lifecycle states

Source: `apps/web/src/lib/types.ts:78`

- `pending`
  - Delivery exists but has not been assigned or started.
- `assigned`
  - A robot is presumably assigned, though no code in this repo performs that assignment.
- `picked-up`
  - Robot has collected the package.
- `in-transit`
  - Robot is moving toward the destination.
- `arrived`
  - Robot reached the destination area.
- `delivered`
  - Delivery is complete.
- `failed`
  - Delivery could not be completed.
- `cancelled`
  - Delivery was cancelled.

### B. Canonical robot row states

Source: `apps/web/src/lib/types.ts:59`

- `idle`
- `moving`
- `error`

These are the only robot states defined in the shared database model.

### C. User-facing robot panel states

Source: `apps/web/src/components/RobotStatus.tsx:11`

- `stopped`
- `loading`
- `moving`
- `delivering`

These are UI-only states derived in `UserDashboard.tsx:231`.

### D. Animation scene states

Source: `apps/web/src/components/RobotAnimation.tsx`

- `loading`
- `elevator`
- `door`
- `hallway`

These are presentation-only visual states, not database fields.

## Practical pipeline from user login to robot delivery

If you want the shortest mental model of the app, it is this:

1. `main.tsx` starts the app and installs `AuthProvider`.
2. `AuthContext.tsx` resolves the Supabase session and turns it into a `profiles` row in `user`.
3. `App.tsx` chooses `Login`, `SignUp`, `UserDashboard`, or `AdminDashboard` based on `user` and `user.role`.
4. `UserDashboard.tsx` loads the logged-in user's `deliveries`.
5. `DeliveryForm.tsx` lets the user create a delivery by choosing:
   - `floorMapId`
   - `pickupPointId`
   - `dropoffPointId`
6. `auth.ts:createDelivery(...)` inserts a `deliveries` row with `status = 'pending'`.
7. Some external process is expected to later assign a robot and update `deliveries` / `robots`.
8. `UserDashboard.tsx` renders whatever status/robot fields are currently stored in Supabase.
9. `AdminDashboard.tsx` shows the same building-level data from the admin side.

## Current limitations worth knowing

These are important for understanding how the project works today versus where it seems intended to go:

- `services/` and `robot/` are empty, so there is no robot-control backend in the repo yet.
- The frontend talks directly to Supabase; there is no API layer in between.
- Guest delivery-code login currently resolves to the delivery owner's profile instead of a real guest session.
- Delivery tracking is not live; it depends on manual refetch/reload.
- Several UI components display raw IDs rather than joined human-readable names:
  - `pickup_anchor_point_id`
  - `dropoff_anchor_point_id`
  - `building_id`
- `AdminDashboard.tsx` expects richer robot/delivery objects than the shared Supabase row types currently define.

## Summary

The implemented project is a React + Supabase delivery tracking frontend that already supports:

- sign up
- login
- delivery-code lookup
- delivery creation
- user tracking screens
- admin building-level monitoring screens

The missing piece between "user created a delivery" and "robot physically completed it" is the middle service layer that would:

- assign robots
- update delivery states over time
- stream robot telemetry
- push realtime changes back to the UI

Right now the UI is ready to display those state changes, but this repository does not yet contain the code that would generate them.
