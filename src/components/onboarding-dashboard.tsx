"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  FileText,
  KeyRound,
  LayoutGrid,
  CheckCircle2,
  CalendarDays,
  Building2,
  Sparkles,
  ClipboardCheck,
  Lock,
  Calendar,
  Check,
} from "lucide-react";
import type { InternProfile } from "@/data/interns";
import CountdownTimer from "./countdown-timer";
import ExpiredPage from "./expired-page";
import AccessGate from "./access-gate";
import SopReader from "./sop-reader";

const preReadingMaterials = [
  {
    title: "Company Profile",
    description: "Mission, values, culture, and team structure of Akasha Yoga Academy.",
    icon: Building2,
    href: "#",
  },
  {
    title: "SOP & Workflow Guide",
    description: "Standard operating procedures and daily workflows for your department.",
    icon: ClipboardList,
    href: "#",
  },
  {
    title: "Tools Access Guide",
    description: "Overview of tools and platforms: Asana, Google Workspace, Slack, and more.",
    icon: LayoutGrid,
    href: "#",
  },
];

const checklistItems = [
  "Read all pre-reading materials",
  "Download and review the Department SOP",
  "Set up your Google Workspace account",
  "Join the Slack #pa-department channel",
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight text-white mb-8 flex items-center gap-3">
      <span className="h-px w-8 bg-gradient-to-r from-gold/80 to-gold/20 shrink-0" />
      {children}
    </h2>
  );
}

function GoldDivider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent my-14 sm:my-16" />;
}

function ScheduleTable({ title, tasks }: { title: string; tasks: typeof schedule.week1.tasks }) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-xs uppercase tracking-[0.2em] text-gold/70 font-semibold mb-4">{title}</h3>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1.2fr_0.8fr_2fr] bg-charcoal-lighter/50">
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-medium">Task</div>
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-medium">Due Date</div>
          <div className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-medium">Description</div>
        </div>
        {tasks.map((row, i) => (
          <div
            key={row.task}
            className={`sm:grid sm:grid-cols-[1.2fr_0.8fr_2fr] px-5 py-4 ${i !== tasks.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
          >
            <div className="font-medium text-white text-sm mb-1 sm:mb-0">{row.task}</div>
            <div className="text-gold/70 text-sm mb-2 sm:mb-0 font-mono text-xs sm:text-sm sm:font-sans">{row.due}</div>
            <div className="text-white/45 text-sm leading-relaxed">{row.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingDashboard({ intern }: { intern: InternProfile }) {
  const [expired, setExpired] = useState(
    () => new Date(intern.accessExpires).getTime() <= Date.now()
  );
  const [unlocked, setUnlocked] = useState(false);
  const [sopRead, setSopRead] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => checklistItems.map(() => false));

  useEffect(() => {
    const stored = sessionStorage.getItem(`onboard_${intern.id}`);
    if (stored === "unlocked") setUnlocked(true);

    const sop = sessionStorage.getItem(`sop_read_${intern.id}`);
    if (sop === "true") setSopRead(true);

    const savedChecks = sessionStorage.getItem(`checklist_${intern.id}`);
    if (savedChecks) {
      try { setChecked(JSON.parse(savedChecks)); } catch { /* ignore */ }
    }

    setHydrated(true);
  }, [intern.id]);

  const handleExpired = useCallback(() => setExpired(true), []);
  const handleUnlocked = useCallback(() => setUnlocked(true), []);

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
    <div className="min-h-screen bg-charcoal">
      <div className="h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-20">

        {/* ── Hero Header ── */}
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {intern.department}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Welcome to the Team!
          </h1>

          <p className="text-xl sm:text-2xl text-gold font-light mb-6">
            {intern.name}
          </p>

          <div className="inline-flex items-center gap-2 text-white/40 text-sm mb-10">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preReadingMaterials.map((item) => (
              <article
                key={item.title}
                className="group rounded-2xl border border-white/[0.06] bg-charcoal-light p-6 transition-all duration-300 hover:border-gold/20 hover:shadow-[0_0_30px_-10px_rgba(184,145,70,0.1)]"
              >
                <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 text-gold">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5">{item.description}</p>
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Document
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">&rarr;</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <GoldDivider />

        {/* ── Department SOP Reader ── */}
        <section>
          <SectionHeading>Department SOP</SectionHeading>
          <SopReader
            sopFile={intern.sopFile}
            department={intern.department}
            sopRead={sopRead}
            onConfirmRead={handleSopRead}
          />
        </section>

        <GoldDivider />

        {/* ── Onboarding Schedule ── */}
        <section>
          <SectionHeading>Onboarding Schedule</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-5 sm:p-8">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest font-medium mb-6">
              <Calendar className="w-4 h-4 text-gold/50" />
              2-Week Program
            </div>
            <ScheduleTable title={schedule.week1.label} tasks={schedule.week1.tasks} />
            <ScheduleTable title={schedule.week2.label} tasks={schedule.week2.tasks} />
          </div>
        </section>

        <GoldDivider />

        {/* ── Credentials & Access ── */}
        <section>
          <SectionHeading>Credentials &amp; Access</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest font-medium">
              <KeyRound className="w-4 h-4 text-gold/50" />
              Secure Credentials
            </div>

            {/* Desktop */}
            <div className="hidden sm:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-white/30 text-xs uppercase tracking-widest">
                    <th className="px-6 py-3 font-medium">Tool</th>
                    <th className="px-6 py-3 font-medium">Username</th>
                    <th className="px-6 py-3 font-medium">Temporary Password</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.credentials.map((cred, i) => (
                    <tr
                      key={cred.tool}
                      className={`${i !== intern.credentials.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.015] transition-colors`}
                    >
                      <td className="px-6 py-4 text-white font-medium text-sm">{cred.tool}</td>
                      <td className="px-6 py-4 text-white/50 font-mono text-sm">{cred.username}</td>
                      <td className="px-6 py-4 text-white/50 font-mono text-sm">{cred.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-white/[0.04]">
              {intern.credentials.map((cred) => (
                <div key={cred.tool} className="px-5 py-4 space-y-2">
                  <p className="text-white font-medium text-sm">{cred.tool}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/30">Username</span>
                    <span className="text-white/50 font-mono text-xs">{cred.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/30">Password</span>
                    <span className="text-white/50 font-mono text-xs">{cred.password}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-white/25 flex items-center gap-1.5">
            <KeyRound className="w-3 h-3" />
            Change all temporary passwords upon first login.
          </p>
        </section>

        <GoldDivider />

        {/* ── Interactive Checklist ── */}
        <section>
          <SectionHeading>First Day Checklist</SectionHeading>

          <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
            {/* Progress bar */}
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Progress</span>
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
                      checked[i] ? "text-white/30 line-through" : "text-white/70"
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

        {/* ── Onboarding Quiz (Tally.so) ── */}
        <section>
          <SectionHeading>Onboarding Quiz</SectionHeading>

          {sopRead ? (
            <>
              <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest font-medium">
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
              <p className="mt-3 text-xs text-white/25 flex items-center gap-1.5">
                <ClipboardCheck className="w-3 h-3" />
                Complete the quiz to confirm you&apos;ve read all onboarding materials.
              </p>
            </>
          ) : (
            <div className="relative rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
              <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white/25" />
                </div>
                <p className="text-white/40 text-sm font-medium">Read the SOP first to unlock the quiz</p>
                <p className="text-white/20 text-xs">Scroll up and confirm you&apos;ve read the Department SOP</p>
              </div>
              <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest font-medium">
                <ClipboardCheck className="w-4 h-4 text-gold/50" />
                Complete before your first day
              </div>
              <div className="w-full h-[280px] bg-charcoal-lighter" />
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="mt-20 text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-8" />
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Akasha Yoga Academy. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
