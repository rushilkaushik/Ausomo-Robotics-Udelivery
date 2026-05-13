# CISC498-Ausomo-Robotics-UDelivery

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

## Repository layout

- `apps/` – User-facing applications, including:
  - `web/` – Web application frontend (React, TypeScript, components, styles)
  - `ios/` – iOS mobile frontend
  - `android/` – Android mobile frontend
- `services/` – Backend services (REST APIs, workers, order management, map data handling)
  - `gateway/` – Node.js gateway service; local runtime config lives in `services/gateway/.env` using `services/gateway/.env.example` as the template
- `robot/` – Robot-side code (ROS2 nodes, robot simulation, navigation, map generation)
- `infra/` – Infrastructure and orchestration setup (docker-compose files, deployment scripts, shared environment wiring)

## How to Run the Web App

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rushilkaushik/CISC498-Ausomo-Robotics.git
   cd CISC498-Ausomo-Robotics
   ```

2. **Navigate to the web application directory:**

   ```bash
   cd apps/web
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Build the app:**

   ```bash
   npm run build
   ```

5. **Preview the built app locally:**

   ```bash
   npm run preview
   ```

   _or_, if you want to run the development server (with hot reload):

   ```bash
   npm run dev
   ```

   _Tip_: While the dev server is running, you can type `o` and hit Enter in the terminal to automatically open the web app in your browser.

## Plans

- **Database Connectivity**: Integrate backend services (`services/`) with a centralized database for storing building maps, tracking orders, robot state, and user information. This ensures real-time access and updates for the apps, as well as persistent storage.
- **Robot Communication**: Enable backend services to establish reliable connections with robot units (via ROS2 APIs), to send commands and receive telemetry and status updates.
- **Linking Everything Together**: Use `docker-compose` within the `infra/` directory to orchestrate all components (frontend, backend, robot simulators, and databases). This will streamline the process of running the entire system locally or in production, ensuring that all services can communicate seamlessly in a reproducible environment.
- **Future improvements**:
  - Automated deployment pipelines for rapid testing and delivery
  - Scalable microservices structure for increased robustness
  - Enhanced security across communications between all system parts
