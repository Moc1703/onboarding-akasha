"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import mammoth from "mammoth";

interface SopReaderProps {
  sopFile: string;
  department: string;
  sopRead: boolean;
  onConfirmRead: () => void;
}

export default function SopReader({ sopFile, department, sopRead, onConfirmRead }: SopReaderProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDoc() {
      try {
        const res = await fetch(sopFile);
        if (!res.ok) throw new Error("Failed to fetch");
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) {
          setHtml(result.value);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadDoc();
    return () => { cancelled = true; };
  }, [sopFile]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setScrollPct(100);
      setReachedEnd(true);
      return;
    }

    const pct = Math.round((scrollTop / maxScroll) * 100);
    setScrollPct(pct);

    if (pct >= 95) setReachedEnd(true);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
        <p className="text-sm text-white/40">Loading SOP document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light p-8">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Could not load document</h3>
            <p className="text-sm text-white/40 mb-4">Try downloading the SOP directly instead.</p>
            <a
              href={sopFile}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors"
            >
              <Download className="w-4 h-4" />
              Download SOP
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-charcoal-light overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold/50" />
          <span className="text-xs text-white/30 uppercase tracking-widest font-medium">
            {department} SOP
          </span>
        </div>

        {(sopRead || reachedEnd) && (
          <a
            href={sopFile}
            download
            className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        )}
      </div>

      {/* Reading progress bar */}
      <div className="px-5 sm:px-6 py-3 border-b border-white/[0.06] bg-charcoal-lighter/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/30">Reading Progress</span>
          <span className="text-xs font-mono text-white/40">{sopRead ? 100 : scrollPct}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              sopRead || reachedEnd
                ? "bg-emerald-500/80"
                : "bg-gradient-to-r from-gold-dark to-gold"
            }`}
            style={{ width: `${sopRead ? 100 : scrollPct}%` }}
          />
        </div>
      </div>

      {/* Scrollable document content */}
      {!sopRead && (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="max-h-[70vh] sm:max-h-[500px] overflow-y-auto px-5 sm:px-10 py-6 sm:py-8 bg-white text-charcoal sop-content"
        >
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      {/* Footer — confirm or done */}
      <div className="px-5 sm:px-6 py-4 border-t border-white/[0.06]">
        {sopRead ? (
          <div className="flex items-center gap-2 text-emerald-400/80 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            SOP completed — Quiz unlocked
          </div>
        ) : reachedEnd ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-emerald-400/60">
              You&apos;ve reached the end of the document.
            </p>
            <button
              onClick={onConfirmRead}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-charcoal font-semibold text-sm hover:bg-gold-light transition-colors shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm &amp; Unlock Quiz
            </button>
          </div>
        ) : (
          <p className="text-sm text-white/25">
            Scroll through the entire document to unlock the quiz ({100 - scrollPct}% remaining)
          </p>
        )}
      </div>
    </div>
  );
}
