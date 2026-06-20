# ConsultIQ: AI Builder Workbench

ConsultIQ is a portfolio prototype for an AI Builder / AI Lab capability factory. It shows how a messy internal workflow can become a governed, reusable agentic capability with bounded tools, evals, review gates, fallback behavior, and a production path.

Live demo: [https://consultiq.vercel.app/](https://consultiq.vercel.app/)

## Reviewer Path

Open the live demo normally to see the recruiter-review invitation, or use the direct link: [https://consultiq.vercel.app/?review=1](https://consultiq.vercel.app/?review=1).

1. Select **Start guided review**. The dedicated `/api/reviewer-demo` endpoint executes a deterministic Northstar workflow and returns a typed review packet.
2. Follow the six 15-second chapters, or use pause, previous, next, chapter navigation, and keyboard controls.
3. Inspect generated claims and open their exact source notes, risks, and decisions.
4. Review the code-enforced compliance gate and the named human release owner.
5. Compare what is demonstrated, what is simulated, and what is still required for production.
6. Record **Approve internal MVP**, **Request changes**, or **Do not advance**. The clearly labelled simulated audit entry persists in the current browser.
7. Select **Full evidence** to return to the complete workflow output and tool trace.

## What To Notice

- **This executes a workflow, not just a prompt.** The weekly update runner reads fake project notes, reads a fake risk log, pulls project status, detects risks, drafts a weekly update, and flags human review before client-facing use.
- **The model is not the system of record.** Project facts, compliance verdicts, workflow patterns, and document contracts come from deterministic local tools.
- **The output is productized.** The workflow run becomes a Capability Candidate Packet with business value, governance, eval coverage, known gaps, and production-readiness signals.
- **Ownership is explicit before handoff.** The packet names the business owner, technical owner, reviewer, measurable success metric, and condition for moving beyond prototype.
- **The app shows a second AI adoption scenario.** A Gemini Enterprise adoption-readiness prompt demonstrates use case intake, data sensitivity, adoption risk, measurable outcome, and rollout recommendation thinking.
- **Fallback behavior is visible but not scary.** If Gemini is unavailable, the footer explains the provider path in plain language, for example: local tools ran, then Groq wrote the final answer.
- **The app is reviewable without credentials.** Gemini, Groq, and deterministic local demo paths let the portfolio keep working during provider quota or key issues.

## Screenshots

First-run workflow workbench:

![First-run ConsultIQ workbench](public/docs/first-run.png)

Executed weekly update workflow:

![Capability Candidate Packet](public/docs/candidate-packet.png)

Generated prototype brief with tool activity:

![Generated AI Lab prototype brief](public/docs/prototype-brief.png)

Case study modal:

![ConsultIQ case study modal](public/docs/case-study.png)

Deterministic eval panel:

![Eval panel with deterministic checks](public/docs/eval-panel.png)

AI governance modal:

![AI Governance modal](public/docs/governance-modal.png)

## Why This Is More Than A Chatbot

ConsultIQ has two paths:

- **Run Workflow:** executes the Project Northstar weekly reporting workflow from fake source artifacts.
- **Ask ConsultIQ:** answers policy, project, compliance, and drafting questions with local tools.

The stronger portfolio path is **Run Workflow** because it demonstrates workflow thinking: source collection, tool orchestration, risk detection, compliance checks, draft generation, and a human approval boundary.

The second reviewer path is **Gemini Enterprise Adoption Readiness**. It shows how the same workbench pattern can evaluate AI adoption ideas before a team builds the wrong prototype: name an accountable owner, classify data sensitivity, define a measurable outcome, keep human review, and recommend prototype/pilot/defer.

## Architecture

```text
Browser
  |
  v
Next.js App Router UI
  |
  | POST /api/chat or /api/reviewer-demo
  v
Agent loop
  |
  | bounded tool calls
  v
Local deterministic tools
  |-- run_weekly_update_workflow
  |-- search_knowledge_base
  |-- get_project_status
  |-- check_compliance
  |-- design_agentic_workflow
  |-- generate_document
  |
  v
Provider path
  |-- Gemini function calling and synthesis
  |-- Groq synthesis fallback from local tool results
  |-- deterministic local demo fallback
  |
  v
Structured UI response with tool events, flags, and metadata
```

## Local Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Provider keys are optional for review. Without keys, ConsultIQ uses deterministic local demo behavior.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run security:audit
npm run security:secrets
```

The eval suite contains 11 deterministic cases, including weekly workflow ownership/handoff checks and a Gemini Enterprise adoption-readiness workflow case.

## Design Notes

[`DESIGN.md`](DESIGN.md) explains the technical choices: workflow-first UX, deterministic tools, code-enforced compliance, provider fallback wording, eval strategy, and the production path.

## License

MIT. See [`LICENSE`](LICENSE).
