# Ausomo Robotics UDelivery System Pipeline Overview

## Current system state

This repository is no longer just a web frontend with placeholder backend folders. The implemented code now falls into three practical areas:

1. `apps/web`
   The user-facing React/Vite application. This is still the main runnable product.
2. `backend`
   Python utility scripts that seed and manage Supabase-backed map data and anchor-point data.
3. `robot`
   Still a placeholder for future robot runtime code.

The important architectural detail is that the backend folder is not a long-running API service yet. It acts as a data-ingestion and storage-management layer for Supabase. The web app still talks directly to Supabase for auth, deliveries, floors, robots, and anchor points.

## Repository roles

- `package.json`
  Root scripts proxy into the web app only.
- `apps/web`
  React + TypeScript frontend, currently the main application runtime.
- `backend`
  Python scripts for Supabase connection verification, floor-map upload, and anchor-point upload.
- `infra`
  Intended infra/config area, but currently not wired into the app setup as documented.
- `robot`
  Future robot integration area; no implemented runtime code yet.

## End-to-end system picture

Today the real data flow looks like this:

1. A developer or operator uses the Python scripts in `backend/` to upload map artifacts and anchor points into Supabase.
2. The web app reads `floor_maps`, `anchor_points`, `deliveries`, `profiles`, and `robots` directly from Supabase.
3. Auth and delivery creation also happen directly from the frontend through the Supabase client.
4. The robot folder does not yet consume the uploaded map data or publish live robot telemetry into the database.

So the backend currently supports the web app indirectly by preparing the map/location data that the frontend needs when users create deliveries.

## Backend folder overview

### `backend/Supabase_client.py`

This file is the shared Supabase connection bootstrap for Python-side tooling.

- Loads environment variables with `load_dotenv()`
- Reads:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE`
- Creates a Supabase client using the service-role key

This is the backend equivalent of the frontend's `apps/web/src/lib/supabaseClient.ts`, but it uses elevated credentials appropriate for admin-style data loading.

### `backend/Verify_Supa.py`

This is a connectivity smoke test for the backend environment.

- Loads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`
- Creates a client
- Calls `client.storage.list_buckets()`
- Prints available buckets if the connection succeeds

Its job is simply to verify that the backend scripts can reach Supabase Storage before running uploads.

### `backend/uploader.py`

This is the main floor-map upload utility.

It does three things:

1. Uploads a local `.pcd` file into a Supabase Storage bucket
2. Generates either a public URL or a signed URL for the uploaded object
3. Inserts or updates the matching row in the `floor_maps` table

Key pieces:

- `build_storage_path(...)`
  Creates a storage key like `Building/{building_id}/{floor_number}/{version}/{filename}`
- `upload_file_to_bucket(...)`
  Uploads the file and falls back to update/replace behavior
- `get_file_url(...)`
  Tries public URL first, then signed URL
- `upsert_floor_map(...)`
  Finds the `floor_maps` record by `building_id` and `floor_number`, then inserts or updates it
- `upload_pcd(...)`
  Main orchestration function tying storage upload and database upsert together

The script also includes `add_anchor_point(...)`, but that helper is not the main workflow in this file.

### `backend/anchor_point_uploader.py`

This script uploads anchor-point metadata from YAML into the `anchor_points` table.

It:

- Reads a YAML file with an `anchor_points` root key
- Validates each point
- Normalizes fields into the DB schema
- Inserts the prepared rows into Supabase

Supported anchor types currently include:

- `entrance`
- `reception`
- `elevator`
- `delivery_point`
- `charging_station`
- `waypoint`
- `obstacle`
- `emergency_exit`

### `backend/AnchorP.yaml`

This is a sample seed file for `anchor_point_uploader.py`.

It currently defines example anchor points such as:

- Entrance
- Reception
- Elevator A
- Charging Station 1

### `backend/test1.txt`

This appears to be an auxiliary local file and is not part of the current runtime pipeline.

### `backend/requirements.txt`

This file lists the packages needed by the backend scripts:

- `boto3`
- `supabase`
- `python-dotenv`
- `PyYAML`

That gives the next team a direct install path for the Python tooling in this branch.

## How the backend works with the web app

The backend does not serve HTTP requests to the frontend. Instead, it prepares Supabase data that the web app later consumes.

### Integration point 1: floor maps

The web app reads `floor_maps` when the user creates a delivery.

Relevant flow:

1. `backend/uploader.py` uploads a `.pcd` file and upserts a `floor_maps` row
2. `apps/web/src/components/DeliveryForm.tsx` queries `floor_maps` for the current user's `building_id`
3. The user chooses a floor from those returned rows

That means the Python uploader is responsible for populating the floor list that the frontend relies on.

### Integration point 2: anchor points

The web app uses anchor points as pickup and dropoff options.

Relevant flow:

1. `backend/anchor_point_uploader.py` inserts rows into `anchor_points`
2. `apps/web/src/lib/auth.ts` fetches anchor points by `floor_map_id`
3. `DeliveryForm.tsx` shows those points in the pickup/dropoff selectors

The frontend filters anchor-point types to:

- `delivery_point`
- `reception`
- `entrance`

So the backend can upload richer location data than the current delivery form actually exposes.

### Integration point 3: shared schema assumptions

The backend and frontend are coupled through the Supabase schema, especially:

- `buildings`
- `floor_maps`
- `anchor_points`
- `deliveries`
- `robots`
- `profiles`

The Python scripts are useful only if the inserted records match the schema expected by the React types in `apps/web/src/lib/types.ts` and the frontend query logic in `apps/web/src/lib/auth.ts`.

## Web app runtime pipeline

The web app remains the primary user workflow.

### Authentication

- `apps/web/src/main.tsx`
  Wraps the app in `AuthProvider`
- `apps/web/src/contexts/AuthContext.tsx`
  Resolves session state, fetches the user profile, and exposes auth helpers
- `apps/web/src/lib/auth.ts`
  Calls Supabase Auth and table queries

### App branching

- `apps/web/src/App.tsx`
  Routes by authenticated user role:
  - unauthenticated users see login/sign-up
  - admins see `AdminDashboard`
  - standard users see `UserDashboard`

### Delivery creation

- `apps/web/src/components/DeliveryForm.tsx`
  Loads `floor_maps` for the user's building
- `apps/web/src/lib/auth.ts`
  Loads eligible `anchor_points`
- `createDelivery(...)`
  Inserts a new row into `deliveries`

This means the backend-prepared map and anchor-point data directly affects whether delivery creation can succeed in the UI.

## What is implemented vs. what is still missing

### Implemented now

- Web frontend for auth, dashboards, and delivery creation
- Frontend direct Supabase integration
- Python backend scripts for:
  - verifying Supabase access
  - uploading `.pcd` floor-map files to Storage
  - upserting `floor_maps`
  - uploading YAML-defined anchor points

### Still missing

- A true backend API service
- Automated orchestration between delivery creation and robot assignment
- A robot process that updates `robots` and `deliveries` in real time
- A frontend map view that actually renders uploaded `.pcd` data
- A maintained deployment target or deployment runbook

## Practical pipeline summary

If you think of the repository as a working pipeline today, it is:

1. Seed buildings/floor maps/anchor points in Supabase using backend Python scripts
2. Run the web app
3. Users sign in and create deliveries against those stored floor and anchor-point records
4. Admins inspect deliveries and robots from Supabase
5. Robot execution remains manual, mocked, or future work

## Important architectural caveat

Even though there is now a `backend/` folder, the repo is still not a conventional full-stack app with:

- frontend calling backend API
- backend calling database
- robot service calling backend

Instead, it currently behaves more like:

- frontend <-> Supabase
- backend scripts -> Supabase
- robot integration not yet connected

That distinction matters because the backend scripts enrich the data model, but they do not yet control application runtime behavior.

## Handoff note

This branch should be handed off as the stable Supabase/web baseline for the project. It is useful for understanding the current user-facing app and data-loading workflow, but it does not contain the gateway-based robot communication work explored later on the `roslibjs` branch.
