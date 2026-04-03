import { useState } from "react";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserDashboard } from "./components/UserDashboard";
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (showSignUp) {
      return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
    }
    return <Login onShowSignUp={() => setShowSignUp(true)} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
