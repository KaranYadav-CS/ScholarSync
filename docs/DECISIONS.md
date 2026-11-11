# ScholarSync — Architectural & Governance Decisions

## Documented Safe Defaults
1. **Approval Policy**: Default policy gives the assigned Verifier power to review, request clarification, and submit a Recommendation (`RECOMMENDED_FOR_APPROVAL` or `RECOMMENDED_FOR_REJECTION`). Only the `SCHOLARSHIP_ADMIN` holds final approval or rejection authority with a mandatory reason.
2. **Account Provisioning**: Public registration always defaults to role `STUDENT`. Verifiers and Administrators are provisioned via CLI seed script (`npm run seed`) or authorized admin interface.
3. **Draft Applications**: Drafts (`DRAFT`) are supported to allow incremental document upload before final submission.
4. **Duplicate Application Policy**: One active application per student per scholarship (unique constraint on `(student_id, scholarship_id)`).
5. **Document Storage Policy**: File bytes are stored strictly in private blob storage (or local disk in demo mode) with opaque UUID keys. SQL only stores metadata.
6. **Local Demo Mode**: Seamless local fallback repository when Azure SQL and Azure Blob credentials are absent, providing fictional sample records and real file streaming.

## Decisions Pending Faculty / Institutional Confirmation
- Confirmation of multi-stage approval workflow if committee approvals are required.
- Retention period for student documents after scholarship cycle closes.
- Institutional email server configuration for automated password recovery.
- Power BI licensing model (Desktop free authoring vs. Pro/PPU tenant embedding).
