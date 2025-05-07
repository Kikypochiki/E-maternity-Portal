"use client";
import { Button } from "@/components/ui/button";

function LandingPage() {

  const handleLogin = () => {
    window.location.href = "/auth_admin/login";
  };

  const handleSignup = () => {
    window.location.href = "/auth_admin/signup";
  };

  return (
    <div>
      <h1>Landing Page</h1>
      <Button onClick={handleLogin}>Log In</Button>
      <Button onClick={handleSignup}>Sign Up</Button>
    </div>
  );
}

// Removed unused LoginPage and SignupPage components

export default function App() {
  return (
    <div>
      <LandingPage />
    </div>
  );
}
