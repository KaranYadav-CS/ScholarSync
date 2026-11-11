# ScholarSync — Unique Selling Propositions (USP)

**Project:** ScholarSync — Smart Scholarship Application, Verification & Tracking Platform  
**Document:** `USP.md`  
**Version:** 1.0  
**Status:** Product positioning baseline for academic review and implementation

> **Positioning note:** The points below are ScholarSync's project-level differentiators. They are not a claim that no other scholarship platform offers similar functionality. A USP should be demonstrated by a working feature, a clear workflow, or verifiable evidence—not only by a presentation statement.

---

## 1. Product Statement

ScholarSync is a secure, cloud-based scholarship lifecycle platform that connects scholarship discovery, explainable rule-based eligibility, application submission, private document handling, faculty verification, clarification, final decisions, student tracking, analytics, and audit history in one role-based application.

### One-line value proposition

**One transparent and traceable platform for the complete scholarship journey—from discovering an opportunity to receiving a documented decision.**

### Tagline

**Scholarships, simplified. Decisions, traceable.**

## 2. Primary Users and Their Needs

| User group | Current problem / need | ScholarSync value |
|---|---|---|
| Students | Opportunities, criteria, document requirements, and application status may be spread across separate notices, forms, emails, or spreadsheets | A single place to discover scholarships, understand eligibility, apply, upload documents, and follow progress |
| Faculty / Verifiers | Reviewing applications and supporting documents can be repetitive and difficult to track consistently | Assigned work queues, consistent review actions, clarification loop, and review history |
| Scholarship Administrators | Scholarship rules, assignments, decisions, and reports need coordinated administration | Scholarship management, rule configuration, verifier assignment, final decision queue, and aggregate analytics |
| System Administrators | User access and sensitive operations need governance | Role management, restricted administrative controls, and attributable audit events |

## 3. Core Unique Selling Propositions

### USP 1 — Complete Scholarship Lifecycle in One Workflow

**What is different about the project:** ScholarSync is not only a scholarship listing page or an application form. The designed workflow continues through eligibility, submission, private documents, verification, clarification, final decision, tracking, analytics, and audit.

**User benefit:** Students do not have to treat discovery, submission, and status tracking as separate experiences. Faculty and administrators use connected workflow records instead of disconnected manual steps.

**How to demonstrate it:** Complete one sample application from discovery to final decision and show the same application reference in the student, verifier, and administrator views.

### USP 2 — Explainable, Rule-Based Eligibility Checking

**What is different about the project:** Eligibility is represented as structured criteria linked to a scholarship. The application evaluates supported fields and operators and can explain whether the student is eligible, ineligible, or missing profile information.

**User benefit:** Students can understand why an opportunity appears suitable before spending time preparing an application.

**How to demonstrate it:** Configure two or three sample scholarship rules, test eligible/ineligible/missing-data profiles, and display the matched or unmet criteria.

**Accuracy boundary:** This is a deterministic, rule-based eligibility engine. It is not AI-based decision-making, legal eligibility certification, or an automatic government verification service.

### USP 3 — Secure Separation of Application Records and Documents

**What is different about the project:** Structured records are stored in Azure SQL Database, while document bytes are kept in a private Azure Blob Storage container. The database stores document metadata and an opaque blob name rather than a public file URL.

**User benefit:** The project has a clear data boundary and can enforce access checks before a document is viewed or downloaded.

**How to demonstrate it:** Show an authorized student's own file, then show that another student or an unassigned verifier is denied access to the same file.

### USP 4 — Role-Based, Assignment-Aware Verification

**What is different about the project:** Student, verifier, Scholarship Admin, and System Admin responsibilities are separated. A verifier sees assigned cases, records review actions, and recommends an outcome; the default design reserves the final decision for the Scholarship Admin.

**User benefit:** Work is organized by responsibility, and a student cannot approve their own application by manipulating a request.

**How to demonstrate it:** Sign in with each role and show both permitted and denied actions. Demonstrate that hiding a button is not the only control—the API also rejects unauthorized requests.

### USP 5 — Traceable Clarification and Decision History

**What is different about the project:** Clarification requests, student responses, verifier actions, recommendations, and final decisions are retained as records. Status transitions are validated rather than being arbitrary text edits.

**User benefit:** A student and authorized reviewer can understand what happened and what action is pending.

**How to demonstrate it:** Request a missing certificate, respond as the student, reopen the case as verifier, and show the preserved timeline and reasons.

### USP 6 — Analytics That Support Administration

**What is different about the project:** The platform provides operational analytics for application counts, outcomes, scholarship-wise and department-wise patterns, and trends. Power BI is used for the formal analytics report, while the secured in-product dashboard can use backend aggregate endpoints.

**User benefit:** Administrators can monitor workflow volumes and outcomes without manually counting spreadsheet rows.

**How to demonstrate it:** Seed fictional data, compare aggregate counts with SQL query results, and show the same totals in the React dashboard and Power BI report.

**Privacy boundary:** Publicly embedded Power BI reports must never contain private student records. Secure Power BI sharing or embedding requires appropriate licensing/capacity. The website's private dashboard should enforce ScholarSync roles through its own backend.

### USP 7 — Academic Concepts Integrated into One Realistic System

**What is different about the project:** One application demonstrates system design, relational database design, cloud data services, and cloud security together rather than as unrelated lab examples.

**How to demonstrate it:**

- **System Design:** component architecture, modular monolith, user journeys, APIs, status lifecycle, and deployment.
- **RDBMS:** normalized tables, PK/FK relationships, constraints, indexes, views, stored procedures, triggers, and transactions.
- **Azure / DP-900 concepts:** Azure SQL for structured data, Blob Storage for unstructured files, and Power BI for analytics.
- **Cloud Security:** authentication, role and object-level authorization, secure file access, secrets management, network controls, and auditability.

### USP 8 — Practical, Maintainable Cloud Architecture

**What is different about the project:** The initial release uses a modular monolith and a small, coherent Azure stack. It avoids introducing microservices, multiple competing databases, or unnecessary platform dependencies.

**User benefit:** The team can focus on completing and testing the full workflow rather than maintaining overlapping services.

**How to demonstrate it:** Show the module boundaries, one deployment pipeline, the SQL database, Blob Storage integration, and documented Azure configuration.

## 4. USP Summary Matrix

| USP | User problem addressed | Feature / technical proof | Demo evidence |
|---|---|---|---|
| End-to-end lifecycle | Fragmented scholarship process | Connected discovery-to-audit workflow | One application moving through every stage |
| Explainable eligibility | Unclear eligibility rules | Structured, server-evaluated criteria | Eligible, ineligible, incomplete-profile examples |
| Private document handling | Sensitive documents need controlled access | Azure Blob private container + backend authorization | Unauthorized download test is denied |
| Assignment-aware review | Unstructured faculty review | Assigned verifier queue and server-side checks | Unassigned verifier is denied |
| Traceable decisions | Status changes lack context | Status history, verifier comments, reasoned final decision | Full application timeline |
| Actionable analytics | Manual reporting effort | SQL reporting view, React aggregate dashboard, Power BI report | Dashboard totals reconcile with SQL |
| Academic integration | Course concepts demonstrated separately | One architecture integrates all four subjects | Design, SQL, Azure, and security evidence |
| Maintainable cloud stack | Overly complex student project architecture | Modular monolith and a limited service set | Deploy and explain the full stack |

## 5. What ScholarSync Does Not Claim

The implementation and presentation must not claim features that are outside the approved scope or not implemented and tested.

- **No AI-based eligibility decisions** in the baseline. Eligibility is rule-based.
- **No OCR or automatic document authenticity verification** in the baseline. Faculty/verifiers review documents.
- **No direct integration with government scholarship portals** in the baseline.
- **No payment or fund-disbursement processing** in the baseline.
- **No native Android/iOS application** in the baseline; the web application is responsive.
- **No microservices architecture** in the baseline; use a modular monolith.
- **No guarantee of scholarship approval.** The platform manages applications and workflow; the authorized institution makes decisions.
- **No claim of legal, regulatory, or institutional certification** unless separately assessed and formally approved.

These boundaries protect the credibility of the project and keep the first release achievable.

## 6. Suggested Demonstration Script

A strong demonstration can use fictional student records and sample scholarships:

1. Open the public scholarship listing and filter opportunities.
2. Sign in as Student A and complete a sample profile.
3. Show an eligibility result with an unmet criterion and explain why.
4. Update the profile and show an eligible result.
5. Apply and upload sample, non-sensitive documents.
6. Sign in as another student and attempt to open Student A's application/document; access must be denied.
7. Sign in as the assigned verifier, request clarification, and record a reason.
8. Return as Student A, respond to clarification, and upload a corrected sample file.
9. Return as verifier and record a recommendation.
10. Sign in as Scholarship Admin and record the final decision with a reason.
11. Return as Student A and show the final status and history.
12. Show aggregate application analytics in the React administrator dashboard and the Power BI report.
13. Show the corresponding audit records without exposing secrets or file contents.

## 7. How to Validate the USP Claims

Do not state that a feature is complete until the evidence exists. Use this table during development:

| Claim | Minimum evidence before claiming it |
|---|---|
| Complete lifecycle | End-to-end test passes from discovery to final status |
| Eligibility is explainable | Automated tests for every supported operator and boundary case |
| Documents are private | Storage public access disabled and negative authorization test passes |
| Roles are enforced | API-level role matrix and object ownership tests pass |
| Decisions are traceable | Status history/audit record is created for every permitted transition |
| Analytics are accurate | Power BI/dashboard totals reconcile with trusted SQL queries |
| Cloud deployment works | Live Azure URL passes smoke tests; secrets are configured outside source control |
| Maintainable architecture | README, module boundaries, setup steps, tests, and deployment workflow are present |

## 8. Short Project Pitch

ScholarSync is a secure scholarship lifecycle platform that brings students, faculty verifiers, and scholarship administrators into one connected workflow. Students can discover opportunities, check rule-based eligibility, submit applications, upload documents, respond to clarification requests, and track decisions. Verifiers review assigned applications and record recommendations, while authorized administrators manage scholarship rules, make final decisions, and monitor aggregate analytics. The system uses a relational Azure SQL database, private Azure Blob Storage, a React and Node.js modular-monolith application, and Power BI reporting, with role-based access control and an auditable status history.

---

## References

- [Microsoft — What is Azure for Students?](https://learn.microsoft.com/en-us/azure/education-hub/about-azure-for-students)
- [Microsoft — Power BI license types and capabilities](https://learn.microsoft.com/en-us/power-bi/fundamentals/service-features-license-type)
- [Microsoft — Publish to web from Power BI (public access warning)](https://learn.microsoft.com/en-in/power-bi/collaborate-share/service-publish-to-web)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
