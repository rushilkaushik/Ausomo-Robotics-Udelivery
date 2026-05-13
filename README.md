# CISC498 Ausomo Robotics UDelivery

This README describes the current `main` branch.

`main` is the stable Supabase-backed web app branch. It does not include the ROS gateway code from `roslibjs`. The implemented pieces on this branch are:

- the React/Vite web app in `apps/web`
- Python scripts in `backend/` for uploading floor maps and anchor points into Supabase

Everything else in the repo should be treated as partial, placeholder, or future work unless documented otherwise.

## Current Project State

This branch supports a browser-based delivery workflow backed directly by Supabase:

- users can sign in and view deliveries
- admins can view building deliveries and robots
- deliveries are created directly from the frontend into Supabase
- floor maps and anchor points can be seeded through Python scripts in `backend/`

There is no robot command bridge in `main`, no live ROS connection, and no maintained production deployment documented for this branch.

## Repository Layout

- `apps/web/`
  Main application runtime. React + TypeScript + Vite frontend.
- `backend/`
  Python utilities for Supabase connection checks, floor-map upload, and anchor-point upload.
- `infra/`
  Contains the environment-variable example file used for handoff setup.
- `robot/`
  Placeholder only on this branch.
- `services/`
  Placeholder only on this branch.
- `apps/ios/` and `apps/android/`
  Placeholders only on this branch.

## Environment Setup

The example values live in `infra/.env.example`.

For a clean local setup, create:

- a repo-root `.env` file for the backend scripts
- `apps/web/.env.local` for the web app

Example:

```bash
cp infra/.env.example .env
cp infra/.env.example apps/web/.env.local
```

### Variables used by the web app

The frontend reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The frontend code also accepts `VITE_SUPABASE_KEY` as a fallback if needed.

### Variables used by the backend scripts

The Python scripts read:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `SUPABASE_BUCKET`

Do not commit real secrets to the repository.

## Run the Web App

All commands below are run from the project root.

1. Install frontend dependencies:

   ```bash
   npm run install:web
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build and preview:

   ```bash
   npm run build
   npm run preview
   ```

### Root scripts

`package.json` proxies into `apps/web`:

- `npm run install:web`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Run the Backend Tools

The backend is not a long-running API service. It is a set of local utilities that prepare Supabase data for the frontend.

1. Create a virtual environment if desired:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Verify Supabase access:

   ```bash
   python backend/Verify_Supa.py
   ```

4. Upload a floor map:

   ```bash
   python backend/uploader.py \
     --building-id <building-uuid> \
     --floor-number 1 \
     --file path/to/map.pcd \
     --floor-name "Floor 1"
   ```

5. Upload anchor points from YAML:

   ```bash
   python backend/anchor_point_uploader.py \
     --floor-map-id <floor-map-uuid> \
     --yaml backend/AnchorP.yaml
   ```

## Architecture Summary

The actual runtime shape of `main` is:

```text
Frontend <-> Supabase
Backend scripts -> Supabase
Robot integration not connected
```

Important implications:

- the frontend talks directly to Supabase for auth and app data
- the Python scripts seed the `floor_maps` and `anchor_points` data used by the UI
- no backend API service sits between the web app and the database
- no robot-side execution path is implemented on this branch

For more detail, see `SYSTEM_PIPELINE_OVERVIEW.md`.

## Known Limitations

- No ROS gateway or web-to-robot communication path exists on `main`
- No maintained deployment target is documented for this branch
- `robot/`, `services/`, `apps/ios/`, and `apps/android/` are not active runtime components
- The frontend does not render uploaded `.pcd` files as a live map
- Robot telemetry and delivery state changes are not streamed in real time from hardware

## Recommended Next Steps

- Keep `main` as the stable Supabase/web baseline
- Use `roslibjs` as the starting point for finishing robot communication work
- Validate the Python data-loading scripts against the current Supabase schema before further expansion
- Decide whether future robot integration should merge into `main` or remain behind a separate service boundary
