"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName || undefined);
      } else {
        await signIn(email, password);
      }
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      // Clean up Firebase error messages
      if (message.includes("auth/invalid-credential")) {
        setError("Invalid email or password");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("Email is already registered");
      } else if (message.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters");
      } else if (message.includes("auth/invalid-email")) {
        setError("Invalid email address");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="space-input w-full pl-4"
            placeholder="Your name"
            disabled={isSubmitting}
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="space-input w-full pl-4"
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="space-input w-full pl-4"
          placeholder="Enter password"
          required
          minLength={6}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="space-button w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Please wait..."
          : isSignUp
          ? "Create Account"
          : "Sign In"}
      </button>

      <p className="text-center text-sm text-slate-400">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </form>
  );
}
