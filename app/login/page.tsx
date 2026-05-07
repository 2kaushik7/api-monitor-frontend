"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup";
type Tab = "login" | "pricing";

export default function Login() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect already-authenticated users straight to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);


  const notifyBackend = async (token: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error("Backend login failed:", e);
    }
  };

  const registerWithBackend = async (email: string, name: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch (e) {
      console.error("Backend registration failed:", e);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      await notifyBackend(token);
      if (mode === "signup") {
        await registerWithBackend(email, result.user.displayName ?? "");
      }
      router.push("/dashboard");
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await notifyBackend(token);
      router.push("/dashboard");
    } catch (e: unknown) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          API<span className="text-blue-400">Monitor</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Real-time uptime monitoring for your APIs</p>
      </div>

      {/* Top-level tab bar */}
      <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-8 border border-white/10">
        <button
          onClick={() => setTab("login")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "login"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setTab("pricing")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "pricing"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Pricing
        </button>
      </div>

      {/* â”€â”€ LOGIN PANEL â”€â”€ */}
      {tab === "login" && (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          {/* Mode tabs */}
          <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            />
          </div>

          {mode === "signup" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              />
            </div>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded w-full mb-4 transition-colors"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      )}

      {/* â”€â”€ PRICING PANEL â”€â”€ */}
      {tab === "pricing" && (
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="text-slate-400 mt-2">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Free</span>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-white">£0</span>
                  <span className="text-slate-400 mb-1.5">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Perfect for trying it out</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "1 API endpoint",
                  "5-minute check interval",
                  "Email alerts",
                  "1 month free",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setTab("login")}
                className="w-full py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Get started free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 flex flex-col shadow-2xl shadow-blue-900/50 border border-blue-500/50">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">Pro</span>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-extrabold text-white">£5</span>
                  <span className="text-blue-200 mb-1.5">/month</span>
                </div>
                <p className="text-blue-200 text-sm mt-2">For teams & growing projects</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "10 API endpoints",
                  "1-minute check interval",
                  "Email & instant alerts",
                  "Uptime history & reports",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setTab("login")}
                className="w-full py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition-colors shadow"
              >
                Get started
              </button>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-8">
            No credit card required for the free plan Â· Cancel anytime
          </p>
        </div>
      )}
    </div>
  );
}

