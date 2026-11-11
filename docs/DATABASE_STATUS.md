# ScholarSync — Database Architecture & Status Report

**Target Production Database:** Microsoft Azure SQL Database (SQL Server engine)  
**Driver:** `mssql` / Tedious with connection pooling  
**Database Design Standard:** Third Normal Form (3NF) across 9 normalized entities  
**Location of Scripts:** `database/`

---

## 1. Database Configuration Abstraction

ScholarSync uses a decoupled database adapter pattern in `server/src/database/index.js`:

```text
               ┌────────────────────────────────────────────────────────┐
               │           ScholarSync Database Abstraction            │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌───────────────────────────┐                 ┌───────────────────────────┐
     │  SQL Server / Azure SQL   │                 │     Local Development     │
     │     Database Adapter      │                 │     Demo Mode Adapter     │
     │      (mssql pool)         │                 │   (File-backed JSON DB)   │
     └───────────────────────────┘                 └───────────────────────────┘
```

1. **Local Development (Default)**:
   - When Azure SQL or local SQL Server credentials are not set (or `DEMO_MODE=true`), the app uses the local persistent JSON adapter with seed data (`server/data/local-db.json`).
   - Enables full offline development, verification, and automated testing with zero dependencies.
2. **Local SQL Server (Optional Dev Setup)**:
   - Connects to a local SQL Server instance (`localhost:1433`) using SQL authentication with `SQL_SERVER_HOST=localhost` and `SQL_SERVER_TRUST_CERT=true`.
3. **Microsoft Azure SQL Database (Production)**:
   - Connects to Azure SQL Server (`<name>.database.windows.net`) with encryption (`encrypt: true`) and connection pooling (10 connections, 30s timeout).

---

## 2. Entity Relational Design & Constraints (3NF)

### 2.1 The 9 Core Entities
1. **`Users`**: Primary accounts.
   - *PK*: `user_id` (UNIQUEIDENTIFIER)
   - *Constraints*: `UQ_Users_Email` (UNIQUE), `CK_Users_Role` (`STUDENT`, `VERIFIER`, `SCHOLARSHIP_ADMIN`, `SYSTEM_ADMIN`), `CK_Users_Status` (`ACTIVE`, `DISABLED`, `PENDING`).
2. **`Students`**: Extended student academic profiles.
   - *PK*: `student_id` (UNIQUEIDENTIFIER)
   - *FK*: `user_id` &rarr; `Users(user_id)` ON DELETE CASCADE
   - *Constraints*: `UQ_Students_UserId` (1:1 with Users), `CK_Students_CGPA` (`0.00` to `10.00`), `CK_Students_StudyYear` (`1` to `6`), `CK_Students_Income` (`>= 0.00`).
3. **`Scholarships`**: Scholarship opportunities catalog.
   - *PK*: `scholarship_id` (UNIQUEIDENTIFIER)
   - *FK*: `created_by_user_id` &rarr; `Users(user_id)`
   - *Constraints*: `CK_Scholarships_Status` (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`), `CK_Scholarships_Dates` (`deadline_at > application_start_at`), `CK_Scholarships_Award` (`award_amount >= 0.00`).
4. **`EligibilityCriteria`**: Atomic one-row-per-rule eligibility requirements.
   - *PK*: `criterion_id` (UNIQUEIDENTIFIER)
   - *FK*: `scholarship_id` &rarr; `Scholarships(scholarship_id)` ON DELETE CASCADE
   - *Constraints*: `CK_Criteria_FieldKey` (`cgpa`, `annual_family_income`, `department`, `study_year`, `domicile_state`, `category`), `CK_Criteria_Operator` (`EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE`, `IN`, `BETWEEN`).
5. **`Applications`**: Student application submissions.
   - *PK*: `application_id` (UNIQUEIDENTIFIER)
   - *FKs*: `student_id` &rarr; `Students`, `scholarship_id` &rarr; `Scholarships`, `assigned_verifier_user_id` &rarr; `Users`, `decision_by_user_id` &rarr; `Users`.
   - *Constraints*: `UQ_Applications_Student_Scholarship` (Strictly enforces one application per student per scholarship), `CK_Applications_Status` (Validates 11 allowlisted lifecycle statuses).
6. **`Documents`**: Metadata for uploaded certificates (bytes stored in Blob Storage).
   - *PK*: `document_id` (UNIQUEIDENTIFIER)
   - *FKs*: `application_id` &rarr; `Applications` ON DELETE CASCADE, `uploaded_by_user_id` &rarr; `Users`.
   - *Constraints*: `UQ_Documents_BlobName` (Opaque UUID uniqueness), `CK_Documents_SizeBytes` (`> 0` and `<= 10MB`), `CK_Documents_VerificationStatus` (`PENDING`, `ACCEPTED`, `REJECTED`, `REPLACED`).
7. **`Verifications`**: Faculty review and verification events.
   - *PK*: `verification_id` (UNIQUEIDENTIFIER)
   - *FKs*: `application_id` &rarr; `Applications`, `verifier_user_id` &rarr; `Users`.
   - *Constraints*: `CK_Verifications_Action` (`REVIEW_STARTED`, `DOCUMENTS_VERIFIED`, `CLARIFICATION_REQUESTED`, `RECOMMEND_APPROVAL`, `RECOMMEND_REJECTION`).
8. **`ApplicationStatusHistory`**: Complete audit timeline of every state transition.
   - *PK*: `history_id` (UNIQUEIDENTIFIER)
   - *FKs*: `application_id` &rarr; `Applications` ON DELETE CASCADE, `changed_by_user_id` &rarr; `Users`.
9. **`AuditLogs`**: Centralized security, role mutation, and operational event log.
   - *PK*: `audit_id` (BIGINT IDENTITY(1,1))
   - *FK*: `actor_user_id` &rarr; `Users(user_id)`

---

## 3. Database Indexes

- `IX_Applications_Student`: Clustered lookup for student's own applications.
- `IX_Applications_Scholarship_Status`: Facilitates fast administrative filtering.
- `IX_Applications_Verifier_Status`: Accelerates verifier assigned queue queries.
- `IX_Scholarships_Status_Deadline`: Index on published catalog opportunities.
- `IX_Documents_Application`: Speeds up document checklist queries.
- `IX_StatusHistory_Application`: Chronological timeline queries (`changed_at DESC`).
- `IX_AuditLogs_EventTime`: Fast audit trail retrieval.

---

## 4. Stored Procedures & Triggers

### Stored Procedures (`database/procedures.sql`)
1. **`dbo.usp_SubmitApplication`**:
   - Atomic transaction verifying application is in `DRAFT` status and at least one document is attached.
   - Transitions status to `SUBMITTED`, writes initial status history entry, and commits audit log in one transaction.
2. **`dbo.usp_ChangeApplicationStatus`**:
   - Atomic transaction recording status transitions (`APPROVED`, `REJECTED`, etc.) with mandatory decision reason.

### Triggers (`database/triggers.sql`)
1. **`dbo.trg_Users_UpdateTimestamp`**: Automatically updates `updated_at` column upon modifications.
2. **`dbo.trg_Applications_PreventStatusTampering`**: Protects finalized applications (`APPROVED` or `REJECTED`) from being modified directly outside authorized procedures.

---

## 5. SQL Views (`database/views.sql`)

1. `dbo.ApplicationSummaryView`: Operational join of applications, scholarships, students, verifiers, and document counts.
2. `dbo.vw_PowerBI_ApplicationMetrics`: Anonymized fact table for Power BI reporting.
3. `dbo.vw_PowerBI_DepartmentMetrics`: Aggregate metrics grouped by department.
4. `dbo.vw_PowerBI_ScholarshipMetrics`: Opportunity performance and disbursement totals.
5. `dbo.vw_PowerBI_VerificationPerformance`: Verifier turnaround and recommendation metrics.
6. `dbo.vw_PowerBI_ProcessingTimeMetrics`: Processing turnaround in hours and days.
7. `dbo.vw_PowerBI_StudentEligibilityMetrics`: Evaluated criteria metrics across programs.
