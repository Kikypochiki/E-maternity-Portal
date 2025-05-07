"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/auth_admin/login"
  }

  const handleSignup = () => {
    window.location.href = "/auth_admin/signup"
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
            <div className="relative h-full w-full overflow-hidden">
            <Image src="/phone.png" alt="Background" fill priority className="object-cover object-top" />
            {/* Gradient overlay to hide bottom cut and improve text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/30 to-white" />
            </div>
        </div>

        {/* Content over the background image */}
        <div className="relative z-10">
          {/* Header */}
          <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-2xl font-bold text-gray-900">E-Maternity Portal</div>
          </header>

          {/* Hero Content */}
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="max-w-xl">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Your Complete <span className="text-primary">Maternity</span> Healthcare Solution
              </h1>
              <p className="mt-6 text-lg text-gray-800">
                Securely manage patient records, schedule appointments, and access medical information all in one
                comprehensive platform designed for modern healthcare.
              </p>
              <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <Button
                  onClick={handleLogin}
                  variant="default"
                  className="rounded-md bg-primary px-8 py-2 text-base shadow-sm"
                >
                  Log In
                </Button>
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  className="rounded-md border-gray-700 bg-white/70 px-8 py-2 text-base text-gray-800 backdrop-blur-sm hover:bg-white"
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Separate from background image */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  Patient Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p className="mb-4">
                  Designed for expectant mothers and patients to easily access their healthcare information.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Access medical records securely</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>View and manage appointments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Receive important notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Download Laboratory Results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  Admin Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p className="mb-4">
                  Powerful tools for healthcare administrators to manage the entire system efficiently.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Comprehensive patient management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Complete patient admission feature</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Analytics and reporting tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  Secure Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                <p className="mb-4">Built with security and privacy in mind to protect sensitive healthcare data.</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>End-to-end encryption</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>HIPAA compliant infrastructure</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-4 w-4 text-primary" />
                    <span>Regular security audits</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">© 2025 E-Maternity Portal. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-6">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return <LandingPage />
}
