"use client"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// Removed unused import of supabase
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
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

interface SignupFormProps extends React.ComponentProps<"div"> {
    heading?: string;
    subheading?: string;
    signupText?: string;
    googleText?: string;
    loginText?: string;
    loginUrl?: string;
}

const ADMIN_CODE = "secureAdminCode123"; // Replace with your actual admin code

// Create a Supabase client with the service role key
const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

async function adminSignUp(email: string, password: string, adminCode: string) {
    if (adminCode !== ADMIN_CODE) {
        toast.error("Invalid Admin Code. Please contact support.");
        return;
    }

    const { data, error } = await serviceSupabase.auth.admin.createUser({
        email: email,
        password: password,
        user_metadata: {
            role: "admin",
        },
    });

    if (error) {
        console.error("Sign up error:", error.message);
        toast.error("Sign up failed. Check details or contact support.");
    } else {
        console.log("User signed up successfully:", data.user);
        toast.success("Sign up successful! Welcome, Admin.");
    }

    if (data) {
        const { error: roleError } = await serviceSupabase
            .from("role_user")
            .insert({
                user_id: data?.user?.id || null, // Ensure user_id is not null
                role: "admin",
            });

        if (roleError) {
            console.error("Failed to assign role to user:", roleError.message);
            toast.error("Failed to assign role. Please contact support.");
        } else {
            console.log("Role 'admin' assigned successfully.");
            toast.success("Account setup complete!");
        }
    }
}

export function SignupFormAdmin({
    className,
    heading = "Create an admin account",
    subheading = "Enter your details below to sign up as an admin",
    signupText = "Sign up",
    googleText = "Sign up with Google",
    loginText = "Already have an account?",
    loginUrl = "/auth_admin/login",
    ...props
}: SignupFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [adminCode, setAdminCode] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        await adminSignUp(email, password, adminCode);
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
                                    placeholder="admin@example.com"
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
                                <Label htmlFor="admin-code">Admin Code</Label>
                                <Input
                                    id="admin-code"
                                    type="text"
                                    placeholder="Enter the admin code"
                                    value={adminCode}
                                    onChange={(e) => setAdminCode(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    {signupText}
                                </Button>
                                <Button variant="outline" className="w-full">
                                    {googleText}
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {loginText}{" "}
                            <a href={loginUrl} className="underline underline-offset-4">
                                Login
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
