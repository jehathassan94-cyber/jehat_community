import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Forgot from "./components/Forgot";
import DoctorDashboard from "./components/DoctorDashboard";
import SecretaryDashboard from "./components/SecretaryDashboard";
import { User } from "./types";
import { Eye, Sparkles } from "lucide-react";

export default function App() {
  const [screen, setScreen] = useState<"login" | "register" | "forgot">("login");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [startingUp, setStartingUp] = useState(true);

  // Check login state on initial load for persistence quality
  useEffect(() => {
    const storedUser = localStorage.getItem("clinic_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user session", e);
      }
    }
    setStartingUp(false);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("clinic_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("clinic_user");
    setScreen("login");
  };

  if (startingUp) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 text-[#2B6CB0] font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#3182CE] border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#4A5568]">جاري الاتصال بقاعدة بيانات العيادة المشتركة...</p>
        </div>
      </div>
    );
  }

  // Choose which dashboard or portal to show based on user role
  if (currentUser) {
    if (currentUser.role === "doctor") {
      return (
        <DoctorDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    } else {
      // Secretary dashboard and other assistive entities
      return (
        <SecretaryDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Render Authentication portals
  return (
    <div className="relative min-h-screen">
      {screen === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setScreen("register")}
          onNavigateToForgot={() => setScreen("forgot")}
        />
      )}

      {screen === "register" && (
        <Register
          onRegisterSuccess={() => setScreen("login")}
          onNavigateToLogin={() => setScreen("login")}
        />
      )}

      {screen === "forgot" && (
        <Forgot onNavigateToLogin={() => setScreen("login")} />
      )}
    </div>
  );
}
