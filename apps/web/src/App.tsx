import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

// Types
import { User, Order, Building, Robot } from './types';

// Components
import Login from './components/Login';

export default function App() {

  // Authentication user state
  const [user, setUser] = useState<User | null>(null);

  // UI: Show login when not authenticated, main content when logged in
  const [currentPage, setCurrentPage] = useState<
    "tracking" | "details" | "robot" | "building" | "more"
  >("tracking");

  // Map or animation view
  const [currentView, setCurrentView] = useState<
  "map" | "animation"
  >("animation");

  // Current delivery ID
  // This is the ID of the delivery that the the guest user if viewing
  // or the account user is currently tracking (of the multiple deliveries they have access to)
  const [currentDeliveryId, setCurrentDeliveryId] = useState<string | null>(null);

  // Current delivery robot ID
  const [currentDeliveryRobotId, setCurrentDeliveryRobotId] = useState<string | null>(null);

  // Current delivery robot location
  const [currentDeliveryRobotLocation, setCurrentDeliveryRobotLocation] = useState<string | null>(null);

  // Current viewed delivery progress state
  const [deliveryProgress, setDeliveryProgress] = useState
  <"placed" | "pending" | "delivered" | null
  >(null);

  // Current robot position
  const [robotPosition, setRobotPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  // Current robot location
  const [robotLocation, setRobotLocation] = useState<string | null>(null);

  // Current building
  const [currentBuilding, setCurrentBuilding] = useState<string | null>(null);

  // Login handler
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);

    // Guest users get a single delivery ID
    if (
      loggedInUser.role === "guest" &&
      loggedInUser.orderIds &&
      loggedInUser.orderIds.length === 1
    ) {
      setCurrentDeliveryId(loggedInUser.orderIds[0]);
    }

    
  }
  
  // Show login page if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin dashboard for admin users
  if (user.role === "admin") {
    return <div>Admin Dashboard</div>;
  }

  // Show tracking page for account users and guest users
  if (user.role === "user" || user.role === "guest") {
    return <div>Tracking</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
