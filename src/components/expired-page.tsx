"use client";

import { ShieldX, Mail } from "lucide-react";

export default function ExpiredPage({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldX className="w-9 h-9 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Access Expired</h1>

        <p className="text-white/50 mb-2 text-lg">{name}</p>

        <p className="text-white/40 text-sm leading-relaxed mb-10">
          Your onboarding page access period has ended. If you still need access to
          any materials or credentials, please contact your supervisor or the HR team.
        </p>

        <a
          href="mailto:hr@akashayoga.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors"
        >
          <Mail className="w-4 h-4" />
          Contact HR
        </a>

        <p className="mt-12 text-xs text-white/20">
          &copy; {new Date().getFullYear()} Akasha Yoga Academy
        </p>
      </div>
    </div>
  );
}
