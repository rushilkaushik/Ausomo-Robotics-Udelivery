# CISC498-Ausomo-Robotics
Indoor delivery robot for Ausomo Robotics made by gang

## Repository layout

- `apps/` – user-facing applications (web UI, mobile apps)
  - `web/` – Web app frontend
    - `src/` – Contains all React app source code, including TypeScript files, components, and styles.
  - `ios/` - IOS related frontend
  - `android/` - Android related frontend
- `services/` – backend services (APIs, workers)
- `robot/` – robot-side code (ROS2, maps, sim)
- `infra/` – infrastructure (docker-compose, db, deployment)


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