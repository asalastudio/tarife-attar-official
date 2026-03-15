"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-alabaster flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif italic text-3xl tracking-tight text-theme-charcoal mb-2">
            Tarife Attär
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-theme-gold">
            Operations Hub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="secret"
              className="block font-mono text-[10px] uppercase tracking-widest text-theme-charcoal/60 mb-2"
            >
              Admin Secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-theme-charcoal/10 font-mono text-sm focus:outline-none focus:border-theme-gold transition-colors"
              placeholder="Enter admin secret"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-theme-charcoal text-theme-alabaster font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-theme-obsidian transition-colors disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Enter Operations Hub"}
          </button>
        </form>
      </div>
    </div>
  );
}
