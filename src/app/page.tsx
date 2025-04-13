"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

function LandingPage() {
  const pathname = usePathname();

  const handleLogin = () => {
    window.location.href = "/auth_admin/login";
  };

  const handleSignup = () => {
    window.location.href = "/auth_admin/signup_patient";
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
