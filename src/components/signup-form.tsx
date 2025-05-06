"use client"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner"

interface SignupFormProps extends React.ComponentProps<"div"> {
  heading?: string;
  subheading?: string;
  signupText?: string;
  loginText?: string;
  loginUrl?: string;
}
const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

async function patientSignUp(email: string, password: string, patientId: string) {
  const { data: patientData, error: patientError } = await serviceSupabase
    .from("Patients")
    .select("patient_id_provided")
    .eq("patient_id_provided", patientId)
    .single();

  if (patientError || !patientData) {
    console.error("Patient ID validation error:", patientError?.message || "Patient ID not found");
    toast.error("Invalid Patient ID. Please check your details or contact support.");
    return;
  }

  // Proceed with signup if patient_id is valid
  const { data, error } = await serviceSupabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        patient_id: patientId,
      },
    },
  });

  if (error) {
    console.error("Sign up error:", error.message);
    toast.error("Sign up failed. Check details or contact support.");
  } else {
    console.log("Sign up successful, user:", data.user);
    toast.success("Sign up successful! Please check your email to verify.");
  }

  if (data.user) {
    // Update the patient_basic_info table with the new user_id
    const { error: updateError } = await serviceSupabase
      .from("Patients")
      .update({ user_id: data.user.id })
      .eq("patient_id_provided", patientId);

    if (updateError) {
      console.error("Failed to update Patients with user_id:", updateError.message);
      toast.error("Failed to link account. Please contact support.");
    } else {
      console.log("Patient info updated successfully with user_id.");
      toast.success("Sign up successful! Please check your email to verify.");
    }
  }
  
      if (data.user) {
        const { error: roleError } = await serviceSupabase
          .from("role_user")
          .insert({
            user_id: data.user.id,
            role: "patient",
          });

        if (roleError) {
          console.error("Failed to assign role to user:", roleError.message);
          toast.error("Failed to assign role. Please contact support.");
        } else {
          console.log("Role 'patient' assigned successfully.");
          toast.success("Account setup complete!");
        }
      } else {
        console.error("User data is null. Cannot assign role.");
        toast.error("Sign up failed. Please try again.");
      }
}

export function SignupForm({
  className,
  heading = "Create a new account",
  subheading = "Enter your details below to sign up",
  signupText = "Sign up",
  loginText = "Already have an account?",
  loginUrl = "/auth_admin/login",
  ...props
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [patientId, setPatientId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    await patientSignUp(email, password, patientId);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
          <CardDescription>{subheading}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input
                  id="patient-id"
                  type="text"
                  placeholder="Enter your patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  {signupText}
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
              {loginText}{" "}
              <a
                href={loginUrl}
                className="font-medium text-primary hover:underline"
              >
                Login
              </a>
              </p>
              <p className="mt-2">
              Want to manage the portal?{" "}
              <a
                href="/auth_admin/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up as Admin
              </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
