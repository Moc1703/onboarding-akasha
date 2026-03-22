"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Download,
  FileText,
  KeyRound,
  LayoutGrid,
  CheckCircle2,
  Circle,
  CalendarDays,
  Building2,
  Sparkles,
  ClipboardCheck,
  Lock,
} from "lucide-react";
import type { InternProfile } from "@/data/interns";
import CountdownTimer from "./countdown-timer";
import ExpiredPage from "./expired-page";
import AccessGate from "./access-gate";

const preReadingMaterials = [
  {
    title: "Company Profile",
    description: "Learn about Akasha Yoga Academy's mission, values, and culture.",
    icon: Building2,
    href: "#",
  },
  {
    title: "SOP & Workflow Guide",
    description: "Understand our standard operating procedures and daily workflows.",
    icon: ClipboardList,
    href: "#",
  },
  {
    title: "Tools Access Guide",
    description: "Get familiar with the tools and platforms we use every day.",
    icon: LayoutGrid,
    href: "#",
  },
];

const checklist = [
  "Read all pre-reading materials",
  "Set up your Google Workspace account",
  "Join the Slack #pa-department channel",
  "Review the PA Department SOP",
  "Introduce yourself in #general",
  "Confirm your schedule with your supervisor",
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight text-white mb-6 flex items-center gap-3">
      <span className="h-px flex-1 max-w-8 bg-gold/60" />
      {children}
    </h2>
  );
}

function GoldDivider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent my-16" />;
}

export default function OnboardingDashboard({ intern }: { intern: InternProfile }) {
  const [expired, setExpired] = useState(
    () => new Date(intern.accessExpires).getTime() <= Date.now()
  );
  const [unlocked, setUnlocked] = useState(false);
  const [sopRead, setSopRead] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`onboard_${intern.id}`);
    if (stored === "unlocked") setUnlocked(true);
    const sop = sessionStorage.getItem(`sop_read_${intern.id}`);
    if (sop === "true") setSopRead(true);
    setHydrated(true);
  }, [intern.id]);

  const handleSopRead = useCallback(() => {
    sessionStorage.setItem(`sop_read_${intern.id}`, "true");
    setSopRead(true);
  }, [intern.id]);

  const handleExpired = useCallback(() => setExpired(true), []);
  const handleUnlocked = useCallback(() => setUnlocked(true), []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (expired) {
    return <ExpiredPage name={intern.name} />;
  }

  if (!unlocked) {
    return <AccessGate intern={intern} onUnlocked={handleUnlocked} />;
  }

  return (
    <div className="min-h-screen bg-charcoal">
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-20">
        {/* ── Hero Header ── */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            {intern.department}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Welcome to the Team!
          </h1>

          <p className="text-xl sm:text-2xl text-gold font-light mb-6">
            {intern.name}
          </p>

          <div className="inline-flex items-center gap-2 text-white/50 text-sm mb-8">
            <CalendarDays className="w-4 h-4" />
            <span>Start Date: {intern.startDate}</span>
          </div>

          <div className="flex justify-center">
            <CountdownTimer expiresAt={intern.accessExpires} onExpired={handleExpired} />
          </div>
        </header>

        {/* ── Pre-reading Materials ── */}
        <section>
          <SectionHeading>Pre-reading Materials</SectionHeading>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {preReadingMaterials.map((item) => (
              <article
                key={item.title}
                className="group relative rounded-2xl border border-white/[0.06] bg-charcoal-light p-6 transition-all duration-300 hover:border-gold/30 hover:bg-charcoal-lighter"
              >
                <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold">
                  <item.icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-5">{item.description}</p>

                <a
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <GoldDivider />

        {/* ── Department Specific SOP ── */}
        <section>
          <SectionHeading>Department Specific SOP</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gold/10 text-gold shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{intern.department} SOP</h3>
                  <p className="text-sm text-white/50">
                    Standard Operating Procedures specific to the {intern.department}. Please review thoroughly before your first day.
                  </p>
                </div>
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                Download SOP
              </a>
            </div>

            {!sopRead ? (
              <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-white/40">
                  After reading the SOP, confirm below to unlock the onboarding quiz.
                </p>
                <button
                  onClick={handleSopRead}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gold/30 bg-gold/10 text-gold font-semibold text-sm hover:bg-gold/20 transition-colors shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  I have read the SOP
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                SOP marked as read — Quiz unlocked
              </div>
            )}
          </div>
        </section>

        <GoldDivider />

        {/* ── Credentials & Access ── */}
        <section>
          <SectionHeading>Credentials &amp; Access</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-medium">
              <KeyRound className="w-4 h-4 text-gold/60" />
              Secure Credentials
            </div>

            <div className="hidden sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-white/40 text-xs uppercase tracking-widest">
                    <th className="px-6 py-3 font-medium">Tool</th>
                    <th className="px-6 py-3 font-medium">Username</th>
                    <th className="px-6 py-3 font-medium">Temporary Password</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.credentials.map((cred, i) => (
                    <tr
                      key={cred.tool}
                      className={`${i !== intern.credentials.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}
                    >
                      <td className="px-6 py-4 text-white font-medium">{cred.tool}</td>
                      <td className="px-6 py-4 text-white/60 font-mono text-sm">{cred.username}</td>
                      <td className="px-6 py-4 text-white/60 font-mono text-sm">{cred.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y divide-white/[0.04]">
              {intern.credentials.map((cred) => (
                <div key={cred.tool} className="px-6 py-4 space-y-2">
                  <p className="text-white font-medium">{cred.tool}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Username</span>
                    <span className="text-white/60 font-mono">{cred.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Password</span>
                    <span className="text-white/60 font-mono">{cred.password}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-white/30 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3" />
            Please change all temporary passwords upon first login.
          </p>
        </section>

        <GoldDivider />

        {/* ── Next Steps Checklist ── */}
        <section>
          <SectionHeading>Next Steps — First Day Checklist</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-6 sm:p-8">
            <ul className="space-y-4">
              {checklist.map((label, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Circle className="w-5 h-5 text-white/20 mt-0.5 shrink-0" />
                  <span className="text-sm leading-relaxed text-white/80">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <GoldDivider />

        {/* ── Onboarding Quiz (Tally.so) ── */}
        <section>
          <SectionHeading>Onboarding Quiz</SectionHeading>

          {sopRead ? (
            <>
              <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-medium">
                  <ClipboardCheck className="w-4 h-4 text-gold/60" />
                  Complete before your first day
                </div>

                <div className="w-full">
                  <iframe
                    src={intern.quizUrl}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    title="Onboarding Quiz"
                    className="w-full bg-white rounded-b-2xl"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-white/30 flex items-center gap-1.5">
                <ClipboardCheck className="w-3 h-3" />
                Please complete the quiz to confirm you have read all onboarding materials.
              </p>
            </>
          ) : (
            <div className="relative rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
              <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/50 text-sm font-medium">Read the SOP first to unlock the quiz</p>
                <p className="text-white/25 text-xs">Scroll up to the SOP section and confirm you have read it</p>
              </div>

              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-medium">
                <ClipboardCheck className="w-4 h-4 text-gold/60" />
                Complete before your first day
              </div>
              <div className="w-full h-[300px] bg-charcoal-lighter" />
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="mt-20 text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-8" />
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Akasha Yoga Academy. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
