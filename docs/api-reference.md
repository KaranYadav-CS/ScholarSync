# ScholarSync — REST API Reference

All requests and responses use JSON. The standard envelope format is:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "correlationId": "req-123456", "timestamp": "2026-11-11T12:00:00Z" }
}
```

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register`
  - Body: `{ full_name, email, password }`
  - Creates account with role `STUDENT`.
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Sets HttpOnly signed JWT cookie `scholarsync_token`.
- `POST /api/auth/logout`
  - Clears cookie session.
- `GET /api/auth/me`
  - Returns authenticated user details and student profile if applicable.

## 2. Student Profile (`/api/students`)
- `GET /api/students/me`
  - Returns student profile (CGPA, department, study year, income, domicile, category).
- `PUT /api/students/me`
  - Updates student profile.

## 3. Scholarships Catalog & Eligibility (`/api/scholarships`)
- `GET /api/scholarships`
  - Lists published scholarships (query params: `search`, `category`, `department`, `page`, `limit`).
- `GET /api/scholarships/:id`
  - Returns scholarship details and eligibility criteria.
- `GET /api/scholarships/:id/eligibility`
  - Evaluates student's profile against criteria. Returns `{ isEligible, missingFields, results: [{ criterionId, fieldKey, passed, reason }] }`.
- `POST /api/scholarships` *(Scholarship Admin)*
  - Creates new scholarship draft.
- `PUT /api/scholarships/:id` *(Scholarship Admin)*
  - Updates scholarship details and criteria.
- `POST /api/scholarships/:id/publish` *(Scholarship Admin)*
  - Validates and transitions scholarship to `PUBLISHED`.
- `POST /api/scholarships/:id/close` *(Scholarship Admin)*
  - Transitions scholarship to `CLOSED`.

## 4. Applications (`/api/applications`)
- `GET /api/applications`
  - Students see own applications; Verifiers see assigned applications; Admins see all.
- `POST /api/applications` *(Student)*
  - Body: `{ scholarship_id, submission_notes }`
  - Creates draft application.
- `GET /api/applications/:id`
  - Returns application details, document list, status history, verifications.
- `POST /api/applications/:id/submit` *(Student)*
  - Validates criteria, deadline, and documents; transitions to `SUBMITTED`.
- `POST /api/applications/:id/assign-verifier` *(Scholarship Admin)*
  - Body: `{ verifier_user_id }`
  - Transitions to `UNDER_REVIEW`.
- `POST /api/applications/:id/clarification-response` *(Student)*
  - Body: `{ message, replacement_document_id? }`
  - Transitions back to `RESUBMITTED` / `UNDER_REVIEW`.
- `POST /api/applications/:id/decision` *(Scholarship Admin)*
  - Body: `{ status: "APPROVED" | "REJECTED", reason: string }`
  - Records final immutable decision with mandatory reason.

## 5. Documents (`/api/documents`)
- `POST /api/applications/:id/documents` *(Student)*
  - Form-data: `file`, `document_type`
  - Stores opaque blob and records SQL metadata.
- `GET /api/documents/:documentId/download`
  - Authenticated and authorized download streaming.

## 6. Verifications (`/api/verifications`)
- `POST /api/applications/:id/verifications` *(Assigned Verifier)*
  - Body: `{ action: "DOCUMENTS_VERIFIED" | "REVIEW_STARTED", comments }`
- `POST /api/applications/:id/clarification-requests` *(Assigned Verifier)*
  - Body: `{ reason }`
  - Transitions application to `CLARIFICATION_REQUESTED`.
- `POST /api/applications/:id/recommendation` *(Assigned Verifier)*
  - Body: `{ recommendation: "RECOMMEND_APPROVAL" | "RECOMMEND_REJECTION", comments }`
  - Transitions to `RECOMMENDED_FOR_APPROVAL` or `RECOMMENDED_FOR_REJECTION`.

## 7. Analytics & Audit (`/api/admin`)
- `GET /api/admin/analytics/overview` *(Scholarship Admin, System Admin)*
  - Returns totals, status breakdowns, disbursement metrics.
- `GET /api/admin/analytics/by-department`
  - Returns department application counts and approval ratios.
- `GET /api/admin/analytics/by-scholarship`
  - Returns scholarship-level performance metrics.
- `GET /api/admin/audit-logs` *(Scholarship Admin, System Admin)*
  - Filterable security and workflow audit trail.
- `GET /api/admin/users` *(System Admin)*
  - List of all system users.
- `PUT /api/admin/users/:userId/role` *(System Admin)*
  - Change user role with audit logging.
- `PUT /api/admin/users/:userId/status` *(System Admin)*
  - Enable or disable account.
