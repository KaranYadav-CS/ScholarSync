# ScholarSync — Smart Scholarship Application, Verification & Tracking Platform

> **Scholarships, simplified. Decisions, traceable.**

ScholarSync is a cloud-ready academic web application designed to connect scholarship discovery, explainable rule-based eligibility, draft applications, private document handling, faculty verification, clarification loops, administrative decisions, operational analytics, and immutable audit trails in one role-based system.

---

## 🌟 Key Features & USPs

1. **Complete Lifecycle in One Workflow**:
   - Discover &rarr; Check Eligibility &rarr; Apply &rarr; Upload Documents &rarr; Verify &rarr; Clarify &rarr; Recommend &rarr; Decide &rarr; Track &rarr; Analyze &rarr; Audit.
2. **Explainable Deterministic Eligibility Engine**:
   - Rule-based evaluator using allowlisted fields (`cgpa`, `annual_family_income`, `department`, `study_year`, `domicile_state`, `category`) and operators (`EQ`, `GT`, `BETWEEN`, `IN`, etc.).
   - Transparently explains why a student qualifies or does not qualify, and highlights missing profile fields.
3. **Role-Based Workspaces**:
   - **Student**: Profile completion, explainable eligibility check, application draft submission, private document upload, status tracking, clarification response.
   - **Faculty Verifier**: Isolated assigned review queue, certificate verification, clarification requests, approval/rejection recommendations.
   - **Scholarship Administrator**: Create & publish opportunities with dynamic criteria builder, verifier assignment, final immutable grant approval/rejection with mandatory reasons, aggregate dashboard.
   - **System Administrator**: User role governance (`STUDENT`, `VERIFIER`, `SCHOLARSHIP_ADMIN`, `SYSTEM_ADMIN`), activation/deactivation, restricted audit trail.
4. **Cloud-Ready Architecture (DP-900 / Azure)**:
   - **Modular Monolith**: React + Vite frontend and Node.js + Express backend served from the same origin on Azure App Service.
   - **Database**: Microsoft Azure SQL Database (3NF schema with 9 core normalized entities, stored procedures, triggers, and aggregate reporting views).
   - **Storage**: Azure Blob Storage with private containers and opaque UUID blob keys.
   - **Out-of-the-Box Local Demo Mode**: Runs locally without requiring immediate cloud credentials using file-backed persistent JSON storage and local file streaming.
5. **Power BI Analytics Deliverable**:
   - Dedicated reporting views (`vw_PowerBI_*`), DAX measures, and setup guide for Microsoft Power BI Desktop.

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- Node.js LTS (v18, v20, or v22+)
- Windows, macOS, or Linux

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Seed Demo Dataset
```bash
npm run seed
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build & Start the Full Application
```bash
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🔑 Demo Login Accounts

All accounts share the default demo password: **`Password123!`**
*(You can also use the one-click quick switch buttons on the top Demo Banner)*

| Role | Email | Password | Primary Functions |
|---|---|---|---|
| **Student** | `student@scholarsync.edu` | `Password123!` | Check eligibility, upload documents, submit applications, respond to verifiers |
| **Faculty Verifier** | `verifier@scholarsync.edu` | `Password123!` | Review assigned applications, inspect certificates, request clarification, recommend outcomes |
| **Scholarship Admin** | `admin@scholarsync.edu` | `Password123!` | Create/publish scholarships, assign verifiers, commit final approval/rejection decisions |
| **System Admin** | `sysadmin@scholarsync.edu` | `Password123!` | Manage user accounts, assign roles, inspect security audit logs |

---

## 🗄️ Relational Database Model (3NF)

The database schema (`database/schema.sql`) implements the 9 core entities:
1. `Users` — Primary user accounts, bcrypt password hashes, roles, status.
2. `Students` — Student profile attributes (CGPA, department, annual income, domicile, category).
3. `Scholarships` — Opportunities, award amounts, deadlines, and publishing states.
4. `EligibilityCriteria` — One-row-per-rule criteria with allowlisted fields and operators.
5. `Applications` — Application lifecycle states, assigned verifier, notes, final decisions.
6. `Documents` — Metadata for file bytes stored in Azure Blob Storage.
7. `Verifications` — Verification logs and review comments.
8. `ApplicationStatusHistory` — Immutable timeline of every workflow transition.
9. `AuditLogs` — Centralized security and administrative audit trail.

---

## ☁️ Azure Cloud Deployment

- **Infrastructure as Code (IaC)**: Deploy Azure App Service, Azure SQL Database, and Azure Blob Storage in one command using `infra/bicep/main.bicep`.
- **Portal Guide**: Step-by-step instructions for Azure for Students in `docs/azure-manual-setup.md`.
- **CI/CD**: GitHub Actions workflows in `.github/workflows/ci.yml` and `.github/workflows/deploy-azure.yml`.

---

## 📊 Power BI Analytics

Connect Power BI Desktop to Azure SQL Database using instructions in `powerbi/README.md`.
Includes DAX measures for `TotalApplications`, `TotalApproved`, `ApprovalRate`, `TotalFundsDisbursed`, and `AvgApplicantCGPA`.
