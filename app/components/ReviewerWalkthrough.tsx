"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  REVIEWER_DEMO_PROMPT,
  createReviewerDecision,
  reviewerTakeaways,
  type ReviewerDecisionRecord,
  type ReviewerDecisionValue,
  type ReviewerDemoPayload
} from "@/lib/reviewerDemo";
import {
  formatReviewerTime,
  reviewerElapsedForStage,
  reviewerStageIndexForElapsed,
  reviewerStages,
  REVIEWER_STAGE_SECONDS,
  REVIEWER_WALKTHROUGH_SECONDS
} from "@/lib/reviewerWalkthrough";
import { ArrowLeft, ArrowRight, Check, Lightbulb, LoaderCircle, Pause, Play, RotateCcw, X } from "lucide-react";
import ReviewerStageContent from "./ReviewerStageContent";

const DECISION_STORAGE_KEY = "consultiq.reviewer-decisions.v1";

type ReviewerWalkthroughProps = {
  open: boolean;
  loading: boolean;
  demo?: ReviewerDemoPayload;
  error?: string;
  startAtOutcome?: boolean;
  onClose: () => void;
  onRetry: () => void;
  onOpenEvidence: () => void;
};

function readDecisions(runId: string) {
  try {
    const stored = window.localStorage.getItem(DECISION_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as ReviewerDecisionRecord[]) : [];
    return parsed.filter((decision) => decision.runId === runId);
  } catch {
    return [];
  }
}

export default function ReviewerWalkthrough({ open, loading, demo, error, startAtOutcome = false, onClose, onRetry, onOpenEvidence }: ReviewerWalkthroughProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [decisions, setDecisions] = useState<ReviewerDecisionRecord[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageIndex = reviewerStageIndexForElapsed(elapsedSeconds);
  const stage = reviewerStages[stageIndex];
  const complete = elapsedSeconds >= REVIEWER_WALKTHROUGH_SECONDS;

  useEffect(() => {
    if (!open) return;
    setElapsedSeconds(startAtOutcome ? reviewerElapsedForStage(reviewerStages.length - 1) : 0);
    setPlaying(!startAtOutcome);
    setDecisions(demo ? readDecisions(demo.runId) : []);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [demo, open, startAtOutcome]);

  useEffect(() => {
    if (!open || loading || !demo || error || !playing || complete) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => Math.min(REVIEWER_WALKTHROUGH_SECONDS, current + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [complete, demo, error, loading, open, playing]);

  const moveToStage = useCallback((nextIndex: number, pause = true) => {
    const bounded = Math.max(0, Math.min(nextIndex, reviewerStages.length - 1));
    setElapsedSeconds(reviewerElapsedForStage(bounded));
    if (pause) setPlaying(false);
  }, []);

  const recordDecision = useCallback((decision: ReviewerDecisionValue) => {
    if (!demo) return;
    const record = createReviewerDecision(demo.runId, decision);
    setDecisions((current) => {
      const next = [record, ...current];
      let all: ReviewerDecisionRecord[] = [];
      try {
        const stored = window.localStorage.getItem(DECISION_STORAGE_KEY);
        all = stored ? (JSON.parse(stored) as ReviewerDecisionRecord[]) : [];
      } catch {
        all = [];
      }
      window.localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify([record, ...all]));
      return next;
    });
  }, [demo]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") moveToStage(stageIndex - 1);
      if (event.key === "ArrowRight") moveToStage(stageIndex + 1);
      if (event.key === " " && demo && !loading) {
        event.preventDefault();
        setPlaying((current) => !current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [demo, loading, moveToStage, onClose, open, stageIndex]);

  if (!open) return null;

  const progress = (elapsedSeconds / REVIEWER_WALKTHROUGH_SECONDS) * 100;
  const chapterProgress = ((elapsedSeconds % REVIEWER_STAGE_SECONDS) / REVIEWER_STAGE_SECONDS) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviewer-walkthrough-title"
        className="flex h-[100dvh] w-full flex-col overflow-hidden border-white/10 bg-ink-950 shadow-2xl sm:h-[min(850px,calc(100dvh-2rem))] sm:max-w-6xl sm:rounded-md sm:border"
      >
        <header className="shrink-0 border-b border-white/10">
          <div className="flex items-start justify-between gap-4 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Recruiter review</span><span aria-hidden="true">/</span><span>Chapter {stageIndex + 1} of {reviewerStages.length}</span>
                {demo ? <span className="text-emerald-200">Deterministic local demo</span> : null}
              </div>
              <h2 id="reviewer-walkthrough-title" className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                ConsultIQ capability review
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {demo ? (
                <>
                  <button type="button" onClick={() => moveToStage(reviewerStages.length - 1)} className="hidden min-h-9 items-center rounded border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/10 sm:inline-flex">
                    Skip to outcome
                  </button>
                  <button type="button" onClick={onOpenEvidence} className="hidden min-h-9 items-center rounded border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/10 sm:inline-flex">
                    View workflow evidence
                  </button>
                </>
              ) : null}
              <button ref={closeButtonRef} type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close reviewer walkthrough">
                <X size={17} />
              </button>
            </div>
          </div>
          <div className="h-1 bg-white/[0.04]"><div className="h-full bg-emerald-300 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center p-6" aria-live="polite">
            <div className="text-center">
              <LoaderCircle size={28} className="mx-auto animate-spin text-emerald-200" />
              <h3 className="mt-4 text-lg font-semibold text-white">Running the governed workflow</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Assembling a typed reviewer packet from bounded tools, fake evidence, deterministic policy, and production-readiness rules.</p>
            </div>
          </div>
        ) : error || !demo ? (
          <div className="flex flex-1 items-center justify-center p-6" aria-live="assertive">
            <div className="max-w-md text-center">
              <h3 className="text-lg font-semibold text-white">The walkthrough could not load</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{error ?? "The reviewer endpoint did not return the required structured evidence."}</p>
              <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded border border-emerald-300/30 bg-emerald-300/10 px-4 text-sm text-emerald-50 hover:bg-emerald-300/20">
                <RotateCcw size={15} />Run again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[210px_1fr]">
              <nav aria-label="Reviewer walkthrough chapters" className="shrink-0 overflow-x-auto border-b border-white/10 lg:overflow-y-auto lg:border-b-0 lg:border-r">
                <ol className="flex min-w-max p-2 lg:min-w-0 lg:flex-col lg:p-3">
                  {reviewerStages.map((item, index) => {
                    const active = index === stageIndex;
                    const visited = index < stageIndex || complete;
                    return (
                      <li key={item.id}>
                        <button type="button" onClick={() => moveToStage(index)} aria-current={active ? "step" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left text-xs transition-colors ${active ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${visited ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : active ? "border-sky-300/35 text-sky-100" : "border-white/10"}`}>
                            {visited ? <Check size={12} /> : index + 1}
                          </span>
                          <span className="whitespace-nowrap lg:whitespace-normal">{item.shortLabel}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <main className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-5">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-200">{stage.shortLabel} - {REVIEWER_STAGE_SECONDS} seconds</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{stage.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{stage.description}</p>
                    {stageIndex === 0 ? (
                      <div className="mt-4 grid gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400 sm:grid-cols-3">
                        <div>
                          <p className="font-medium uppercase tracking-[0.14em] text-sky-200">Starting prompt</p>
                          <p className="mt-1 text-slate-200">{REVIEWER_DEMO_PROMPT}</p>
                        </div>
                        <div>
                          <p className="font-medium uppercase tracking-[0.14em] text-emerald-200">What runs</p>
                          <p className="mt-1">Three bounded tools read fake evidence, draft the update, and enforce review.</p>
                        </div>
                        <div>
                          <p className="font-medium uppercase tracking-[0.14em] text-amber-200">Real vs simulated</p>
                          <p className="mt-1">Workflow logic, tracing, and controls are built; enterprise connectors and auth are simulated.</p>
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-3 flex gap-2 rounded-md border border-sky-300/15 bg-sky-300/[0.04] px-3 py-2">
                      <Lightbulb size={15} className="mt-0.5 shrink-0 text-sky-200" aria-hidden="true" />
                      <p className="text-xs leading-5 text-sky-50/85"><span className="font-medium text-sky-100">Why it matters:</span> {reviewerTakeaways[stageIndex]}</p>
                    </div>
                    <div className="mt-4 h-px bg-white/10"><div className="h-px bg-sky-300/70 transition-[width] duration-500" style={{ width: `${complete && stageIndex === reviewerStages.length - 1 ? 100 : chapterProgress}%` }} /></div>
                  </div>
                  <div key={stage.id} className="animate-fade-in-up">
                    <ReviewerStageContent stageIndex={stageIndex} data={demo} decisions={decisions} onDecision={recordDecision} />
                  </div>
                </div>
              </main>
            </div>

            <footer className="shrink-0 border-t border-white/10 bg-ink-900 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div className="hidden text-xs text-slate-500 sm:block"><span className="font-medium text-slate-300">{formatReviewerTime(elapsedSeconds)}</span> / {formatReviewerTime(REVIEWER_WALKTHROUGH_SECONDS)}</div>
                <div className="flex flex-1 items-center justify-center gap-2">
                  <button type="button" onClick={() => moveToStage(stageIndex - 1)} disabled={stageIndex === 0} className="flex h-10 w-10 items-center justify-center rounded border border-white/10 text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous chapter"><ArrowLeft size={16} /></button>
                  <button type="button" onClick={() => { if (complete) { setElapsedSeconds(0); setPlaying(true); } else { setPlaying((current) => !current); } }} className="inline-flex min-h-10 min-w-28 items-center justify-center gap-2 rounded border border-emerald-300/25 bg-emerald-300/10 px-4 text-sm text-emerald-50 hover:bg-emerald-300/20">
                    {complete ? <RotateCcw size={15} /> : playing ? <Pause size={15} /> : <Play size={15} />}
                    {complete ? "Replay" : playing ? "Pause" : "Resume"}
                  </button>
                  <button type="button" onClick={() => moveToStage(stageIndex + 1)} disabled={stageIndex === reviewerStages.length - 1} className="flex h-10 w-10 items-center justify-center rounded border border-white/10 text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next chapter"><ArrowRight size={16} /></button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => moveToStage(reviewerStages.length - 1)} className="inline-flex min-h-10 items-center rounded border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/10 sm:hidden">Outcome</button>
                  <button type="button" onClick={onOpenEvidence} className="inline-flex min-h-10 items-center rounded border border-white/10 px-3 text-xs text-slate-300 hover:bg-white/10 sm:hidden">Evidence</button>
                </div>
                <div className="hidden w-24 text-right text-xs text-slate-500 sm:block">{playing && !complete ? "Auto-playing" : complete ? "Complete" : "Paused"}</div>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
