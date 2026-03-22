import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-8 w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-gold" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Akasha Yoga Academy
        </h1>

        <p className="text-white/40 text-sm mb-10">
          Intern Onboarding Portal
        </p>

        <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-8 text-left space-y-4">
          <h2 className="text-lg font-semibold text-white">How to access your dashboard</h2>
          <ol className="space-y-3 text-sm text-white/60 leading-relaxed">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">1</span>
              <span>Go to your personal URL shared by HR via email.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">2</span>
              <span>Enter the <strong className="text-white/80">access key</strong> provided in the same email.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">3</span>
              <span>Complete all onboarding steps before your access expires.</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-gold text-sm font-medium">
          <span>Don&apos;t have your link?</span>
          <a href="mailto:hr@akashayoga.com" className="underline underline-offset-4 hover:text-gold-light transition-colors inline-flex items-center gap-1">
            Contact HR <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="mt-16 text-xs text-white/20">
          &copy; {new Date().getFullYear()} Akasha Yoga Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
