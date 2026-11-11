# ScholarSync — Antigravity 2–3 Hour Execution Runbook

**Purpose:** Build the fastest honest, demonstrable ScholarSync MVP from the four supplied project specifications, with Azure-ready code and clear manual Azure setup instructions.

> **Reality check:** Two to three hours is a tight target for a working academic MVP, not a guarantee of a fully production-ready scholarship platform. Antigravity can create and test the code, SQL scripts, Azure adapters, infrastructure templates, and deployment instructions. It cannot make Azure resources exist in the user's subscription without the user's authenticated access, permissions, and explicit approval. Live Azure deployment may therefore remain a manual step. Do not describe untested or unconnected features as completed.

---

## Before starting — 5 to 10 minutes

1. Download and extract `ScholarSync_Antigravity_Pack.zip`.
2. Open the extracted project folder in Google Antigravity. Prefer **Local mode** for this task so edits are made in the active folder. Make a backup or Git commit before starting if the folder already contains work.
3. Make sure these four source documents are inside the workspace, preferably under `docs/`:
   - `docs/user flow.md`
   - `docs/USP.md`
   - `docs/platforms.md`
   - `docs/implementation plan.md`
4. If Antigravity opens an empty folder, put the four files there before sending prompts.
5. Do not paste passwords, access keys, connection strings, GitHub tokens, or Azure secrets into the chat. Use local ignored `.env` files or managed identity as appropriate.

## Recommended execution order

- Prompt 0: Read the specifications, inspect the workspace, and establish project rules.
- Prompt 1: Build the complete time-boxed MVP. This is the main `/goal` prompt.
- Prompt 2: Run the app and complete/fix the most important end-to-end workflow.
- Prompt 3: Complete Azure integration and deployment preparation. Run the live connection only after the user has created/configured the resources.
- Prompt 4: Final quality audit, evidence, and manual-action handoff.

Do not send all prompts at once. Send them in order. Prompt 1 is the main implementation job; prompts 2–4 are continuation prompts that force verification and close gaps.

---

# PROMPT 0 — Workspace inspection and source-of-truth setup

Paste this first:

```text
You are the lead engineer for ScholarSync. Before coding, inspect this entire workspace and read these four files completely, not just their first sections:

1. `docs/user flow.md`
2. `docs/USP.md`
3. `docs/platforms.md`
4. `docs/implementation plan.md`

If the files are in the workspace root rather than `docs/`, locate them and use their actual paths. Also inspect all existing source code, package files, Git status, diagrams, ERD, design documents, and environment examples. Preserve useful existing work. Do not delete or overwrite source documents. Do not assume any proposed feature is already implemented.

Treat the four Markdown files as the product and architecture source of truth. If they conflict, use this priority: user flow for product behaviour and permissions; platforms for technology choices; implementation plan for technical details and security; USP for product positioning. Do not silently invent institution-specific scholarship rules. Use the safe defaults documented in the files and list unresolved decisions.

Create or update these workspace files:
- `AGENTS.md`: concise persistent instructions for future coding sessions. Include stack restrictions, security rules, no-secrets rule, testing requirements, and the instruction to make changes rather than only write plans.
- `docs/EXECUTION_BOARD.md`: P0/P1/P2 implementation checklist with status NOT STARTED / IN PROGRESS / PASS / BLOCKED and evidence column.
- `docs/DECISIONS.md`: record safe defaults and all unresolved faculty/owner decisions.

Inspect the available Node.js/npm versions and the current project structure. Identify whether Azure configuration is already present WITHOUT printing secret values. Do not run destructive commands, delete files, provision paid cloud resources, change subscription settings, create public endpoints, or deploy anything.

Do not ask me questions. Choose the safest documented defaults and record assumptions. After the inspection, provide only a very short summary of the existing workspace, then immediately proceed when I send the main implementation prompt. Do not stop after producing another plan.
```

---

# PROMPT 1 — Main build: complete the demonstrable MVP

Paste this in a new Antigravity message. Keep `/goal` at the beginning:

```text
/goal Build and verify the ScholarSync academic MVP in this workspace using the four supplied specification documents. Implement the actual codebase, not just a design, plan, static mockup, or README. Work autonomously through the highest-priority tasks, run the application, run tests/builds, fix failures, and continue until every feasible acceptance criterion below has evidence. Do not stop after scaffolding or after generating a plan. Do not ask me questions; use the documented safe defaults and record unresolved decisions.

TIME AND SCOPE:
I have approximately 2–3 hours for this first implementation pass. Prioritise a coherent, polished, runnable MVP and complete vertical workflow over optional complexity. Do not waste time on elaborate animations, microservices, AI features, email/SMS integrations, or unnecessary infrastructure. If the full scope cannot honestly be completed in this time, finish P0 first, then P1, and clearly mark what remains BLOCKED/PENDING. Never claim full production readiness without evidence.

A. READ AND FOLLOW THESE REQUIREMENTS
Read all of the following completely before coding:
- `docs/user flow.md`
- `docs/USP.md`
- `docs/platforms.md`
- `docs/implementation plan.md`
- `AGENTS.md` and `docs/DECISIONS.md` if present.

The product is ScholarSync — Smart Scholarship Application, Verification & Tracking Platform. Core lifecycle:
Discover → Check Eligibility → Apply → Upload Documents → Verify → Clarify / Recommend / Decide → Track → Analyze → Audit.

B. NON-NEGOTIABLE ARCHITECTURE
Use a modular monolith and this stack:
- Frontend: React + Vite + JavaScript, HTML, CSS. Use React Router.
- Backend: Node.js LTS + Express REST API.
- Database: Microsoft Azure SQL Database, SQL Server-compatible SQL, using the `mssql` driver.
- Azure identity: `@azure/identity` / DefaultAzureCredential and App Service managed identity where supported.
- Files: Azure Blob Storage through `@azure/storage-blob`; private container, anonymous/public access disabled.
- Analytics: secured in-app React dashboard fed by backend aggregate APIs; Power BI Desktop report and setup assets as a separate analytics deliverable.
- Hosting: one Azure App Service hosting the Express server and built React app (same origin).
- Source control/CI: GitHub and GitHub Actions. Prefer OIDC/federated identity for deployment where supported.
- Password hashing: bcrypt.
- Authentication: signed JWT/session approach using Secure, HttpOnly, SameSite cookies; protect state-changing cookie-authenticated requests against CSRF. Do not store auth tokens in localStorage.
- Validation: a consistent server-side schema validator; parameterized SQL only; Helmet/security headers, rate limiting on authentication, centralized error handling, request IDs, structured logs.

Do NOT use Supabase, Vercel, MongoDB, MySQL, a second database, microservices, or Python for the main application. Do not add new paid services without a clear requirement and my approval. Do not embed Power BI Publish-to-web or any public Power BI report containing private/student information.

C. REPOSITORY STRUCTURE
Create a clean, understandable structure, retaining existing useful files. At minimum provide:
- `client/` for React app
- `server/` for Express API, routes, middleware, services, repositories
- `database/migrations/`, `database/schema.sql`, `database/seed-demo.sql`, and `database/reporting-views.sql`
- `infra/bicep/` for optional Azure infrastructure template(s)
- `powerbi/` for Power BI setup notes, data model, measures, and report instructions
- `docs/` for the four source docs, ERD, threat model, architecture, API reference, Azure manual setup, test evidence, and known gaps
- root `README.md`, `.gitignore`, `.env.example`, `package.json` scripts or clear client/server scripts, and GitHub Actions workflow templates.

Do not remove the original four supplied Markdown specifications. Copy them into `docs/` if they are not already there.

D. CORE DATA / RDBMS — KEEP THE NINE CORE ENTITIES
Implement SQL Server/Azure SQL-compatible migrations/schema for these nine entities:
1. `Users`
2. `Students`
3. `Scholarships`
4. `EligibilityCriteria`
5. `Applications`
6. `Documents`
7. `Verifications`
8. `ApplicationStatusHistory`
9. `AuditLogs`

Use one consistent primary-key approach (prefer `uniqueidentifier` for externally referenced records). Define all primary keys, foreign keys, unique constraints, NOT NULL/CHECK constraints, useful indexes, and timestamp fields. Keep the design normalized to 3NF where appropriate. Ensure one application per student per scholarship unless a documented institutional decision says otherwise. Use SQL transactions for application submission and final decisions so the application status, history, and audit event remain consistent. Create `ApplicationSummaryView` or a similarly named reporting view. Create at least one useful stored procedure and one trigger only if they do not duplicate application-level audit writes. Document the reason for each database object. Generate an ERD Mermaid file that matches the actual schema and a data dictionary.

Never store uploaded file bytes in SQL. SQL stores document metadata and an opaque blob name only. Never store Aadhaar, bank details, or other unnecessary sensitive information as default profile fields.

E. AUTHENTICATION AND PRIVILEGES
Implement:
- Student self-registration and login/logout/current-user endpoint.
- Public registration MUST always create role `STUDENT`; never accept a role from client request data.
- A safe one-time CLI/bootstrap script to create the first Scholarship Admin or System Admin. Read bootstrap credentials from local environment variables; refuse to run if a privileged account already exists. No default production credentials and no public make-me-admin endpoint.
- Role allowlist: `STUDENT`, `VERIFIER`, `SCHOLARSHIP_ADMIN`, `SYSTEM_ADMIN`.
- Server-side RBAC and object-level authorization on every protected API route. Frontend route guards alone are not security.
- Students may only access their own profile, applications, clarification history, and files.
- Verifiers may only access assigned applications and may record review actions, request clarification, and make a recommendation.
- Scholarship Admin manages scholarships, criteria, assignments, monitoring, and the final approval/rejection decision with a mandatory reason.
- System Admin manages accounts/roles and restricted audit/security information. System Admin must not automatically get unrestricted document-content access.
- Add login rate limiting, safe error messages, password hashing, and audit relevant privileged changes.

F. REQUIRED WORKING PRODUCT FLOWS
Implement a responsive web app with real API calls and clear loading, empty, success, validation-error, API-error, and access-denied states.

Public:
- `/` professional landing page with product value proposition and calls to action.
- `/scholarships` published scholarship listing with search and filters.
- `/scholarships/:id` scholarship details and eligibility summary.
- `/login`, `/register`, `/unauthorized`, `/not-found`.

Student:
- dashboard with own profile completeness, eligible opportunities, application summary and recent activity.
- profile create/update.
- eligible-scholarships page showing EXPLAINABLE reasons: eligible, ineligible, or missing profile data.
- application form and document checklist.
- own application list/details, status timeline, and clarification response.
- secure document upload and authorized download.

Verifier:
- dashboard and assigned application queue.
- application detail and limited student/document information.
- document review, verification comments/actions, clarification request, approval/rejection recommendation.
- verifier must not make the final approval/rejection decision under the documented default policy.

Scholarship Admin:
- dashboard and aggregate analytics.
- create/edit/publish/close scholarships and configure allowlisted eligibility criteria.
- assign applications to verifiers.
- monitor application status.
- final approval/rejection with mandatory decision reason.
- restricted audit log view as permitted.

System Admin:
- user list/detail, disable/enable account, controlled role management after bootstrap, and restricted audit view.

Eligibility engine:
- Deterministic rule-based evaluator only (not AI). Support a safe allowlist of fields and operators such as EQ, NE, GT, GTE, LT, LTE, IN, BETWEEN.
- Never execute rule text as SQL or arbitrary JavaScript.
- Return per-criterion pass/fail/missing-data explanations.

Application statuses must follow the exact allowlisted status and transition rules in `docs/user flow.md`. At minimum preserve submission, review, clarification request, resubmission, verifier recommendation, and final approval/rejection. Reject direct client attempts to jump to a final status. Record every valid status transition with actor, reason, timestamp, and correlation ID.

G. DOCUMENT STORAGE SECURITY
Implement an Azure Blob Storage adapter using a private container and managed identity in Azure where possible. Implement strict allowlisted file extensions and MIME types, size limits, safe filenames, opaque blob names, file metadata/hash if feasible, and per-application authorization before download. Stream downloads through the API or issue only short-lived, narrowly scoped access tokens after authorization. Do not return public Blob URLs. Do not claim malware scanning unless a real scanner is configured and tested.

H. LOCAL DEMO MODE — ONLY IF AZURE IS NOT CONFIGURED
First detect whether usable Azure SQL and Blob configuration/resources are already available; do not print secret values.
- If Azure SQL/Blob are configured and reachable, use the real Azure adapters.
- If they are not configured, build an explicit development-only demo adapter with fictional sample records so I can run and demonstrate the workflows locally. Label the UI clearly as `DEMO MODE — sample data`. Demo mode may use a local file-backed JSON repository for demonstration only; keep it isolated behind repository interfaces and environment flags.
- The production startup path MUST refuse to start when demo mode is enabled. Never silently fall back to demo data in production.
- Do not claim demo-mode data is stored in Azure SQL or Azure Blob.
- Provide simple setup/seed commands and demo login accounts whose credentials are generated or supplied only for local development; never seed them into production.

I. PROFESSIONAL UI QUALITY
Create a polished education-technology product, not a generic dashboard template. Use a consistent design system: restrained navy/indigo/teal accent palette, light neutral backgrounds, crisp typography, generous but efficient spacing, consistent buttons/forms/cards/tables/badges/dialogs, clear status colours plus text labels, and a responsive sidebar/top navigation. Use real icons (for example lucide-react), not emoji navigation. Keep pages uncluttered, usable on laptop and mobile, and accessible by keyboard. Add realistic fictional content only in demo mode. Include search/filter/pagination where useful, useful empty states, loading skeletons that resolve, toast/inline errors, and confirmation dialogs for irreversible actions. Do not spend time on complex animation.

J. ANALYTICS AND POWER BI
- The actual website administrator analytics page must be protected by RBAC and use real `/api/admin/analytics/*` APIs, not hard-coded numbers.
- Create SQL reporting views that expose aggregated, non-identifying data appropriate for analytics.
- In `powerbi/`, generate a clear Power BI Desktop connection guide, suggested data model, DAX measures for total/submitted/pending/approved/rejected applications, department-wise and scholarship-wise summaries, and refresh notes.
- Power BI Desktop `.pbix` may be created only if Power BI Desktop is actually available in the environment. Otherwise do not pretend to create it; create the SQL views, measures, and exact manual report steps.
- Do not rely on Power BI Pro being included with Azure for Students. Do not use public Publish to web for private student data. Secure embedding is optional and licence-dependent.

K. AZURE AND GITHUB DELIVERABLES
Prepare, but do not automatically provision or modify my subscription:
- Azure SQL connection via managed identity / DefaultAzureCredential for Azure hosting where supported; local dev configuration instructions.
- Blob connection via managed identity / DefaultAzureCredential and private container.
- Express app serving React build on the same Azure App Service origin.
- `.env.example` containing placeholders only and exact variable documentation.
- `infra/bicep/` template(s) and README with prerequisites, resource names as parameters, estimated-cost warning, deployment command, and teardown warnings.
- `docs/azure-manual-setup.md` with exact Azure Portal actions: subscription/budget checks, resource group, SQL server/database, schema migration, firewall/network rules, storage account/private container, App Service, managed identity, role assignments, app settings, health checks, and logs.
- GitHub Actions build/test/deploy workflow using OIDC/federated identity where supported. Do not put client secrets or publish profiles into the repository. Document the user-managed GitHub/Azure setup steps.
- Never run `az deployment`, create resources, modify firewall rules, create public access, increase quotas, or incur Azure charges without my explicit approval in a separate instruction.

L. TESTS AND DEFINITION OF DONE
Create tests for:
- Student registration always creates STUDENT even if client submits another role.
- Invalid login and login rate limiting.
- Role-denied requests.
- Student cannot access another student's application or document.
- Verifier cannot access unassigned application and cannot final-approve/reject.
- Scholarship Admin can make final decision only with a reason.
- Invalid status transitions are rejected and audited.
- Eligibility evaluator returns correct eligible/ineligible/missing-data explanations.
- File type/size restrictions and unauthorized download denial.
- Application submission/status history/audit consistency.
- Analytics endpoints return aggregates and exclude direct identifiers.

Run install, lint (if configured), unit/API tests, database migration validation if available, and production build. Fix all failures that can be fixed in the workspace. If Azure is unavailable, mark Azure integration tests BLOCKED pending the user's resource configuration; do not fabricate a pass. Run the app and verify the principal screens and core flow in the browser if browser tooling is available.

M. REQUIRED FINAL OUTPUTS
Before completing, ensure these exist and are accurate:
- working frontend/backend source code
- SQL migrations/schema/seed demo/reporting views
- ERD matching schema
- updated `docs/threat-model.md` and security checklist
- `docs/api-reference.md`
- `docs/architecture.md`
- `docs/azure-manual-setup.md`
- `powerbi/` setup guide, model and measures
- `.env.example` with no secrets
- GitHub Actions workflow template
- Bicep/infra template(s), if feasible
- README with exact setup/run/test/build commands
- `docs/EXECUTION_BOARD.md` with evidence for every PASS and honest BLOCKED items

FINAL ACCEPTANCE:
1. I can start the app locally by following the README without guessing commands.
2. The interface is polished and all main role areas render.
3. The demo-mode end-to-end workflow can be demonstrated using fictional data if Azure is not configured.
4. Azure SQL and Blob adapters, migrations, and manual setup documentation are present for real integration.
5. Authorization and status-transition tests pass for implemented paths.
6. Build and available tests pass.
7. The final report clearly separates IMPLEMENTED, TESTED, DEMO-ONLY, and MANUAL/BLOCKED.

Prioritise a complete vertical slice over many half-finished pages. Continue until the feasible acceptance criteria have evidence. Never claim deployment or production readiness unless it actually happened and was verified.
```

---

# PROMPT 2 — Run the application and finish the end-to-end demo flow

Use this after Prompt 1 has produced code:

```text
Continue from the existing ScholarSync codebase. Do not regenerate the project or replace working components. Start the application using the README instructions. Inspect the actual running website and backend logs.

Your immediate goal is to complete and verify one end-to-end demonstration using fictional demo data:
1. Public visitor opens the landing page and scholarship listing.
2. Student registers/logs in and completes their profile.
3. Student views scholarships and receives explainable eligibility results.
4. Student applies and uploads an allowed sample document.
5. Assigned verifier opens the assigned case, reviews it, and requests clarification.
6. Student responds and resubmits.
7. Verifier records a recommendation.
8. Scholarship Admin makes the final decision with a reason.
9. Student sees the final status and complete timeline.
10. Admin dashboard shows aggregates that reconcile with the same underlying records.
11. Audit history records important actions.

For every step, use the actual frontend and API. Do not merely inspect components or claim a flow works because the route exists. Fix broken navigation, API contracts, validation, persistence, and visual defects. Test all role boundaries, especially that a student cannot access another student's application/document and a verifier cannot final-approve/reject.

If Azure is not configured, use only the explicit DEMO_MODE adapter and keep the visible demo banner. If Azure is configured, test the real SQL/Blob connection. Do not silently switch modes. Run the relevant tests and production build again. Update `docs/EXECUTION_BOARD.md` with PASS/FAIL/BLOCKED and evidence. Finish by giving me the exact local run command and any demo-only credentials generated for this development environment. Do not expose any real secrets.
```

---

# PROMPT 3 — Azure SQL, Blob Storage, App Service, GitHub Actions, and Power BI handoff

Send this only after the local app works. If Azure resources already exist, the agent may test them using your locally configured environment; do not paste secrets into chat.

```text
Now complete the Azure integration and deployment preparation for the existing ScholarSync app. First inspect the current code and Azure configuration names without printing secret values. Do not provision, delete, resize, expose publicly, or modify any Azure resource or incur charges unless I explicitly approve that exact action.

1. Azure SQL:
   - Verify the `mssql` adapter, migrations, parameterized queries, connection pooling, and transaction boundaries.
   - Prefer App Service managed identity / Microsoft Entra authentication using supported current Microsoft guidance.
   - Provide exact instructions for creating the database principal for the App Service identity and granting least-privilege permissions.
   - Ensure the schema can be applied repeatably and that the reporting views exist.

2. Azure Blob Storage:
   - Verify SDK integration and private container configuration.
   - Use App Service managed identity and minimum required Blob data role at the narrowest suitable scope.
   - Verify anonymous access is disabled, files are not public, and authorized downloads go through the backend permission check.

3. Azure App Service:
   - Verify the app serves the React build and Express `/api` routes from the same origin.
   - Verify health/readiness endpoints, production environment settings, secure cookies, HTTPS assumptions, logs, and startup command.
   - Ensure DEMO_MODE is false in production and the app fails safely if production database configuration is missing.

4. GitHub Actions:
   - Create/update a CI workflow for install, lint, tests, and build.
   - Create a separate deployment workflow template using OIDC/federated credentials where supported.
   - Clearly list the exact GitHub repository variables/secrets and Azure federated credential configuration the owner must create. Do not put long-lived Azure secrets in YAML or source code.

5. Infrastructure:
   - Complete Bicep templates and `infra/bicep/README.md` if possible.
   - Parameterize resource names, region, SKU, storage redundancy, and app settings. Include cost warnings and avoid expensive defaults.
   - Create `docs/azure-manual-setup.md` with exact portal navigation, values to select, commands to run, role assignments, SQL migration steps, firewall rules, and smoke tests.
   - Explain any student-subscription restrictions or quota/region limitations as checks, not assumptions.

6. Power BI:
   - Keep the private in-product dashboard in React and protected by the backend.
   - Complete SQL aggregate/reporting views and `powerbi/README.md` with exact Azure SQL connection steps in Power BI Desktop, recommended visuals, relationships, DAX measures, and refresh guidance.
   - Do not claim a `.pbix` exists unless you actually create and verify it in Power BI Desktop.
   - Do not assume Azure for Students includes Power BI Pro. Do not use Publish to web with real student data. Document that online sharing/secure embedding requires separate licensing/capacity confirmation.

7. Produce `docs/MANUAL_ACTIONS_REQUIRED.md` with a numbered checklist of exactly what I must do myself in Azure, GitHub, and Power BI. For each action, state where to click, what value/identifier to copy, and where to enter it. Never ask me to send secrets in chat; tell me to enter them directly into local environment settings or the secure portal.

When finished, run the checks that are possible with configured resources. Clearly mark live Azure checks BLOCKED when the required resources, permissions, or identifiers are not available. Do not claim the website is deployed until the live URL has actually been opened and smoke-tested.
```

---

# PROMPT 4 — Final audit, repair, and handover

Send this last:

```text
Perform a strict final engineering audit of the existing ScholarSync workspace. Do not add unrelated features and do not rewrite working code just for style. Compare every deliverable with the four source documents and `docs/implementation plan.md`.

1. Run all install/build/lint/unit/API/integration/E2E tests that are available. Fix real failures. If a test requires Azure resources that are not configured, record it as BLOCKED rather than skipped silently or passed falsely.
2. Run a security review of authentication, registration role assignment, RBAC, object-level access, SQL parameterization, upload validation, private Blob access, status transitions, secrets handling, CORS/cookies/CSRF, logging, and Power BI data exposure.
3. Verify that no secrets, `.env` files, local database files, uploaded sample documents, or real student information are tracked by Git. Verify `.gitignore`.
4. Check for broken links, buttons with no action, fake dashboard data outside DEMO_MODE, unimplemented navigation, dead endpoints, missing loading/error/empty states, and mobile layout defects. Fix the high-impact defects.
5. Verify that the ERD matches the SQL schema and that SQL tables, constraints, indexes, transaction logic, reporting views, API routes, and role rules are documented consistently.
6. Ensure the Power BI documentation accurately distinguishes the free Desktop report authoring app from separate online sharing/embedding licences.
7. Ensure the Azure setup guide is actionable for a student account and never implies that the agent has provisioned resources when it has not.
8. Update the README and `docs/EXECUTION_BOARD.md` with exact commands and evidence.
9. Create `docs/FINAL_HANDOVER.md` with:
   - implemented features;
   - tested features and actual test results;
   - demo-only functionality;
   - Azure resources/permissions still required;
   - Power BI manual actions/licensing caveat;
   - exact local start/test/build commands;
   - exact next actions to deploy;
   - known risks and open faculty decisions.

Return a compact status table with PASS / FAIL / BLOCKED for each acceptance criterion. Do not say “complete”, “secure”, “production-ready”, or “deployed” unless evidence supports the wording. Finish with the single most important next action for me.
```

---

## If Antigravity stops early

Paste this continuation instruction:

```text
Continue the active ScholarSync implementation from the current workspace. First read `docs/EXECUTION_BOARD.md`, `docs/FINAL_HANDOVER.md` if present, and the four source specification files. Identify the highest-priority incomplete P0/P1 item. Implement it now, run the relevant tests/build, fix failures, update the execution board with evidence, and continue to the next item. Do not repeat completed work, do not stop at a plan, and do not claim a blocked Azure task is complete.
```

## Expected result after 2–3 hours

A realistic target is:

**Should be achievable if the agent environment and dependencies cooperate:** a polished local MVP, core screens, role-aware API structure, demo workflow, Azure SQL schema/migrations, Blob adapter, security middleware, tests, README, ERD/threat-model documentation, Power BI setup guide, Bicep/deployment templates, and a clear Azure manual checklist.

**May remain pending:** real Azure resource creation, managed-identity role assignments, SQL firewall/network setup, GitHub OIDC trust, live deployment, Power BI `.pbix` creation, online Power BI sharing licence, malware scanning, email/SMS integration, and production security review.

A codebase is not a live cloud application until the Azure resources are configured, connected, deployed, and tested.
