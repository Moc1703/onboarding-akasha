"use client";

import { useState, useCallback, type FormEvent } from "react";
import { ShieldCheck, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import type { InternPublic, InternCredential } from "@/data/interns";

interface AccessGateProps {
  intern: InternPublic;
  onUnlocked: (credentials: InternCredential[]) => void;
}

export default function AccessGate({ intern, onUnlocked }: AccessGateProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 5;
  const locked = attempts >= MAX_ATTEMPTS;

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (locked || loading) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ internId: intern.id, accessKey: key.trim() }),
        });

        const data = await res.json();

        if (res.ok && data.success && Array.isArray(data.credentials) && data.credentials.length > 0) {
          sessionStorage.setItem(`onboard_${intern.id}`, "unlocked");
          sessionStorage.setItem(`creds_${intern.id}`, JSON.stringify(data.credentials));
          onUnlocked(data.credentials);
        } else if (res.status === 503) {
          setError(
            data.message ||
              "Credentials are not available yet. Please contact HR or try again later."
          );
        } else if (res.ok && data.success && (!Array.isArray(data.credentials) || data.credentials.length === 0)) {
          setError("Credentials are not configured on the server. Please contact HR.");
        } else if (res.status === 401) {
          setAttempts((a) => a + 1);
          setError("Invalid access key.");
          setKey("");
        } else if (res.status === 403) {
          setError("Access has expired.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [key, intern, onUnlocked, locked, loading]
  );

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-gold" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Access</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Enter the access key provided by HR to unlock your onboarding dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessKey" className="block text-xs text-white/40 uppercase tracking-widest font-medium mb-2">
              Access Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                id="accessKey"
                type="text"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                disabled={locked || loading}
                placeholder="e.g. AYA-XXXX-2026"
                autoComplete="off"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-charcoal-light text-white placeholder:text-white/20 text-sm font-mono transition-colors outline-none ${
                  error
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/[0.08] focus:border-gold/50"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              />
            </div>

            {error && !locked && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {error} {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? "s" : ""} remaining.
              </p>
            )}

            {locked && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Too many failed attempts. Please contact HR.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!key.trim() || locked || loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Unlock Dashboard"
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Akasha Yoga Academy
        </p>
      </div>
    </div>
  );
}
