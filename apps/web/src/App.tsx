import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { useAuth } from './contexts/AuthContext';
import { getAdminBuildingDeliveries, getRobotsForbuilding } from "./lib/auth";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  // Authentication state
  const { user, loading, signOut } = useAuth();

  // View state
  const [showSignUp, setShowSignUp] = useState(false);

  // Admin data state
  const [buildingDeliveries, setBuildingDeliveries] = useState<any[] | null>(null);
  const [buildingRobots, setBuildingRobots] = useState<any[] | null>(null);
  const [adminBuildingName, setAdminBuildingName] = useState<string>("Unknown Building");

  // Fetch admin data when user is admin
  useEffect(() => {
    if (!user || user.role !== "admin" || !user.building_id) return;

    const fetchAdminData = async () => {
      const deliveries = await getAdminBuildingDeliveries(user);
      const robots = await getRobotsForbuilding(user.building_id!);

      const { data: building } = await supabase
        .from("buildings")
        .select("name")
        .eq("id", user.building_id)
        .single();

      setBuildingDeliveries(deliveries || []);
      setBuildingRobots(robots || []);
      setAdminBuildingName(building?.name || "Unknown Building");
    };

    fetchAdminData();
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show login or signup screen if not authenticated
  if (!user) {
    if (showSignUp) {
      return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
    }
    return <Login onShowSignUp={() => setShowSignUp(true)} />;
  }

  // Show admin dashboard for admin users
  if (user.role === "admin") {
    return (
      <AdminDashboard
        buildingName={adminBuildingName}
        buildingId={user.building_id || "Unknown building ID"}
        robots={buildingRobots || []}
        deliveries={buildingDeliveries || []}
        onLogout={signOut}
      />
    );
  }

  // Show user dashboard for regular users
  return <UserDashboard />;
}
