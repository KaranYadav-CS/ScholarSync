# ScholarSync — Database Guide

This directory contains Microsoft Azure SQL Database / Microsoft SQL Server compatible schemas and scripts.

## Entity Relational Design (3NF)
ScholarSync is built around 9 core normalized entities:
1. `Users` — Authentication credentials, roles (`STUDENT`, `VERIFIER`, `SCHOLARSHIP_ADMIN`, `SYSTEM_ADMIN`), account status.
2. `Students` — Student profiles containing CGPA, department, program, annual family income, domicile, category.
3. `Scholarships` — Scholarship catalog with award details, publication lifecycle, and deadlines.
4. `EligibilityCriteria` — Normalized one-row-per-rule criteria with allowlisted fields and operators (`EQ`, `GT`, `BETWEEN`, etc.).
5. `Applications` — Tracks application status, assigned verifier, notes, and final decisions.
6. `Documents` — Metadata for securely stored files in Azure Blob Storage.
7. `Verifications` — Append-only verification log and comments recorded by assigned verifiers.
8. `ApplicationStatusHistory` — Immutable timeline of every workflow status transition.
9. `AuditLogs` — Centralized security and administrative audit trail.

## Files
- `schema.sql`: Full DDL defining tables, primary keys, foreign keys, unique constraints, check constraints, and performance indexes.
- `views.sql`: `ApplicationSummaryView` for operational queries and `vw_PowerBI_*` for anonymized analytics and Power BI reporting.
- `procedures.sql`: Stored procedures for atomic transactions (`usp_SubmitApplication`, `usp_ChangeApplicationStatus`).
- `triggers.sql`: Triggers for timestamp updates and preventing direct tampering with final decisions.
- `seed-demo.sql`: Comprehensive realistic sample dataset for demonstration and local testing.

## Running in Azure SQL
1. Connect via Azure Data Studio, SQL Server Management Studio (SSMS), or Azure Portal Query Editor.
2. Execute `schema.sql`.
3. Execute `views.sql`.
4. Execute `procedures.sql`.
5. Execute `triggers.sql`.
6. (Optional for demo) Execute `seed-demo.sql`.
