"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeSelector } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage(
        "Account created! If email confirmation is on, check your inbox. Otherwise you can log in now.",
      );
      setMode("login");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-base-200">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-secondary/30 blur-3xl" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex justify-end p-4">
          <ThemeSelector />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 space-y-3">
              <p className="badge badge-primary badge-outline">Live music money sense</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">
                Concert Cost Tracker
              </h1>
              <p className="text-base-content/80 text-lg">
                Log every show. See what you spent. Find which nights were worth
                every dollar.
              </p>
            </div>

            <div className="card bg-base-100/95 shadow-2xl backdrop-blur">
              <div className="card-body gap-5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm flex-1 ${mode === "login" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-1 ${mode === "signup" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-[7.5rem_1fr] items-center gap-x-3 gap-y-4">
                    <label htmlFor="email" className="text-sm font-medium text-right">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="input input-bordered w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-right"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      className="input input-bordered w-full"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  {error && (
                    <div className="alert alert-error text-sm">
                      <span>{error}</span>
                    </div>
                  )}
                  {message && (
                    <div className="alert alert-success text-sm">
                      <span>{message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Log in"
                        : "Create account"}
                  </button>
                </form>

                <p className="text-xs text-center opacity-70">
                  Your concerts stay private to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
