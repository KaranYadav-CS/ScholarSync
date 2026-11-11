# ScholarSync — Agent Instructions and Project Standards

## Architecture & Stack Rules
- **Modular Monolith**: React + Vite frontend (`client/`), Node.js LTS + Express backend (`server/`).
- **Database**: Microsoft Azure SQL Database (`mssql` / Tedious driver). Uses local development JSON-backed demo adapter when `DEMO_MODE=true` or Azure SQL credentials are not set.
- **Storage**: Azure Blob Storage (`@azure/storage-blob`) with private containers. Uses local disk-backed storage in `server/data/uploads` when `DEMO_MODE=true`.
- **Identity & Auth**: Signed JWT in HttpOnly secure cookies, bcrypt password hashing, CSRF protection for mutations, login rate limiting. Public registration strictly creates `STUDENT` role.
- **Zero Secrets**: Never commit real passwords, tokens, connection strings, or cloud keys. Use `.env` (gitignored) and `.env.example` (placeholders only).
- **Security Boundaries**: Deny by default. Strict server-side RBAC and object-level ownership checks on all private resources.
- **Explainable Eligibility**: Deterministic rule evaluator (EQ, NE, GT, GTE, LT, LTE, IN, BETWEEN). No arbitrary JS or SQL evaluation.
- **Status Lifecycle**: Strictly enforce state transition matrix (`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `CLARIFICATION_REQUESTED` -> `RESUBMITTED` -> `VERIFIED` -> `RECOMMENDED_FOR_APPROVAL` / `RECOMMENDED_FOR_REJECTION` -> `APPROVED` / `REJECTED`).

## Local Development & Testing Rules
- Use `npm.cmd` on Windows for running npm commands.
- Run tests regularly: verify RBAC, eligibility engine, document boundaries, and status transitions.
- All code changes must be actual runnable implementations, not stubs or mock-only code.
