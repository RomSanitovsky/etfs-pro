"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StarField } from "@/components/StarField";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  // Track if this is the initial load vs an auth operation
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Once loading becomes false for the first time, initial load is complete
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    router.push("/");
  };

  // Only show full-page spinner during initial auth check, not during sign-in attempts
  if (!initialLoadComplete && loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10">
          <div className="w-8 h-8 border-2 border-subtle border-t-cosmic rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <StarField />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Back link */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8 group"
        >
          <span className="text-2xl font-black">
            <span className="hero-title">ETFs</span>
            <span className="hero-title-accent mx-1">PRO</span>
          </span>
        </Link>

        {/* Login card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted text-center text-sm mb-6">
            Sign in to track your investments
          </p>

          {/* Google Sign In */}
          <GoogleSignInButton onSuccess={handleSuccess} />

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-[var(--theme-card-border)]" />
            <span className="px-4 text-sm text-subtle">or</span>
            <div className="flex-1 h-px bg-[var(--theme-card-border)]" />
          </div>

          {/* Email/Password Form */}
          <LoginForm onSuccess={handleSuccess} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-subtle mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
