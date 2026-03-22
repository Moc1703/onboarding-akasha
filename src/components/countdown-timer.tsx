"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldAlert } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    total: diff,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calcTimeLeft(expiresAt));

    const interval = setInterval(() => {
      const t = calcTimeLeft(expiresAt);
      setTime(t);
      if (t.total <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (time === null) return null;

  const isUrgent = time.total > 0 && time.days < 1;

  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-sm font-medium transition-colors ${
        isUrgent
          ? "border-red-500/40 bg-red-500/10 text-red-400"
          : "border-gold/20 bg-gold/5 text-white/70"
      }`}
    >
      {isUrgent ? <ShieldAlert className="w-4 h-4" /> : <Clock className="w-4 h-4 text-gold/60" />}

      <span className="text-white/40 text-xs uppercase tracking-wider">Access expires in</span>

      <div className="flex items-center gap-1 font-mono tabular-nums">
        {time.days > 0 && (
          <>
            <span className="text-white font-semibold">{time.days}</span>
            <span className="text-white/30 text-xs mr-1">d</span>
          </>
        )}
        <span className="text-white font-semibold">{pad(time.hours)}</span>
        <span className="text-white/30">:</span>
        <span className="text-white font-semibold">{pad(time.minutes)}</span>
        <span className="text-white/30">:</span>
        <span className="text-white font-semibold">{pad(time.seconds)}</span>
      </div>
    </div>
  );
}
