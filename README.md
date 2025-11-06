# CISC498-Ausomo-Robotics
Indoor delivery robot for Ausomo Robotics made by gang

## Repository layout

- `apps/` – user-facing applications (web UI, mobile apps)
  - `web/` – React web frontend
    - `src/` – Contains all React app source code, including TypeScript files, components, and styles.
    - `public/` – Static assets served as-is (e.g. `index.html`, favicon, etc).
  - `ios/` - IOS related frontend
  - `android/` - Android related frontend
- `services/` – backend services (APIs, workers)
- `robot/` – robot-side code (ROS2, maps, sim)
- `infra/` – infrastructure (docker-compose, db, deployment)