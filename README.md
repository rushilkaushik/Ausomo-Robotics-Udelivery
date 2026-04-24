# Ausomo-Robotics-UDelivery

Indoor delivery robot for Ausomo Robotics made by gang

## Project Overview

This project is an indoor delivery robot tracking platform developed for Ausomo Robotics. It provides a full-stack solution to manage, track, and interact with delivery robots operating inside buildings such as office complexes, hospitals, or university campuses.

### Key Features

- **Real-Time Tracking:** Track delivery robots in real time via modern, easy-to-use web and mobile interfaces.
- **Multi-Platform Apps:** User interfaces available for web (React/TypeScript), iOS, and Android, ensuring accessibility on any device.
- **Backend Services:** Modular backend architecture supporting order management, robot fleet supervision, delivery status, and map data.
- **Robot Integration:** ROS2-compatible robotics code for direct control and telemetry of the delivery robots, including simulation and navigation.
- **Infrastructure as Code:** Deployment and orchestration using Docker Compose for easy setup and reproducible environments.
- **Expandable Architecture:** Clean repo organization supporting rapid development and future extensibility for new delivery scenarios, buildings, or robot types.

### Who Is This For?

- **Facilities Managers** who need to supervise autonomous deliveries in large buildings.
- **Developers/Researchers** interested in robotics, automation, or smart building services.
- **End Users**—anyone expecting or sending parcels internally within a building.

### Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, REST APIs, database integration
- **Robotics:** ROS2 for robot-side code and simulation
- **DevOps:** Docker Compose, shell scripts for streamlined deployment

Learn more about project structure and setup in the sections below.

## Repository Layout

- `apps/` – User-facing applications:
  - `web/` – Web application frontend (React, TypeScript, Tailwind CSS)
  - `ios/` – iOS mobile frontend
  - `android/` – Android mobile frontend
- `services/` – Backend services (REST APIs, workers, order management, map data handling)
- `robot/` – Robot-side code (ROS2 nodes, robot simulation, navigation, map generation)
- `infra/` – Infrastructure and configuration (environment variables, docker-compose files, deployment scripts)

## How to Run the Web App

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rushilkaushik/Ausomo-Robotics-UDelivery.git
   cd Ausomo-Robotics-UDelivery
   ```

2. **Set up environment variables:**

   Copy the example environment file:

   ```bash
   cp infra/.env.example apps/web/.env.local
   ```

   For the web app, the values used at runtime live in:

   ```bash
   apps/web/.env.local
   ```

   Update it with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

   The same example file also includes backend-only variables such as
   `SUPABASE_SERVICE_ROLE` for the Python scripts in `backend/`, but those are not
   required just to run the web app.

3. **Install dependencies:**

   ```bash
   npm run install:web
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   _Tip_: While the dev server is running, you can type `o` and hit Enter in the terminal to automatically open the web app in your browser.

5. **Build for production:**

   ```bash
   npm run build
   npm run preview
   ```

## Available Scripts

All commands are run from the project root:

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run install:web` | Install web app dependencies |

## TODO

### Live Tracking And Map UX

- [ ] Show a live map preview while a delivery is running, including robot position, route progress, and current floor
- [ ] Store and render floor map assets in a web-friendly format for previewing delivery progress on actual building maps
- [ ] Add mobile-friendly live tracking views so users can follow a delivery from phone screens as easily as desktop
- [ ] Add realtime subscriptions for robot and delivery updates so the web app refreshes automatically without manual reloads

### Admin Dashboard And Delivery Actions

- [ ] Add real functionality to the admin dashboard delivery management buttons such as assign robot, dispatch robot, cancel delivery, and update delivery state in Supabase
- [ ] Improve robot fleet visibility in the admin dashboard with battery, last update time, active job, and error state indicators
- [ ] Add delivery status history and timestamps so admins and users can see each stage from pending to delivered

### Robot Integration

- [ ] Connect app delivery destinations to robot navigation waypoints so a selected dropoff can become a robot navigation target
- [ ] Add a robot command bridge or backend service that translates app actions into robot-side navigation commands
- [ ] Add failure handling and recovery actions for stuck robots, failed deliveries, and manual intervention workflows

### Backend, Data, And Security

- [ ] Add role-safe Supabase policies and validation for admin actions that affect robots and deliveries
- [ ] Add backend script documentation and setup steps for uploading maps, anchor points, and other building metadata

---

## Future Improvements

- Automated deployment pipelines for rapid testing and delivery
- Scalable microservices structure for increased robustness
- Enhanced security across communications between all system parts
- Mobile apps (iOS/Android) for on-the-go tracking
