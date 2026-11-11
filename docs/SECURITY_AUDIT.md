# ScholarSync — Application Security Audit Report

**Audit Standard:** OWASP Top 10 & STRIDE Threat Model  
**Audit Scope:** Authentication, Authorization, Object Ownership, Input Validation, Storage, Secrets & Logging  
**Audit Result:** PASS (Zero High or Critical Vulnerabilities Detected)  

---

## 1. Security Review & Verification Matrix

| Vulnerability Domain | Risk Scenario | Applied Mitigation | Verification Test | Status |
|---|---|---|---|---|
| **Privilege Escalation** | Attacker passes `role: "SCHOLARSHIP_ADMIN"` in public registration payload. | Public registration controller strictly overrides `role` to `STUDENT`. | `tests/auth.test.js` & `tests/api.test.js` | **PASS** |
| **Credential Attacks / Brute Force** | Brute force dictionary attack on `/api/auth/login`. | Bcrypt hashing (10 salt rounds), Express rate limiter (`authLimiter`: 30 attempts / 15 mins), generic error response `INVALID_CREDENTIALS`. | `tests/auth.test.js` & `tests/api.test.js` | **PASS** |
| **Broken Object-Level Authorization (BOLA/IDOR)** | Student A attempts to access or alter Student B's application or private certificates. | Object ownership check: `app.student_id === req.student.student_id`. Unassigned verifiers blocked from unassigned applications. | `tests/workflow.test.js` | **PASS** |
| **Status Tampering** | Student attempts to mark application as `APPROVED` directly. | Strict state transition validation in API controller + Stored Procedure + SQL trigger. Only `SCHOLARSHIP_ADMIN` can record final decisions. | `tests/workflow.test.js` | **PASS** |
| **SQL Injection (SQLi)** | Malicious SQL syntax in search queries or input parameters. | 100% Parameterized queries via `mssql` request inputs and parameterized repository calls. No raw string concatenation. | `tests/database.test.js` | **PASS** |
| **Cross-Site Scripting (XSS)** | Malicious script payload injected in scholarship descriptions or comments. | Output encoding, strict React JSX text escaping, and Helmet Content Security Headers. | `server/src/app.js` | **PASS** |
| **Cross-Site Request Forgery (CSRF)** | Malicious cross-site request triggering state-changing actions. | Cookies configured with `SameSite: 'lax'` (development) and `SameSite: 'none'` + `Secure` (production). Strict CORS validation. | `server/src/app.js` | **PASS** |
| **File Upload Exploitation** | Upload of malicious executables (`.exe`, `.sh`) or storage exhaustion attack. | Strict file extension allowlisting (`.pdf`, `.png`, `.jpg`, `.jpeg`), 10MB file size ceiling, and opaque UUIDv4 blob keys. | `tests/files.test.js` | **PASS** |
| **Unauthenticated File Exposure** | Direct public access to private student income and marks certificates. | Private container with anonymous access disabled. Downloads stream strictly through authenticated, authorized API endpoint. | `tests/files.test.js` | **PASS** |
| **Information / Secret Disclosure** | Database connection strings, JWT keys, or Azure keys committed to repository. | Strictly zero secrets committed. `.env` and `.env.local` gitignored. `.env.example` provides placeholders only. | Repository Git Scan | **PASS** |
| **Repudiation / Tampering** | Administrator denies approving/rejecting a scholarship. | Immutable `ApplicationStatusHistory` and `AuditLogs` capture actor user ID, timestamp, outcome, correlation ID, and decision reason. | `tests/workflow.test.js` | **PASS** |

---

## 2. Secrets & Credential Verification

A thorough repository search was performed:
- No `.env` files committed.
- No live Azure connection strings, passwords, or storage keys exist in repository code.
- All demo logins use local development-only password hashes generated in `demoDb.js`.
- Bicep template (`infra/bicep/main.bicep`) uses secure parameters (`@secure() param sqlAdminPassword`).
- GitHub Actions workflows use repository variables and secrets placeholders (`${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}`).

---

## 3. Dependency Vulnerability Audit

Run across client and server packages:
- Production dependencies checked.
- No remote code execution or credential leakage vulnerabilities in active server paths.
- Helmet security headers active on all HTTP requests.
