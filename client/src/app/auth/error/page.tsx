"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  useEffect(() => {
    const error = searchParams?.get("error");
    
    // Map error codes to user-friendly messages
    if (error === "Configuration") {
      setErrorMessage("There is a problem with the server configuration. Please contact support.");
    } else if (error === "AccessDenied") {
      setErrorMessage("You do not have access to this resource. You might need to sign in with a different account.");
    } else if (error === "Verification") {
      setErrorMessage("The verification link may have expired or already been used. Please request a new one.");
    } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount") {
      setErrorMessage("There was a problem with the GitHub sign-in process. Please try again or use email sign-in instead.");
    } else if (error === "EmailCreateAccount" || error === "Callback" || error === "OAuthAccountNotLinked") {
      setErrorMessage("There was an issue with your account. This email might be registered with a different sign-in method.");
    } else if (error === "CredentialsSignin") {
      setErrorMessage("The email or password you entered is incorrect. Please try again.");
    } else if (error === "SessionRequired") {
      setErrorMessage("You must be signed in to access this page. Please sign in and try again.");
    } else {
      setErrorMessage("An unexpected error occurred during authentication. Please try again.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border shadow-lg rounded-lg p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Authentication Error</h2>
          
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-center">
            <p className="text-red-500">{errorMessage}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Link
              href="/auth/signin"
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground text-center rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Sign In
            </Link>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 px-4 bg-background border border-border text-center rounded-md hover:bg-accent/20 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}