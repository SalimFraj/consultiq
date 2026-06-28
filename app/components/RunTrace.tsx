import type { AssistantMetadata, ToolEvent } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Database, ShieldCheck, Wrench } from "lucide-react";

type RunTraceProps = {
  toolEvents: ToolEvent[];
  metadata?: AssistantMetadata;
  flags?: {
    uncertainty: boolean;
    complianceWarning: boolean;
    humanReviewRequired: boolean;
  };
};

type RiskItem = {
  id?: string;
  severity?: string;
  trend?: string;
  risk?: string;
};

type SourceArtifacts = {
  meeting_notes?: Array<{ date?: string; source?: string; note?: string }>;
  project_notes?: string[];
  risk_log?: RiskItem[];
  decisions_needed?: string[];
  stakeholder_updates?: string[];
};

type MatchedRule = {
  id?: string;
  category?: string;
  verdict?: string;
  severity?: string;
  rule?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asSourceArtifacts(value: unknown): SourceArtifacts {
  return isRecord(value) ? (value as SourceArtifacts) : {};
}

function sourceCount(sources: SourceArtifacts) {
  return (
    (sources.meeting_notes?.length ?? 0) +
    (sources.project_notes?.length ?? 0) +
    (sources.risk_log?.length ?? 0) +
    (sources.decisions_needed?.length ?? 0) +
    (sources.stakeholder_updates?.length ?? 0)
  );
}

function sourceLabels(toolEvents: ToolEvent[]) {
  const labels: string[] = [];

  for (const event of toolEvents) {
    if (!isRecord(event.result)) continue;

    if (event.name === "run_weekly_update_workflow") {
      const sources = asSourceArtifacts(event.result.source_artifacts);
      sources.meeting_notes?.forEach((note) => labels.push(note.source ? `${note.date ?? "Meeting note"} - ${note.source}` : "Meeting note"));
      if (sources.project_notes?.length) labels.push(`${sources.project_notes.length} project notes`);
      if (sources.risk_log?.length) labels.push(`${sources.risk_log.length} risk log items`);
      if (sources.decisions_needed?.length) labels.push(`${sources.decisions_needed.length} decision items`);
      if (sources.stakeholder_updates?.length) labels.push(`${sources.stakeholder_updates.length} stakeholder updates`);
    }

    if (event.name === "get_project_status" && isRecord(event.result.project)) {
      labels.push(`Project register - ${String(event.result.project.name ?? event.result.project.id ?? "project")}`);
    }

    if (event.name === "search_knowledge_base" && Array.isArray(event.result.documents)) {
      event.result.documents.slice(0, 3).forEach((document) => {
        if (isRecord(document)) labels.push(`Knowledge base - ${String(document.title ?? "document")}`);
      });
    }
  }

  return Array.from(new Set(labels)).slice(0, 8);
}

function workflowSources(toolEvents: ToolEvent[]) {
  const workflowEvent = toolEvents.find((event) => event.name === "run_weekly_update_workflow" && isRecord(event.result));
  return workflowEvent && isRecord(workflowEvent.result) ? asSourceArtifacts(workflowEvent.result.source_artifacts) : {};
}

function complianceRules(toolEvents: ToolEvent[]): MatchedRule[] {
  const rules: MatchedRule[] = [];

  for (const event of toolEvents) {
    const compliance =
      event.name === "check_compliance" && isRecord(event.result)
        ? event.result
        : event.name === "run_weekly_update_workflow" && isRecord(event.result) && isRecord(event.result.compliance_check)
          ? event.result.compliance_check
          : null;

    if (compliance && Array.isArray(compliance.matched_rules)) {
      compliance.matched_rules.forEach((rule) => {
        if (isRecord(rule)) rules.push(rule as MatchedRule);
      });
    }
  }

  return Array.from(new Map(rules.map((rule) => [rule.id ?? rule.rule ?? rule.category ?? "rule", rule])).values());
}

function reviewGate(toolEvents: ToolEvent[], flags: RunTraceProps["flags"]) {
  const workflowEvent = toolEvents.find((event) => event.name === "run_weekly_update_workflow" && isRecord(event.result));
  if (workflowEvent && isRecord(workflowEvent.result) && isRecord(workflowEvent.result.approval_status)) {
    return String(workflowEvent.result.approval_status.status ?? "review required");
  }

  const complianceEvent = toolEvents.find((event) => event.name === "check_compliance" && isRecord(event.result));
  if (complianceEvent && isRecord(complianceEvent.result)) {
    return String(complianceEvent.result.verdict ?? "review required");
  }

  return flags?.humanReviewRequired || flags?.complianceWarning ? "review required" : "not triggered";
}

function gaps(toolEvents: ToolEvent[], flags: RunTraceProps["flags"], metadata?: AssistantMetadata) {
  const items: string[] = [];
  const sources = workflowSources(toolEvents);
  sources.decisions_needed?.forEach((decision) => items.push(decision));
  sources.risk_log?.filter((risk) => risk.trend === "increasing").forEach((risk) => {
    items.push(risk.risk ? `${risk.id ?? "Risk"}: ${risk.risk}` : `${risk.id ?? "Risk"} is increasing`);
  });

  if (flags?.uncertainty) items.push("Output contains uncertainty or fallback behavior.");
  if (metadata?.providerError) items.push(`Provider status: ${metadata.providerError}.`);

  return Array.from(new Set(items)).slice(0, 5);
}

export default function RunTrace({ toolEvents, metadata, flags }: RunTraceProps) {
  if (toolEvents.length === 0 && !metadata && !flags?.humanReviewRequired && !flags?.complianceWarning && !flags?.uncertainty) {
    return null;
  }

  const sources = workflowSources(toolEvents);
  const labels = sourceLabels(toolEvents);
  const rules = complianceRules(toolEvents);
  const risks = sources.risk_log ?? [];
  const increasingRiskCount = risks.filter((risk) => risk.trend === "increasing").length;
  const gate = reviewGate(toolEvents, flags);
  const gapItems = gaps(toolEvents, flags, metadata);
  const usedToolNames = Array.from(new Set(toolEvents.map((event) => event.name.replaceAll("_", " "))));
  const totalSources = Math.max(sourceCount(sources), labels.length);

  const stats = [
    { label: "Sources used", value: String(totalSources), icon: Database },
    { label: "Tools run", value: String(usedToolNames.length), icon: Wrench },
    { label: "Rules applied", value: String(rules.length), icon: ShieldCheck },
    { label: "Risks flagged", value: String(risks.length || increasingRiskCount), icon: AlertTriangle }
  ];

  return (
    <section className="mt-3 rounded-md border border-sky-300/20 bg-sky-300/[0.05]">
      <details open>
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <span>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-sky-100">
              <CheckCircle2 size={14} aria-hidden="true" />
              Run Trace
            </span>
            <span className="mt-1 block text-sm text-slate-300">Sources, rules, risks, and review state for this output.</span>
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">{gate}</span>
        </summary>

        <div className="border-t border-sky-300/15 px-3 py-3 sm:px-4">
          <div className="grid gap-2 sm:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded border border-white/10 bg-ink-950/55 p-3">
                  <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon size={13} aria-hidden="true" />
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Sources Used</p>
              {labels.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                  {labels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">No source artifacts were returned for this run.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Rules Applied</p>
              {rules.length > 0 ? (
                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-300">
                  {rules.map((rule) => (
                    <li key={rule.id ?? rule.rule ?? rule.category}>
                      <span className="font-medium text-slate-100">{rule.id ?? rule.category}</span>
                      {rule.verdict ? <span className="text-slate-500"> - {rule.verdict}</span> : null}
                      {rule.rule ? <span className="block text-slate-400">{rule.rule}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">No deterministic compliance rule matched this run.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Gaps And Follow-Up</p>
              {gapItems.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                  {gapItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-500">No additional gaps were surfaced by this run.</p>
              )}
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}
