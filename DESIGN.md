# ConsultIQ Design Notes

This file explains the technical choices behind ConsultIQ. The README is the reviewer-facing overview; this document is the shorter engineering rationale.

## 1. Workflow First

The default path is **Run Workflow**, not a blank chatbot. The strongest demo runs the fake Project Northstar weekly reporting workflow:

1. Read fake meeting notes and project notes.
2. Read the fake risk log.
3. Pull project status from the local project register.
4. Detect risk movement.
5. Check client-facing review requirements.
6. Draft the weekly update.
7. Stop at human approval.

That interaction is closer to enterprise AI builder work than a general assistant answer. It shows process redesign, tool orchestration, auditability, and decision boundaries.

## 2. Deterministic Tools

The local tool layer uses fake static data and deterministic logic. The model can synthesize and format, but it does not own facts or compliance decisions.

The key tools are:

- `run_weekly_update_workflow`
- `search_knowledge_base`
- `get_project_status`
- `check_compliance`
- `design_agentic_workflow`
- `generate_document`

`check_compliance` returns `allowed`, `review required`, or `not allowed` from local rules. The agent layer enforces that verdict if provider output drifts. This mirrors a regulated environment: models can assist judgment, but policy decisions need traceable systems of record.

## 3. Provider Fallback

The runtime has three tiers:

1. Gemini function calling and synthesis.
2. Groq synthesis fallback using local tool results that already ran.
3. Deterministic local demo fallback when no provider is available.

Fallback exists so the demo remains reviewable without credentials or quota. It is also a production-readiness signal: provider failure should degrade visibly while preserving local controls.

The UI should not show raw labels such as `provider_error` as if the app broke. When Gemini is unavailable or quota-limited, the footer explains the provider path in plain language:

```text
Provider path: Gemini unavailable; local tools ran, Groq wrote the final answer.
```

That makes fallback observable without making resilience look like failure.

## 4. Human Review Gates

Client-facing or sensitive outputs are not treated as final actions. The weekly update workflow returns `human review required`, identifies the required reviewer, and explains why approval is needed.

This matters because enterprise autonomy is not all-or-nothing. The useful pattern here is supervised automation: the agent drafts, organizes evidence, and exposes risks, while a human owns external use.

## 5. Eval Strategy

The eval harness is a deterministic tool-plan regression suite. It does not claim to grade open-ended model quality.

It checks:

- expected tools are called,
- compliance verdicts match static rules,
- workflow outputs contain required structure,
- the weekly update runner returns source artifacts, a draft, and a review gate,
- unknown project prompts do not invent facts.

A production version would add golden-output tests, model-graded quality checks, human review sampling, prompt/tool versioning, and CI gates.

## 6. Production Path

To productionize this pattern:

- replace JSON files with approved enterprise connectors,
- add auth and role-based tool access,
- persist approval decisions,
- move rate limiting to Redis or an equivalent shared store,
- log tool calls with prompt version, data source version, latency, and review outcome,
- add monitoring, incident ownership, and rollback paths.

The prototype intentionally avoids real enterprise integrations. It is a portfolio-safe demonstration of how the workflow would be designed and governed.
