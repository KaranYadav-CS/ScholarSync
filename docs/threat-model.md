# ScholarSync — Threat Model & Security Controls

## STRIDE Threat Analysis

| Threat ID | Threat Category | Threat Description | Mitigation Strategy | Verification Test |
|---|---|---|---|---|
| **T01** | Spoofing | Brute force or credential stuffing attacks on `/api/auth/login` | Bcrypt hashing, Express rate limiting, generic authentication error messages. | Rate limit triggers 429 after threshold; invalid passwords fail safely. |
| **T02** | Elevation of Privilege | Public registration payload attempts to inject `role: "SCHOLARSHIP_ADMIN"` | Public registration controller strictly overrides role to `STUDENT`. | Registration test verifying submitted roles are discarded. |
| **T03** | Broken Object Level Authorization (BOLA) | Student tries to access or alter another student's application (`/api/applications/:id`) | Object-level authorization middleware asserts `application.student_id == req.student.id`. | Negative test returning 403/404 when querying foreign application. |
| **T04** | Tampering | Student or verifier calls endpoint to mark application directly as `APPROVED` | State machine enforcement; only `SCHOLARSHIP_ADMIN` can transition to `APPROVED` with reason. | Negative test verifying unauthorized status change is rejected and audited. |
| **T05** | Repudiation | Admin denies approving/rejecting a scholarship | Append-only status history and audit log capture actor ID, timestamp, and decision reason. | Verify database status history records exact actor and reason. |
| **T06** | Information Disclosure | SQL Injection attempting data exfiltration | 100% parameterized queries using `mssql` request inputs or sanitized ORM layer. | Parameterized queries test with SQL injection strings. |
| **T07** | Information Disclosure | Unauthenticated or cross-student download of sensitive scholarship documents | Files stored in private blob storage; served exclusively through authenticated API endpoint. | Direct blob access blocked; unauthorized API request returns 403. |
| **T08** | Tampering / File Upload Abuse | Executable or oversized file uploaded to server | Mime type allowlisting (PDF, PNG, JPEG), 10MB file size ceiling, opaque UUID blob names. | Upload of `.exe` or >10MB file rejected with 400. |
| **T09** | Information Disclosure (XSS) | Malicious script injected in scholarship description or verifier comments | Output sanitization, strict React JSX escaping, Helmet Content Security Policy headers. | Script tag stored as text; rendered inert without execution. |
| **T10** | Cross-Site Request Forgery (CSRF) | Cross-site forged request mutating student applications | `SameSite=Strict`/`Lax` cookie policy, CSRF protection headers on state-changing requests. | Mutation without valid credentials and origin fails. |
