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
   ```bash
   cp infra/.env.example infra/.env
   ```
   Then edit `infra/.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   You can find these values in your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

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
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run install:web` | Install web app dependencies |

## TODO

### 1. Fix Row Level Security (RLS) Bugs
- [ ] **Admin Dashboard Data Visibility** — Admins currently cannot view user order data in the admin dashboard
- [ ] Review and update Supabase RLS policies to allow admin role to read all orders
- [ ] Test that regular users can still only see their own orders
- [ ] Verify admin can see aggregated delivery data across all users

### 2. Docker Compose Setup
- [ ] Create `docker-compose.yml` in `infra/` directory
- [ ] Containerize the web application
- [ ] Add database service configuration
- [ ] Add environment variable management for containers

**Why Docker benefits this project:**
- **Consistent environments** — Eliminates "works on my machine" issues; every developer and deployment runs the same setup
- **Easy onboarding** — New team members can run `docker-compose up` instead of manually installing dependencies
- **Microservices ready** — As we add backend services and robot simulators, Docker makes it easy to orchestrate multiple services
- **Production parity** — Local development mirrors production, reducing deployment surprises
- **Isolation** — Each service runs in its own container, preventing dependency conflicts

### 3. Production Deployment
- [ ] Choose hosting platform (Vercel, Netlify, AWS, DigitalOcean, etc.)
- [ ] Configure custom domain and SSL certificate
- [ ] Set up production environment variables securely
- [ ] Configure CI/CD pipeline for automated deployments
- [ ] Set up monitoring and error tracking

### 4. Robot Integration
- [ ] **Simulated Robot** — Set up ROS2 simulation environment (Gazebo) for testing
- [ ] **Physical Robot** — Establish communication protocol with Ausomo robot hardware
- [ ] Implement WebSocket or MQTT connection between web app and robot
- [ ] Add real-time robot position updates to the tracking interface
- [ ] Create robot command API (start delivery, return to base, etc.)

---

## Future Improvements

- Automated deployment pipelines for rapid testing and delivery
- Scalable microservices structure for increased robustness
- Enhanced security across communications between all system parts
- Mobile apps (iOS/Android) for on-the-go tracking
