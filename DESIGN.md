# ConsultIQ Design Notes

ConsultIQ is built around one idea: enterprise AI value comes from redesigned workflows, not isolated model prompts. The prototype uses a consulting-firm AI Lab scenario because that setting makes the important constraints visible: sensitive data, review gates, reusable tools, and production ownership.

## Workflow-First Interaction

The default experience is Workflow Builder mode. The first action is no longer just "ask a question"; it is "run the weekly update workflow." That path executes a fake reporting workflow for Project Northstar: read source notes, read the risk log, pull project status, check review requirements, draft the weekly update, and stop before client-facing use.

A user can still start with operational pain, such as weekly status reporting or risk-log reconciliation, and the system turns it into an AI Lab Prototype Brief. The brief requires current-state workflow, proposed agentic workflow, tools and data sources, human approval points, autonomy level, compliance assessment, MVP scope, eval criteria, and production-readiness criteria.

This structure is intentional. It shows both sides of the builder role: executing a bounded workflow when the process is known, and designing a governed prototype when the problem is still ambiguous.

## Deterministic Tools

The local tool layer is deterministic and uses fake enterprise data. The model can synthesize, explain, and format, but it does not own project facts or compliance verdicts. Compliance is especially strict: `check_compliance` returns `allowed`, `review required`, or `not allowed`, and the agent layer enforces that verdict if provider output drifts.

That design mirrors a regulated enterprise pattern: models can assist judgment, but policy decisions need traceable systems of record and human accountability.

`run_weekly_update_workflow` is the clearest example. It uses a fake source packet, retrieves project facts from the local register, detects risk movement, writes a draft, and returns a human-review-required status. It does not send email, update a CRM, or pretend to touch real enterprise systems.

## Fallback Chain

The runtime has three tiers:

1. Gemini function calling for live tool use and synthesis.
2. Groq synthesis fallback using already executed local tool results.
3. Deterministic local fallback when no provider is available.

The fallback chain exists so the demo remains reviewable without credentials or quota. It also shows production thinking: failures should degrade visibly and preserve local controls instead of silently breaking the workflow.

## Eval Strategy

The eval harness is a deterministic tool-plan regression suite. It does not claim to grade nondeterministic model quality. Instead, it checks the parts this prototype can verify reliably:

- expected local tools are called,
- compliance verdicts match static rules,
- workflow outputs contain required structure,
- the weekly update runner returns source artifacts, a draft, and a review gate,
- unknown project prompts do not invent facts.

This is the first layer of a production eval strategy. A production version would add golden-output tests, model-graded quality checks, human review sampling, and CI gates tied to prompt/tool versions.

## Production Path

To productionize this pattern, the static JSON files would become approved enterprise connectors, the in-memory rate limiter would move to Redis, auth and role-based access would gate tool access, and every tool call would be logged with prompt version, data source version, latency, and review outcome.
