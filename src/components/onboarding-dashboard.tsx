"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  FileText,
  KeyRound,
  Building2,
  Sparkles,
  ClipboardCheck,
  Lock,
  Calendar,
  Check,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  ListChecks,
  ChevronRight,
  ShieldAlert,
  Eye,
} from "lucide-react";
import type { InternPublic, InternCredential } from "@/data/interns";
import CountdownTimer from "./countdown-timer";
import ExpiredPage from "./expired-page";
import AccessGate from "./access-gate";
import SopReader from "./sop-reader";

/* ───────── Static Data ───────── */

const COMPANY_PROFILE = {
  title: "Company Profile",
  description:
    "Learn about Akasha Yoga Academy — our mission, values, yoga lineage, and the team you'll be working with.",
  href: "https://www.akashayogaacademy.com/about",
};

const checklistItems = [
  "Read all pre-reading materials",
  "Read the full Department SOP",
  "Set up your Google Workspace account",
  "Join the Slack department channel",
  "Introduce yourself in #general",
  "Complete the Onboarding Quiz",
  "Confirm your schedule with your supervisor",
];

const schedule = {
  week1: {
    label: "Week 1 — Orientation",
    tasks: [
      { task: "Company Introduction", due: "Tuesday 24 March", desc: "Learn about the company profile, vision, mission, and team structure." },
      { task: "Tools Training", due: "Wednesday 25 March", desc: "Get familiar with the main tools: Asana, Google Workspace." },
      { task: "Workflow Overview", due: "Thursday 26 March", desc: "Understand the daily workflow and department SOPs." },
      { task: "Task Management Basics", due: "Friday 27 March", desc: "Practice creating and managing tasks in Asana." },
      { task: "Department Introduction", due: "Saturday 28 March", desc: "Get to know the team and the scope of work in your department." },
    ],
  },
  week2: {
    label: "Week 2 — Practice",
    tasks: [
      { task: "Department Deep Dive", due: "Tuesday 31 March", desc: "Dive deeper into department-specific workflows and tools." },
      { task: "Sample Tasks", due: "Thursday 2 April", desc: "Complete real sample tasks under the guidance of your supervisor." },
      { task: "Practice Exercises", due: "Saturday 4 April", desc: "Work independently on tasks assigned by your supervisor." },
      { task: "Final Week 2 Review", due: "Monday 6 April", desc: "Review your progress with your supervisor. Two-way feedback session." },
    ],
  },
};

const ROADMAP_STEPS = [
  { id: "prereading", label: "Pre-reading", icon: BookOpen },
  { id: "sop", label: "Read SOP", icon: FileText },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "credentials", label: "Credentials", icon: ShieldCheck },
  { id: "checklist", label: "Checklist", icon: ListChecks },
  { id: "quiz", label: "Quiz", icon: ClipboardCheck },
] as const;

/* ───────── Sub-components ───────── */

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight text-white mb-8 flex items-center gap-3 scroll-mt-20">
      <span className="h-px w-8 bg-gradient-to-r from-gold/80 to-gold/20 shrink-0" />
      {children}
    </h2>
  );
}

function GoldDivider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-12 sm:my-14" />;
}

function ScheduleTable({ title, tasks }: { title: string; tasks: typeof schedule.week1.tasks }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs uppercase tracking-[0.2em] text-gold/70 font-semibold mb-4">{title}</h3>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1.2fr_0.8fr_2fr] bg-charcoal-lighter/50">
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Task</div>
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Due Date</div>
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/35 font-medium">Description</div>
        </div>
        {tasks.map((row, i) => (
          <div
            key={row.task}
            className={`sm:grid sm:grid-cols-[1.2fr_0.8fr_2fr] px-5 py-4 ${i !== tasks.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
          >
            <div className="font-medium text-white text-sm mb-1 sm:mb-0">{row.task}</div>
            <div className="text-gold/70 text-sm mb-2 sm:mb-0">{row.due}</div>
            <div className="text-white/50 text-sm leading-relaxed">{row.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Roadmap / Step Progress ───────── */

function Roadmap({ sopRead, activeSection }: { sopRead: boolean; activeSection: string }) {
  const getStepStatus = (id: string) => {
    const order: string[] = ROADMAP_STEPS.map((s) => s.id);
    const activeIdx = order.indexOf(activeSection);
    const stepIdx = order.indexOf(id);

    if (id === "quiz" && !sopRead) return "locked";
    if (stepIdx < activeIdx) return "done";
    if (stepIdx === activeIdx) return "active";
    return "upcoming";
  };

  return (
    <nav className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-1 py-3 overflow-x-auto no-scrollbar">
          {ROADMAP_STEPS.map((step, i) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center shrink-0">
                {i > 0 && (
                  <ChevronRight className={`w-3.5 h-3.5 mx-1 ${status === "done" ? "text-gold/50" : "text-white/10"}`} />
                )}
                <a
                  href={`#${step.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    status === "active"
                      ? "bg-gold/15 text-gold border border-gold/25"
                      : status === "done"
                        ? "text-gold/60 hover:bg-white/[0.03]"
                        : status === "locked"
                          ? "text-white/20 cursor-not-allowed"
                          : "text-white/40 hover:bg-white/[0.03] hover:text-white/60"
                  }`}
                  onClick={(e) => {
                    if (status === "locked") e.preventDefault();
                  }}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    status === "done"
                      ? "bg-gold/20"
                      : status === "active"
                        ? "bg-gold/25"
                        : "bg-white/[0.04]"
                  }`}>
                    {status === "done" ? (
                      <Check className="w-3 h-3 text-gold" strokeWidth={3} />
                    ) : status === "locked" ? (
                      <Lock className="w-2.5 h-2.5 text-white/20" />
                    ) : (
                      <Icon className="w-2.5 h-2.5" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{step.label}</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/* ───────── Main Dashboard ───────── */

export default function OnboardingDashboard({ intern }: { intern: InternPublic }) {
  const [expired, setExpired] = useState(
    () => new Date(intern.accessExpires).getTime() <= Date.now()
  );
  const [unlocked, setUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<InternCredential[] | null>(null);
  const [sopRead, setSopRead] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => checklistItems.map(() => false));
  const [activeSection, setActiveSection] = useState<string>("prereading");
  const [credentialsRevealed, setCredentialsRevealed] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`onboard_${intern.id}`);
    if (stored === "unlocked") {
      const savedCreds = sessionStorage.getItem(`creds_${intern.id}`);
      let parsed: InternCredential[] | null = null;
      if (savedCreds) {
        try { parsed = JSON.parse(savedCreds); } catch { /* ignore */ }
      }

      if (parsed && parsed.length > 0) {
        setUnlocked(true);
        setCredentials(parsed);
      } else {
        sessionStorage.removeItem(`onboard_${intern.id}`);
        sessionStorage.removeItem(`creds_${intern.id}`);
        sessionStorage.removeItem(`creds_revealed_${intern.id}`);
      }
    }

    const sop = sessionStorage.getItem(`sop_read_${intern.id}`);
    if (sop === "true") setSopRead(true);

    const savedChecks = sessionStorage.getItem(`checklist_${intern.id}`);
    if (savedChecks) {
      try { setChecked(JSON.parse(savedChecks)); } catch { /* ignore */ }
    }

    const revealed = sessionStorage.getItem(`creds_revealed_${intern.id}`);
    if (revealed === "true") setCredentialsRevealed(true);

    setHydrated(true);
  }, [intern.id]);

  // Track which section is in view
  useEffect(() => {
    const ids = ROADMAP_STEPS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleExpired = useCallback(() => setExpired(true), []);
  const handleUnlocked = useCallback((creds: InternCredential[]) => {
    setUnlocked(true);
    setCredentials(creds);
  }, []);

  const handleSopRead = useCallback(() => {
    sessionStorage.setItem(`sop_read_${intern.id}`, "true");
    setSopRead(true);
  }, [intern.id]);

  const toggleCheck = useCallback((index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      sessionStorage.setItem(`checklist_${intern.id}`, JSON.stringify(next));
      return next;
    });
  }, [intern.id]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (expired) return <ExpiredPage name={intern.name} />;
  if (!unlocked) return <AccessGate intern={intern} onUnlocked={handleUnlocked} />;

  const completedCount = checked.filter(Boolean).length;
  const progressPct = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="min-h-screen bg-charcoal" ref={mainRef}>
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

      {/* Sticky roadmap navigation */}
      <Roadmap sopRead={sopRead} activeSection={activeSection} />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

        {/* ── Hero Header ── */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {intern.department}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
            Welcome to the Team!
          </h1>

          <p className="text-xl sm:text-2xl text-gold font-light mb-5">
            {intern.name}
          </p>

          <div className="inline-flex items-center gap-2 text-white/50 text-sm mb-8">
            <CalendarDays className="w-4 h-4" />
            <span>Start Date: {intern.startDate}</span>
          </div>

          <div className="flex justify-center mb-8">
            <CountdownTimer expiresAt={intern.accessExpires} onExpired={handleExpired} />
          </div>

          {/* Quick guide callout */}
          <div className="max-w-xl mx-auto rounded-2xl border border-gold/15 bg-gold/[0.04] p-5 text-left">
            <p className="text-sm font-semibold text-gold mb-2">Your Onboarding Roadmap</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Follow each step in order: start with the pre-reading materials, read the full SOP,
              review your schedule &amp; credentials, complete the checklist, then take the quiz.
              Use the navigation bar above to jump between sections.
            </p>
          </div>
        </header>

        {/* ══════ STEP 1: Pre-reading ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">1</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Step 1</span>
          </div>
          <SectionHeading id="prereading">Pre-reading</SectionHeading>
          <article className="group rounded-2xl border border-white/[0.06] bg-charcoal-light p-6 sm:p-8 transition-all duration-300 hover:border-gold/20 hover:shadow-[0_0_30px_-10px_rgba(184,145,70,0.1)]">
            <div className="flex items-start gap-5">
              <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 text-gold">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1.5">{COMPANY_PROFILE.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-5">{COMPANY_PROFILE.description}</p>
                <a
                  href={COMPANY_PROFILE.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-sm font-medium text-gold hover:bg-gold/20 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Read Company Profile
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
                </a>
              </div>
            </div>
          </article>
        </section>

        <GoldDivider />

        {/* ══════ STEP 2: SOP ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">2</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Step 2</span>
          </div>
          <SectionHeading id="sop">Department SOP</SectionHeading>
          <SopReader
            sopFile={intern.sopFile}
            department={intern.department}
            sopRead={sopRead}
            onConfirmRead={handleSopRead}
          />
        </section>

        <GoldDivider />

        {/* ══════ STEP 3: Schedule ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">3</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Step 3</span>
          </div>
          <SectionHeading id="schedule">Onboarding Schedule</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-5 sm:p-8">
            <div className="flex items-center gap-2 text-white/35 text-xs uppercase tracking-widest font-medium mb-6">
              <Calendar className="w-4 h-4 text-gold/50" />
              2-Week Program
            </div>
            <ScheduleTable title={schedule.week1.label} tasks={schedule.week1.tasks} />
            <ScheduleTable title={schedule.week2.label} tasks={schedule.week2.tasks} />
          </div>
        </section>

        <GoldDivider />

        {/* ══════ STEP 4: Credentials ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">4</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Step 4</span>
          </div>
          <SectionHeading id="credentials">Credentials &amp; Access</SectionHeading>

          {credentials && credentials.length > 0 ? (
            !credentialsRevealed ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 overflow-hidden">
                <div className="px-5 sm:px-6 py-5 flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold text-sm">Confidentiality Notice</h3>
                    <ul className="space-y-2 text-sm text-white/60 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        The credentials below are <strong className="text-white/80">strictly confidential</strong> and intended only for your use during the internship program.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <strong className="text-white/80">Do not</strong> share, screenshot, copy to personal devices, or distribute these credentials to anyone.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        Unauthorized sharing may result in <strong className="text-white/80">immediate termination</strong> of your internship and revocation of all access.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        If you suspect your credentials have been compromised, contact HR immediately.
                      </li>
                    </ul>
                    <button
                      onClick={() => {
                        setCredentialsRevealed(true);
                        sessionStorage.setItem(`creds_revealed_${intern.id}`, "true");
                      }}
                      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      I Understand — Reveal Credentials
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/35 text-xs uppercase tracking-widest font-medium">
                    <KeyRound className="w-4 h-4 text-gold/50" />
                    1Password Access
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {credentials.map((cred) => (
                      <div key={cred.label} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                        <span className="text-white/40 text-sm shrink-0">{cred.label}</span>
                        <span className="text-white font-mono text-sm break-all sm:text-right">{cred.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-xs text-white/35 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" />
                  Use these credentials to log in to 1Password. Change your master password after first login.
                </p>
              </>
            )
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-8 flex flex-col items-center justify-center gap-3 text-center">
              <Lock className="w-6 h-6 text-white/20" />
              <p className="text-sm text-white/40">Credentials could not be loaded. Please refresh or re-enter your access key.</p>
            </div>
          )}
        </section>

        <GoldDivider />

        {/* ══════ STEP 5: Checklist ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">5</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Step 5</span>
          </div>
          <SectionHeading id="checklist">First Day Checklist</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/35 uppercase tracking-widest font-medium">Progress</span>
                <span className="text-xs text-white/50 font-mono">{completedCount}/{checklistItems.length}</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <ul className="divide-y divide-white/[0.04]">
              {checklistItems.map((label, i) => (
                <li key={i}>
                  <button
                    onClick={() => toggleCheck(i)}
                    className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left hover:bg-white/[0.015] transition-colors cursor-pointer"
                  >
                    <div className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                      checked[i]
                        ? "bg-gold border-gold"
                        : "border-white/15 bg-transparent"
                    }`}>
                      {checked[i] && <Check className="w-3 h-3 text-charcoal" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      checked[i] ? "text-white/35 line-through" : "text-white/70"
                    }`}>
                      {label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <GoldDivider />

        {/* ══════ STEP 6: Quiz ══════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/15 text-gold text-xs font-bold">6</span>
            <span className="text-xs uppercase tracking-widest text-white/30 font-medium">Final Step</span>
          </div>
          <SectionHeading id="quiz">Onboarding Quiz</SectionHeading>

          {sopRead ? (
            <>
              <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/35 text-xs uppercase tracking-widest font-medium">
                  <ClipboardCheck className="w-4 h-4 text-gold/50" />
                  Complete before your first day
                </div>
                <div className="w-full">
                  <iframe
                    src={intern.quizUrl}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    title="Onboarding Quiz"
                    className="w-full bg-white"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-white/35 flex items-center gap-1.5">
                <ClipboardCheck className="w-3 h-3" />
                Complete the quiz to confirm you&apos;ve read all onboarding materials.
              </p>
            </>
          ) : (
            <div className="relative rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
              <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white/30" />
                </div>
                <p className="text-white/45 text-sm font-medium">Complete Step 2 to unlock the quiz</p>
                <p className="text-white/25 text-xs">Read the full Department SOP and confirm to continue</p>
              </div>
              <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/35 text-xs uppercase tracking-widest font-medium">
                <ClipboardCheck className="w-4 h-4 text-gold/50" />
                Complete before your first day
              </div>
              <div className="w-full h-[280px] bg-charcoal-lighter" />
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="mt-16 text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-8" />
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Akasha Yoga Academy. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
