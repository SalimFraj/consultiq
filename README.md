# ConsultIQ: AI Builder Workbench

ConsultIQ is a full-stack portfolio prototype for an **AI Builder / AI Lab Capability Factory**: it shows how a messy internal workflow can become a governed, reusable agentic capability with tools, evals, review gates, and a production-readiness path.

The strongest demo path executes a sample weekly reporting workflow from fake notes and risk logs, then packages the result as a **Capability Candidate Packet** with an audit trace, governance snapshot, eval coverage, known production gaps, and next-build recommendation.

This is not positioned as an enterprise chatbot. It is a compact proof of how I think about building AI inside a regulated organization: workflow first, deterministic controls, visible tradeoffs, and reusable capability design.

## 3-Minute Reviewer Path

If you are reviewing this as a portfolio artifact:

1. Open the live demo: [https://consultiq.vercel.app/](https://consultiq.vercel.app/)
2. Click **Run weekly update workflow** on the first screen.
3. Inspect the generated **Capability Candidate Packet** and **Audit Trace Timeline**.
4. Expand **Tool Activity** to see project lookup, workflow execution, and deterministic compliance checks.
5. Use **Copy markdown** or **Download packet** to export the candidate artifact.
6. Open **Case Study** for the problem, architecture, governance, eval, and production path.
7. Inspect the **Capability Factory** lifecycle panel, then click **Run** in the eval harness.
8. Skim [`DESIGN.md`](DESIGN.md) for the reasoning behind workflow-first design, governance, fallback behavior, and production-readiness tradeoffs.

## What To Notice

- **A real workflow is executed.** The weekly update runner reads fake source artifacts, retrieves project facts, detects risks, checks compliance, drafts the update, and stops at a review gate.
- **The model is not the system of record.** Project facts, compliance verdicts, workflow patterns, and document contracts come from deterministic local tools.
- **The output is productized.** The Capability Candidate Packet turns one workflow run into a reusable build artifact an AI Lab could review.
- **The packet is exportable.** A reviewer can copy or download the packet as markdown, which makes the demo feel like a stakeholder handoff artifact.
- **Governance is visible.** Human-review flags, compliance warnings, source artifacts, tool traces, and known production gaps are exposed in the UI.
- **Evals are part of the product.** The eval harness checks tool routing, compliance preservation, workflow structure, unknown-project behavior, and the weekly workflow runner.

## Why I Built This

Most AI portfolio demos are chatbots with a prompt. That misses what enterprise AI actually needs: bounded workflows, governance, tool orchestration, human gates, fallback behavior, and a clear path from prototype to production.

I started from the question: _what would an AI Lab inside a consulting firm actually need to take a messy internal problem and turn it into a governed agentic capability?_ That led to six design decisions that shaped everything:

1. **Workflow-first, not chat-first.** The strongest demo executes a sample weekly update workflow: it reads fake notes and a risk log, pulls project facts, drafts the update, and stops at a review gate. The model is a synthesis layer on top of deterministic tools — not the source of truth.

2. **Compliance verdicts are deterministic.** The `check_compliance` tool returns allowed, review required, or not allowed from local static rules. The model can explain the verdict, but it cannot override it. This is enforced in code: `enforceComplianceVerdict()` rewrites the model output if it drifts from the tool result. In a real firm, compliance cannot be a suggestion.

3. **Graceful degradation.** The app works at three levels: Gemini function calling → Groq synthesis fallback → deterministic local demo. If the API key is missing or quota-limited, the prototype still runs. This isn't just resilience — it means a reviewer can evaluate the project without needing credentials.

4. **Reusable capabilities, not one-off features.** The Capability Factory panel frames each tool as a reusable internal capability with a production signal — what would need to be true for this tool to go from prototype to production. Each build starts further ahead because components are designed for the shared stack.

5. **Eval visibility.** The eval harness calls the real tool layer, validates tool routing, compliance verdicts, and workflow sections, then surfaces pass/fail in the UI. It is not a test suite that tests itself — it runs tools against eval cases and checks actual outputs.

6. **A capability artifact, not just an answer.** After the strongest workflow runs, the UI creates a Capability Candidate Packet. It summarizes business value, before/after workflow, tools used, eval coverage, governance gates, known gaps, and production-readiness signals.

## What This Proves For An AI Builder Role

| Signal | Where to look |
|---|---|
| Thinks in workflows, not just models | Weekly update runner + Workflow Builder Mode |
| Builds and hardens tools | 6 bounded tools with deterministic local execution, fallback chain |
| Treats governance as a design constraint | Compliance verdicts are code-enforced, not model-suggested |
| Designs human-in-the-loop gates | Human-review flags, engagement-owner approval points |
| Contributes reusable capabilities | Capability Factory lifecycle panel + Capability Candidate Packet |
| Designs evaluations | Eval harness with tool routing, verdict, and section checks |
| Takes end-to-end ownership | From problem framing through working prototype with deployment |
| Comfortable with ambiguity | Graceful degradation across 3 provider tiers |

## Screenshots

First-run workflow workbench:

![First-run ConsultIQ workbench](public/docs/first-run.png)

Capability Candidate Packet and audit trace:

![Capability Candidate Packet](public/docs/candidate-packet.png)

Generated prototype brief with local tool activity:

![Generated AI Lab prototype brief](public/docs/prototype-brief.png)

Case study modal:

![ConsultIQ case study modal](public/docs/case-study.png)

Deterministic eval panel:

![Eval panel with deterministic checks](public/docs/eval-panel.png)

Governance modal:

![AI Governance modal](public/docs/governance-modal.png)

## Business Problem

Large professional services teams often have operational pain hidden inside repeatable workflows: status reporting, project risk summaries, policy interpretation, onboarding, approval routing, and prototype intake.

The challenge is not simply asking an LLM a question. The challenge is turning a messy business problem into a bounded agentic workflow that can be tested, governed, reused, and eventually industrialized.

ConsultIQ demonstrates that lifecycle in a compact prototype.

## Why This Is More Than A Chatbot

ConsultIQ has two modes:

- **Assistant Mode:** an internal consulting assistant for policies, project status, compliance checks, and document drafts.
- **Workflow Builder Mode:** runs the weekly update workflow demo and maps messy internal problems into agentic workflow proposals.

The app shows source artifacts, tool activity, local tool results, compliance flags, human-review warnings, token estimates, latency, and governance metadata.

It also includes a **Capability Factory** lifecycle panel, a **Capability Candidate Packet** for the strongest workflow run, and an eval harness that calls real tools and validates outputs for portfolio demo scenarios.

The **Case Study** modal explains the project in interview terms: problem, why workflow-first, architecture, governance choices, eval strategy, and what would be required for production.

## Architecture

```text
Browser
  |
  | chat message + selected local history
  v
Next.js App Router UI
  |
  | POST /api/chat (rate-limited, size-capped, role-sanitized)
  v
Agentic Loop in Next.js API Route
  |
  | Gemini function calling, max 5 tool calls
  v
Local Tool Layer
  |-- search_knowledge_base       -> app/data/knowledge-base.json
  |-- get_project_status          -> app/data/projects.json
  |-- check_compliance            -> app/data/compliance-rules.json
  |-- design_agentic_workflow     -> app/data/workflow-patterns.json
  |-- generate_document           -> deterministic markdown draft
  |-- run_weekly_update_workflow  -> app/data/weekly-update-sources.json
  |
  v
Gemini 2.5 Flash final response
  |
  | if Gemini is unavailable or quota-limited
  v
Groq synthesis fallback using already-executed local tool results
  |
  | if no provider is available
  v
Deterministic local fallback
  |
  v
Structured UI response with tool events, flags, and metadata

GET /api/evals
  |
  v
Portfolio eval suite (calls real tools)
  |-- tool routing validation
  |-- compliance verdict validation
  |-- workflow section validation
```

## Agent Loop

The backend uses Gemini function calling through `@google/genai`.

1. Receive the latest conversation and selected mode.
2. Send the prompt to Gemini with tool declarations.
3. If Gemini requests tools, execute deterministic local handlers.
4. Send function responses back to Gemini.
5. Repeat up to five tool calls.
6. Return the final assistant answer with tool event metadata.

If `GEMINI_API_KEY` is missing, the app still runs in demo mode with local deterministic behavior so the portfolio can be reviewed without a paid API call.

If `GROQ_API_KEY` is configured, Groq is used as a synthesis fallback when Gemini is unavailable or quota-limited. Local tools still run deterministically; Groq only writes the final answer from the local tool results.

Non-quota provider errors are surfaced in the response metadata for observability, rather than silently hidden behind fallback behavior.

## Tools

- `search_knowledge_base(query)` searches fake enterprise policies and delivery guidance.
- `get_project_status(project_id)` returns fake project metadata for consulting engagements.
- `check_compliance(action)` deterministically returns `allowed`, `review required`, or `not allowed`.
- `generate_document(type, context)` produces markdown drafts for status updates, risk summaries, meeting agendas, client briefs, and AI Lab prototype briefs.
- `design_agentic_workflow(problem)` maps a messy problem to local workflow patterns, human gates, autonomy level, and eval criteria.
- `run_weekly_update_workflow(project_id)` executes the fake Northstar reporting workflow from notes and risk logs, drafts a weekly update, and stops at a review gate.

## API Guardrails

The `/api/chat` endpoint includes:

- **Rate limiting**: 20 requests per 60 seconds per IP (in-memory; production would use Redis).
- **Body size cap**: 100KB maximum request size.
- **Message count cap**: 30 messages per request.
- **Content length cap**: 4,000 characters per message.
- **Role sanitization**: Only `user` and `assistant` roles are accepted.

## Responsible AI Controls

- Fake data only; no real firm, client, or proprietary records.
- No database or persistent server storage.
- Chat history is stored only in browser `localStorage`.
- Server sends the conversation context and selected local tool outputs to Gemini.
- Compliance verdicts are deterministic and cannot be overridden by the model.
- Human-review-required outputs are visually flagged.
- The AI Governance modal explains model, data, tool, privacy, and quota boundaries.

## Demo Scenarios

For the **strongest demo path**, click **Run weekly update workflow** or try:

1. _Run the weekly update workflow for Project Northstar using the sample notes and risk log._
2. _Our teams spend too much time preparing weekly client updates from scattered notes and risk logs. Design an agentic workflow to improve this._
3. _Create an AI Lab prototype brief for automating internal engagement status reporting._

The weekly workflow path is the best one to show first because it produces the Capability Candidate Packet and Audit Trace Timeline.

For Assistant mode:

4. _What is our policy on using AI tools with client data?_
5. _Give me a status update on Project Northstar._
6. _Draft a risk summary for a client migration engagement._
7. _Is it compliant to share a client's financial data with a third-party vendor for analysis?_

## Evaluation Strategy

The prototype includes `app/data/eval-cases.json` with 10 deterministic tool-plan regression cases. The eval harness (`/api/evals`):

1. Calls the shared deterministic tool-plan helper and real local tool layer with each eval prompt.
2. Validates tool routing: were the expected tools actually called?
3. Validates compliance verdicts: does the deterministic output match the expected verdict?
4. Validates workflow sections: does the workflow tool output include required sections and a recommended pattern?
5. Validates unknown-project guardrails so the app does not invent project facts.
6. Validates the weekly update runner returns source artifacts, a draft, and a review gate.
7. Reports per-check pass/fail with detailed reasoning.

This is intentionally not presented as a full nondeterministic LLM quality evaluation. It is the first production-readiness layer: deterministic regression checks for tool routing, compliance, and structured workflow outputs.

The UI exposes these results in the Capability Factory panel with a "Run" button.

## Capability Candidate Packet

When the weekly workflow runner succeeds, ConsultIQ renders a compact production-candidate artifact:

- **Prototype readiness score** based on demonstrated source, project, risk, compliance, draft, and review-gate signals.
- **Candidate summary** with business problem, before/after workflow, and next recommendation.
- **Governance snapshot** with compliance verdict, approval owner, eval coverage, and tools used.
- **Eval badge** showing the 10/10 deterministic eval coverage near the packet header.
- **Audit trace timeline** showing the ordered workflow execution steps.
- **Known production gaps** such as replacing JSON data with approved systems, adding auth, logging, approval storage, and CI eval gates.
- **Markdown export** through copy and download controls for a stakeholder-ready handoff.

This is the main artifact I would point to in an interview because it shows how I think beyond a working demo: what would need to be true for this to become a reusable internal capability.

## Local Setup

```bash
cp .env.local.example .env.local
# Fill in your API keys in .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Without provider keys, ConsultIQ runs in local deterministic demo mode.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run security:audit
npm run security:secrets
```

`security:secrets` scans commit candidates for obvious provider keys and private-key markers. Rotate local provider keys before publishing if they have ever been shared outside this machine.

## Deployment

Live demo: [https://consultiq.vercel.app/](https://consultiq.vercel.app/)

The app is deployed on Vercel. Provider keys are configured as Vercel environment variables, not committed to the repo. The app still runs without keys because the deterministic local demo path is built in.

## Design Notes

I wrote a short design note in [`DESIGN.md`](DESIGN.md). It covers the main choices I cared about: starting from workflow pain instead of a chat box, keeping compliance deterministic, showing tool boundaries, and making the app usable even when model providers are unavailable.

## What I Would Improve Next

This is still a portfolio prototype, so I kept the scope tight. If I were taking it further, I would focus on:

- Streaming tool progress instead of waiting for the full response.
- Exporting the Capability Candidate Packet as markdown for stakeholder review.
- Recording a 60-second demo video that walks through the strongest workflow path.
- Auth and role-based access before connecting real enterprise data.
- Replacing the JSON files with approved internal systems of record.
- Better observability around tool latency, failed calls, and user feedback.
- Approval workflows for drafts that might become client-facing.
- Stronger CI evals with saved golden outputs.
- Persistent rate limiting outside the in-memory demo implementation.

## License

MIT. See [`LICENSE`](LICENSE).
