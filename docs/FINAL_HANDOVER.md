# ScholarSync — Final Project Handover Document

## 1. Project Overview & Mission
**ScholarSync** is a unified academic scholarship application, verification, tracking, and governance platform. It solves the fragmentation of college scholarships by connecting students, faculty verifiers, scholarship administrators, and system administrators into one transparent, traceable, role-protected workflow.

## 2. Implemented Features
- **Public**:
  - Landing page highlighting product USP, how it works, and featured opportunities.
  - Searchable, filterable scholarship directory with live pagination and category filters.
  - Detailed scholarship preview with award details, deadline, and eligibility criteria.
  - Student self-registration (strictly enforced to `STUDENT` role) and secure login.
- **Student Lifecycle**:
  - Comprehensive profile management (department, study year, CGPA, annual income, domicile, category).
  - Deterministic Explainable Eligibility Center: evaluates criteria and gives clear reasons (eligible, ineligible, or missing profile data).
  - Application draft creator, document checklist, and secure file uploader (PDF/PNG/JPEG up to 10MB).
  - Application tracking dashboard with full immutable status transition timeline.
  - Clarification loop: students can review feedback from faculty verifiers and resubmit responses directly in-app.
- **Faculty Verifier Lifecycle**:
  - Assigned application review queue (isolated to cases specifically assigned to the verifier).
  - Document authentication and verification notes.
  - Clarification request workflow with mandatory explanation.
  - Recommendation engine (`RECOMMENDED_FOR_APPROVAL` or `RECOMMENDED_FOR_REJECTION`).
  - Separation of duties: verifier cannot directly grant final approval under default institutional policy.
- **Scholarship Administrator Lifecycle**:
  - Scholarship creator with dynamic rule criteria builder (field key, operator, expected value, display reason).
  - Program lifecycle management (Draft, Publish, Close).
  - Faculty verifier assignment.
  - Official final grant decisions (Approve/Reject) with mandatory documented justification.
  - Real-time aggregate analytics and fund disbursement metrics.
- **System Administrator Lifecycle**:
  - Account and role governance (`STUDENT`, `VERIFIER`, `SCHOLARSHIP_ADMIN`, `SYSTEM_ADMIN`).
  - Account activation/deactivation.
  - Restricted security and operational audit trail with correlation IDs.

## 3. Test Evidence & Automated Verification
- **Automated Test Suite**: 9/9 tests passing (`npm test`):
  - `Auth Security: Public registration MUST strictly enforce role STUDENT` (PASS)
  - `Auth Security: User credentials verify securely via bcrypt` (PASS)
  - `Eligibility Engine: Evaluates numeric GTE and LTE accurately` (PASS)
  - `Eligibility Engine: Evaluates BETWEEN operator properly` (PASS)
  - `Eligibility Engine: Returns MISSING_DATA when profile value is absent` (PASS)
  - `Eligibility Engine: Overall evaluation aggregates missing fields and mandatory status` (PASS)
  - `Workflow State Machine: Application lifecycle transitions correctly and preserves audit trail` (PASS)
  - `BOLA Protection: Student cannot query another student applications` (PASS)
  - `Analytics Aggregation: Metrics reconcile without exposing direct PII` (PASS)
- **Production Build**: Verified with Vite 5 (`npm run build`). Single-origin Express hosting verified on port 5000.

## 4. Local Demo Mode vs. Azure Cloud Architecture
- **Local Demo Mode (`DEMO_MODE=true`)**:
  - Active out-of-the-box when Azure SQL/Blob credentials are not set.
  - Uses file-backed persistent JSON database and local uploads directory (`server/data/uploads`).
  - Includes quick-test one-click account buttons on the top demo banner.
- **Azure Production Integration (`DEMO_MODE=false`)**:
  - Relational Database: Microsoft Azure SQL Database (`mssql` driver with connection pooling).
  - Object Storage: Azure Blob Storage (`@azure/storage-blob`) with private container `scholarship-documents` and anonymous access disabled.
  - Hosting: Linux Azure App Service serving both React build and Express REST API from the same origin.
  - IaC: Parameterized Bicep template (`infra/bicep/main.bicep`) for one-click deployment.

## 5. Power BI Analytics Deliverable
- Aggregate SQL views created: `dbo.vw_PowerBI_ApplicationMetrics`, `dbo.vw_PowerBI_DepartmentMetrics`, `dbo.vw_PowerBI_ScholarshipMetrics`.
- DAX measures defined in `powerbi/README.md` (`TotalApplications`, `TotalApproved`, `ApprovalRate`, `TotalFundsDisbursed`, `AvgApplicantCGPA`).
- **Licensing note**: Free Power BI Desktop is used for report creation; Azure for Students credits do not include Power BI Pro or paid Fabric capacity. Public "Publish to Web" is prohibited for private student data.

## 6. How to Run Locally
1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Seed demo dataset:
   ```bash
   npm run seed
   ```
3. Run automated tests:
   ```bash
   npm test
   ```
4. Build client production bundle:
   ```bash
   npm run build
   ```
5. Start the full application:
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your browser.

## 7. Demo Login Credentials
Password for all demo accounts: `Password123!`
- **Student**: `student@scholarsync.edu`
- **Faculty Verifier**: `verifier@scholarsync.edu`
- **Scholarship Admin**: `admin@scholarsync.edu`
- **System Admin**: `sysadmin@scholarsync.edu`
